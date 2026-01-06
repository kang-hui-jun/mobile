import { ThemedView } from "@/components/themed-view";
import { useMobileLayoutV2 } from "@/service/universal";
import { useAuth } from "@/store";
import { handleLayout, LayoutData, shouldMapReferenceField } from "@/utils";
import { useEffect } from "react";
import { ScrollView, StyleSheet } from "react-native";

import { userNameField } from "@/constants/mobile";
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
  const client = useHttp();
  const { mobileLayout, setMobileLayout, user } = useAuth();
  const params = {
    entity: "SalesOrder",
    id: "",
    multipleLayoutId: "143-b71b29f5-76f0-4bdc-8b69-846e94f35586",
  };

  const { data, isLoading } = useMobileLayoutV2(params);

  useEffect(() => {
    if (data?.data) {
      const baseLayout: LayoutData = handleLayout(data.data);

      const initAsyncData = async (layoutData: LayoutData) => {
        const tasks: Promise<void>[] = [];
        for (const area of layoutData.areas) {
          for (const row of area.rows) {
            if (shouldMapReferenceField(row)) {
              if (row.name === userNameField) {
                row.defaultValue = user?.userId;
              }
              const task = (async () => {
                const [mainData, mapping, cascade] = await Promise.all([
                  // 映射主表
                  client("/gw/entity/initEntityMainData", {
                    params: {
                      id: row.defaultValue,
                      entity: row.entity,
                      fieldName: row.name,
                      actionType: "create",
                    },
                  }),

                  client("/gw/entity/GetEntityFieldMappingManager", {
                    params: {
                      id: row.defaultValue,
                      entity: row.entity,
                      fieldName: row.name,
                      actionType: "create",
                    },
                  }),

                  client("/gw/entity/GetEntityCascade", {
                    params: {
                      id: row.defaultValue,
                      entity: row.entity,
                      fieldName: row.name,
                    },
                  }),
                ]);

                row.value = mainData.data.data[row.name]?.value;

                if (mainData.data.hasDetailEntity) {
                  const detailData = await client(
                    "/gw/entity/initEntityDetailData",
                    {
                      params: {
                        id: row.defaultValue,
                        entity: row.entity,
                        fieldName: row.name,
                        actionType: "create",
                      },
                    }
                  );

                  console.log(detailData.data);
                }

                try {

                } catch (error) {
                  console.error(error);
                }
              })();

              tasks.push(task);
            }
          }
        }

        await Promise.all(tasks);

        setMobileLayout(layoutData);
      };

      const runAsyncUpdates = async () => {
        try {
          await initAsyncData(baseLayout);
        } catch (err) {
          console.error("异步数据加载失败", err);
          setMobileLayout(baseLayout);
        }
      };
      setMobileLayout(baseLayout);
      runAsyncUpdates();
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
                      <Button icon={Plus}>{key.value}</Button>
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
