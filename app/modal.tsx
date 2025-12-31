import { ThemedView } from "@/components/themed-view";
import { useMobileLayoutV2 } from "@/service/universal";
import { useAuth } from "@/store";
import { getCurrentDate, handleLayout } from "@/utils";
import { useEffect } from "react";
import { ScrollView, StyleSheet } from "react-native";

import { useHttp } from "@/utils/http";
import { Check as CheckIcon, Plus } from "@tamagui/lucide-icons";
import {
  Button,
  Card,
  Checkbox,
  Input,
  Label,
  Spinner,
  XStack,
  YStack,
} from "tamagui";

export default function ModalScreen() {
  const { mobileLayout, setMobileLayout } = useAuth();
  const client = useHttp();
  const { data, isLoading } = useMobileLayoutV2({
    entity: "SalesOrder",
    id: "",
    multipleLayoutId: "143-b71b29f5-76f0-4bdc-8b69-846e94f35586",
  });

  useEffect(() => {
    if (data?.data) {
      // 1. 先进行通用的布局转换
      const baseLayout = handleLayout(data.data);

      // 2. 紧接着进行特定的字段逻辑处理（比如 owningUser 的赋值）
      const initializedLayout = {
        ...baseLayout,
        areas: baseLayout.areas.map((area) => ({
          ...area,
          rows: area.rows.map((cell) => {
            if (cell.name === "owningUser") {
              // 返回新对象，保持不可变性
              return { ...cell, value: "123" };
            }
            if (cell.type === "picklist") {
              return {
                ...cell,
                value: baseLayout.pickList
                  .find((pick) => pick.fieldName === cell.name)
                  ?.options.find((opt) => opt.isDefault === "Y")?.lable,
              };
            }
            if (cell.type === "datetime") {
              return {
                ...cell,
                value: getCurrentDate(),
              };
            }
            return cell;
          }),
        })),
      };

      const initAsyncData = async () => {
        const newLayout = JSON.parse(JSON.stringify(initializedLayout));

        for (const item of newLayout.areas) {
          for (const cell of item.rows) {
            if (cell.type === "reference" && cell.defaultValue) {
              try {
                const entityFieldMappingManager = await client(
                  "/gw/entity/GetEntityFieldMappingManager",
                  {
                    params: {
                      id: cell.defaultValue,
                      entity: cell.entity || "",
                      fieldName: cell.name,
                      actionType: "create",
                    },
                  }
                );

                for (const item of entityFieldMappingManager.data) {
                  if (item.details) {
                    for (const detail of item.details) {
                      cell.value = detail[cell.name].value;
                    }
                  }
                }

                const entityCasade = await client(
                  "/gw/entity/GetEntityCascade",
                  {
                    params: {
                      id: cell.defaultValue,
                      entity: cell.entity,
                      fieldName: cell.name,
                    },
                  }
                );

                cell.referenceFilterCondition = entityCasade[cell.name].value;

                const response = await client("/gw/entity/initEntityMainData", {
                  params: {
                    id: cell.defaultValue,
                    entity: cell.entity || "",
                    fieldName: cell.name,
                    actionType: "create",
                  },
                });
                let searching = Object.values(response.data.data);
                const searchingLoop = (searching: any[]) => {
                  let arr: {
                    destName: string;
                    destValue: string;
                    destLabel: string;
                  }[] = [];
                  if (!searching.length) return;
                  for (const item of searching) {
                    if (item.cascade && Array.isArray(item.cascade)) {
                      for (const item1 of item.cascade) {
                        if (item1.result && item1.result[0]) {
                          arr.push({
                            destName: item1.mainField,
                            destLabel: item1.result[0].name,
                            destValue: item1.result[0].id,
                          });
                        }
                      }

                      item.cascade.forEach((item1: any) => {
                        if (item1.result && item1.result[0]) {
                          arr.push({
                            destName: item1.mainField,
                            destLabel: item1.result[0].name,
                            destValue: item1.result[0].id,
                          });
                        }
                      });
                    }

                    if (
                      item.cascade.cascade &&
                      Array.isArray(item.cascade.cascade)
                    ) {
                      arr.concat(searchingLoop(item?.cascade?.cascade) || []);
                    }
                  }
                  return arr;
                };

                let cascade: Array<{
                  destName: string;
                  destValue: string;
                  destLabel: string;
                }> = searchingLoop(searching) || [];

                searching = searching.concat(cascade);

                if (response?.data) {
                }
              } catch (error) {
                console.error("加载默认值失败:", error);
              }
            }
          }
        }
        // 全部请求完成后，一次性更新状态
        setMobileLayout(newLayout);
      };

      setMobileLayout(initializedLayout);
      initAsyncData();
    }
  }, [data]); // 仅监听 API 返回的数据

  if (isLoading) return <Spinner size="small" color="$green10" />;

  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        <YStack gap="$2" p="$2">
          {mobileLayout?.areas?.map((item) => (
            <Card
              key={item.id}
              elevate
              size="$4"
              bordered
              background={"#ffffff"}
            >
              <XStack p="$2">
                <Label size="$5" fontWeight={600}>
                  {item.title}
                </Label>
              </XStack>

              {item.rows.map((key) => (
                <XStack gap="$2" key={key.label} p="$2">
                  <Label width={80} htmlFor="name" size={"$3"}>
                    {key.label}
                  </Label>
                  {key.type === "text" && (
                    <Input
                      flex={1}
                      id="name"
                      placeholder="请输入"
                      size="$3"
                      defaultValue={key.value}
                    />
                  )}

                  {key.type === "checkbox" && (
                    <Checkbox size={"$3"}>
                      <Checkbox.Indicator>
                        <CheckIcon />
                      </Checkbox.Indicator>
                    </Checkbox>
                  )}

                  {key.type === "reference" && (
                    <XStack gap="$2" key={key.label} p="$2">
                      <Button icon={Plus}>{item.title}</Button>
                    </XStack>
                  )}
                </XStack>
              ))}
            </Card>
          ))}
        </YStack>
      </ScrollView>

      <XStack p={"$2"}>
        <Button width={"100%"}>click</Button>
      </XStack>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    height: 44,
    position: "fixed",
    bottom: 0,
    left: 0,
    zIndex: 99,
  },
});
