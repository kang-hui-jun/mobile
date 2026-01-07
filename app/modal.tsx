import { ThemedView } from "@/components/themed-view";
import { useMobileLayoutV2 } from "@/service/universal";
import { useAuth } from "@/store";
import { handleLayout, LayoutData, shouldMapReferenceField } from "@/utils";
import { useEffect, useRef } from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";

import { userNameField } from "@/constants";
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
import { Stack, useLocalSearchParams } from "expo-router";
import { Cell } from "@/types/mobile-layout";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function ModalScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const { entity, multipleLayoutId, entityName } = useLocalSearchParams();
  const client = useHttp();
  const { mobileLayout, setMobileLayout, user } = useAuth();
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
      }, 500);
    }
  };

  if (isLoading) return <Spinner size="small" color="$green10" />;

  const Row = ({ row }: { row: Cell }) => {
    return (
      <XStack gap="$2" key={row.label} p="$2">
        <Label width={80} htmlFor="name" size={"$3"}>
          {row.label}
        </Label>
        <Input
          flex={1}
          id="name"
          placeholder="请输入"
          size="$3"
          defaultValue={row.value}
        />
      </XStack>
    );
  };

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
                <Row row={key} />
              ))}
            </Card>
          ))}

          {mobileLayout?.hasDetail?.detailInfoAreas?.map((item, index) => (
            <Card
              key={item.id + index}
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
                <Row row={key} />
              ))}

              <XStack p={"$2"}>
                <Button
                  size={"$3"}
                  width={"100%"}
                  icon={Plus}
                  onPress={handleAdd}
                >
                  新建一项
                </Button>
              </XStack>
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
