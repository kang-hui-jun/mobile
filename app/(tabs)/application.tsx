import { InfiniteList } from "@/components/InfiniteList";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { AppItem } from "@/components/ui/AppItem";
import { useMenus } from "@/service/application";
import { useAuth } from "@/store";
import { Menu } from "@/types/menu";
import { transformMenu } from "@/utils";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { Card, Spinner, XStack } from "tamagui";

export default function ApplicationScreen() {
  const { user } = useAuth();
  const { isLoading, data, isRefetching } = useMenus();
  const [menuList, setMenuList] = useState<Menu[]>([]);

  useEffect(() => {
    if (data) {
      setMenuList(transformMenu(data.data, user));
    }
  }, [data]);

  if (isLoading) return <Spinner size="small" color="$green10" />;


  return (
    <InfiniteList
      style={{ padding: 4 }}
      data={menuList}
      isRefreshing={isRefetching}
      isLoading={isLoading}
      hasMore={false}
      onRefresh={() => {}}
      onLoadMore={() => {}}
      ItemSeparatorComponent={() => (
        <ThemedView
          style={{ height: 8, backgroundColor: "rgba(0, 0, 0, 0.00)" }}
        />
      )}
      renderItem={({ item }) => (
        <Card key={item.menuLabel} bg="#FFFFFF">
          <Card.Header>
            <ThemedText style={{ fontWeight: "bold" }}>
              {item.menuLabel}
            </ThemedText>
          </Card.Header>

          <XStack fw="wrap" p="$2">
            {item?.children?.map((child) => (
              <AppItem key={child.menuName} menu={child} />
            ))}
          </XStack>
        </Card>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    backgroundColor: "#F6F8FA",
    gap: 8,
  },
  card: {
    backgroundColor: "#FFFFFF",
  },
});
