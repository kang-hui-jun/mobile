import { AppData } from "@/types/home-data-board";
import { Plus } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { Card, Text, XStack, YStack } from "tamagui";

interface AppProps {
  data: AppData[];
}

export const AppList = ({ data }: AppProps) => {
  const router = useRouter();
  const handleNavigator = (menu: AppData) => {
    router.navigate({
      pathname: "/universal",
      params: {
        entity: menu.menuName,
        entityName: menu.menuLabel,
      },
    });
  };

  return (
    <Card bg={"#FFF"} borderRadius="$0">
      <XStack fw="wrap" p="$2">
        {data?.map((child) => (
          <YStack
            w="25%"
            ai="center"
            p="$2"
            key={child.menuLabel}
            onPress={() => handleNavigator(child)}
          >
            <YStack bg="$orange2" p="$2" br="$3">
              <Plus color="$orange10" size="$2" />
            </YStack>
            <Text mt="$3" fontSize="$2">
              {child.menuLabel}
            </Text>
          </YStack>
        ))}
      </XStack>
    </Card>
  );
};
