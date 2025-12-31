import { ThemedView } from "@/components/themed-view";
import { useMobileLayoutV2 } from "@/service/universal";
import { useAuth } from "@/store";
import { getCurrentDate, handleLayout } from "@/utils";
import { useEffect } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { Button, Card, Input, Label, XStack, YStack } from "tamagui";

export default function ModalScreen() {
  const { mobileLayout, setMobileLayout } = useAuth();
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

      setMobileLayout(initializedLayout);
    }
  }, [data]); // 仅监听 API 返回的数据

  if (isLoading) return <Text>加载中...</Text>;

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
                  <Input
                    flex={1}
                    id="name"
                    placeholder="请输入"
                    size="$3"
                    value={key.value}
                  />
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
