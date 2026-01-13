import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ChevronRight } from "@tamagui/lucide-icons";
import { Stack } from "expo-router";
import { Card, XStack } from "tamagui";

const System = [
  ["depentment", "user", "statistics", "share"],
  ["editpass", "blackmode", "system"],
  ["select", "logout"],
];

export default function MyScreen() {
  return (
    <ThemedView>
      <Stack.Screen
        options={{
          title: "我的",
          headerShown: true,
        }}
      />
      <Card p={15} fd={"column"} gap={15} flex={1}>
        {System.map((item, index) => (
          <Card key={index} p={15} fd={"column"} gap={15} bg={"#FFFFFF"}>
            {item.map((key) => (
              <XStack key={key}  justifyContent={"space-between"}>
                <ThemedText>{key}</ThemedText>
                <ChevronRight size="$1" color="$colorPress" />
              </XStack>
            ))}
          </Card>
        ))}
      </Card>
    </ThemedView>
  );
}
