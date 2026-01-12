import { ThemedView } from "@/components/themed-view";
import { FormItem } from "@/components/ui/FormItem";
import { userNameField } from "@/constants";
import { useMobileLayoutV2 } from "@/service/universal";
import { useAuth } from "@/store";
import { handleLayout, LayoutData, shouldMapReferenceField } from "@/utils";
import { useHttp } from "@/utils/http";
import { Plus } from "@tamagui/lucide-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useRef } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button, Card, Label, Spinner, XStack, YStack } from "tamagui";

export default function ModalScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const { entity, multipleLayoutId, entityName } = useLocalSearchParams();
  const client = useHttp();
  const { mobileLayout, setMobileLayout, user, formData, setFormData } =
    useAuth();
  const params = {
    entity,
    id: "",
    multipleLayoutId,
  } as {
    entity: string;
    id: string;
    multipleLayoutId: string;
  };

  const { data, isLoading } = useMobileLayoutV2(params);

  useEffect(() => {
    if (data?.data) {
      const baseLayout: LayoutData = handleLayout(data.data);
      console.log([
        ...new Set(baseLayout.areas.flatMap((k) => k.rows).map((k) => k.type)),
      ]);

      const dataForm: Record<string, unknown> = {};
      for (const area of baseLayout.areas) {
        for (const row of area.rows) {
          if (row.type === "picklist") {
            const pick = baseLayout.pickList.find(
              (key) => key.fieldName === row.name
            );
            const defaultValue = pick?.options?.find(
              (opt) => opt.isDefault === "Y"
            )?.lable;
            dataForm[row.name] = defaultValue || "";
          } else {
            dataForm[row.name] = row.defaultValue || "";
          }
        }
      }
      setFormData(dataForm);
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
  }, [data]);

  const handleAdd = () => {
    if (mobileLayout) {
      setMobileLayout({
        ...mobileLayout,
        hasDetail: {
          ...mobileLayout.hasDetail,
          detailInfoAreas: [
            ...mobileLayout.hasDetail.detailInfoAreas,
            mobileLayout.hasDetail.detailInfoAreas[0],
          ],
        },
      });

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 300);
    }
  };

  const handleSubmit = () => {
    console.log(formData);
  };

  if (isLoading) return <Spinner size="small" color="$green10" />;

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: ("新建" + entityName) as string,
          headerShown: true, // 确保显示
        }}
      />
      <ScrollView ref={scrollViewRef}>
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
                <FormItem key={key.name} row={key} />
              ))}
            </Card>
          ))}

          {mobileLayout?.hasDetail?.detailEntityName && (
            <Card elevate size="$4" bordered background={"#ffffff"}>
              {mobileLayout?.hasDetail?.detailInfoAreas?.map((item, index) => (
                <Card key={item.id + index} background={"#ffffff"}>
                  <XStack p="$2">
                    <Label size="$5" fontWeight={600}>
                      明细{index}
                    </Label>
                  </XStack>

                  {item.rows.map((key) => (
                    <FormItem key={key.name} row={key} />
                  ))}
                </Card>
              ))}

              <XStack p={"$2"}>
                <Button
                  size={"$3"}
                  width={"100%"}
                  bg={"#FFFFFF"}
                  icon={Plus}
                  onPress={handleAdd}
                >
                  新建一项
                </Button>
              </XStack>
            </Card>
          )}
        </YStack>
      </ScrollView>

      <XStack p={"$2"}>
        <Button width={"100%"} onPress={handleSubmit}>
          click
        </Button>
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
