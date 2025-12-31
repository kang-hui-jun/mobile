import { ThemedView } from "@/components/themed-view";
import { useMobileLayoutV2 } from "@/service/universal";
import { useAuth } from "@/store";
import { handleLayout } from "@/utils";
import { useEffect } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { Button, Card, Input, Label, XStack, YStack } from "tamagui";

export default function TabTwoScreen() {
  const { mobileLayout, setMobileLayout } = useAuth();
  const { data, isLoading } = useMobileLayoutV2({
    entity: "SalesOrder",
    id: "",
    multipleLayoutId: "143-b71b29f5-76f0-4bdc-8b69-846e94f35586",
  });

  useEffect(() => {
    if (data?.data) {
      setMobileLayout(handleLayout(data?.data));
    }
  }, [data]);

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
                  <Input flex={1} id="name" placeholder="请输入" size="$3" />
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
