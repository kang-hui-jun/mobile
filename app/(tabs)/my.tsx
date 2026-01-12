import { ChevronRight } from "@tamagui/lucide-icons";
import { Card, XStack } from "tamagui";

const System = [
  ["depentment", "user", "statistics", "share"],
  ["editpass", "blackmode", "system"],
  ["select", "logout"],
];

export default function MyScreen() {
  return (
    <Card p={15} fd={"column"} gap={15} flex={1}>
      {System.map((item, index) => (
        <Card key={index} p={15} fd={"column"} gap={15} bg={"#FFFFFF"}>
          {item.map((key) => (
            <XStack key={key} jc={"space-between"} flex={1}>
              {key}
              <ChevronRight size="$1" color="$colorPress" />
            </XStack>
          ))}
        </Card>
      ))}
    </Card>
  );
}
