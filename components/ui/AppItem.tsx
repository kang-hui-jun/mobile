import { Menu } from "@/types/menu";
import { IconMap, IconName } from "@/utils/icon-mapper";
import { useRouter } from "expo-router";
import { YStack, Text } from "tamagui";

export const AppItem = ({ menu }: { menu: Menu }) => {
  const router = useRouter();

  const DynamicIcon = IconMap[menu.menuIcon as IconName] || IconMap.File;

  const handleNavigator = (menu: Menu) => {
    router.navigate({
      pathname: "/universal",
      params: {
        entity: menu.menuName,
        entityName: menu.menuLabel,
      },
    });
  };

  return (
    <YStack
      w="25%"
      ai="center"
      p="$2"
      key={menu.menuLabel}
      onPress={() => handleNavigator(menu)}
    >
      <YStack bg="$orange2" p="$2" br="$3">
        <DynamicIcon color="$orange10" size="$2" />
      </YStack>
      <Text mt="$3" fontSize="$2">
        {menu.menuLabel}
      </Text>
    </YStack>
  );
};
