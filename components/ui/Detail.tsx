import { Button, Card, Label, ScrollView, XStack, YStack } from "tamagui";
import { ThemedView } from "../themed-view";
import { LayoutData } from "@/utils";
import { useRef } from "react";
import { StyleSheet } from "react-native";

interface DetailProps {
  mobileLayout: LayoutData | null;
}

export const Detail = ({ mobileLayout }: DetailProps) => {
  const scrollViewRef = useRef<ScrollView>(null);

  return (
    <ThemedView style={styles.container}>
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

              {item.rows.map((row) => {
                const Col = row.type === "textarea" ? YStack : XStack;
                return (
                  <Col gap="$2" key={row.label} p="$2">
                    <Label
                      width={80}
                      htmlFor="name"
                      size={"$3"}
                      whiteSpace={"nowrap"}
                    >
                      {row.label}
                    </Label>

                    <Button
                      flex={1}
                      bg="$gray2"
                      bc="$borderColor"
                      justifyContent="flex-end"
                      size={"$3"}
                      disabled
                    >
                      {row.defaultValue}
                    </Button>
                  </Col>
                );
              })}
            </Card>
          ))}
        </YStack>
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
