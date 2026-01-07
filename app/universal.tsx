import { DraggableFAB } from "@/components/DraggableFAB";
import { InfiniteList } from "@/components/InfiniteList";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAdvQueryZn } from "@/service/universal";
import { Plus } from "@tamagui/lucide-icons";
import { useQueryClient } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Card, View } from "tamagui";

export default function UniversalScreen() {
  const router = useRouter();
  const { entity, entityName } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useState({
    isDeleted: 0,
    entity,
    fields:
      "c__NOM,accountId,orderType,c__lianxiren,orderName,total,paid,unpaid,owningUser,owningBusinessUnit",
  });
  const [searchData, setSearchData] = useState({
    times: 1766468339486,
    type: "AND",
    filters: [
      {
        fieldName: "owningHighSea",
        type: "reference",
        operator: "=",
        value: "$NULL$",
        filterType: "AND",
      },
    ],
    children: [],
  });

  const {
    data: list,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  } = useAdvQueryZn(searchParams, searchData);

  const listData = useMemo(() => {
    return list?.pages.flatMap((page) => page.list) || [];
  }, [list]);

  const handleNavigator = (item: Record<string, string | number>) => {
    router.navigate({
      pathname: "/modal",
      params: {
        entity,
        multipleLayoutId: "143-b71b29f5-76f0-4bdc-8b69-846e94f35586",
        entityName
      },
    });
  };

  const handleRefresh = async () => {
    await queryClient.resetQueries({
      queryKey: ["advQueryZn", searchParams, searchData],
    });
  };

  return (
    <View flex={1}>
      <Stack.Screen
        options={{
          title: entityName as string,
          headerShown: true, // 确保显示
        }}
      />
      <DraggableFAB
        onPress={() => console.log("新增任务")}
        icon={Plus}
        buttonProps={{
          backgroundColor: "#ff4000",
        }}
      />
      <InfiniteList
        style={{ padding: 4 }}
        data={listData}
        isRefreshing={isRefetching}
        isLoading={isFetchingNextPage}
        hasMore={!!hasNextPage}
        onRefresh={handleRefresh}
        onLoadMore={fetchNextPage}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => (
          <ThemedView
            style={{ height: 8, backgroundColor: "rgba(0, 0, 0, 0.00)" }}
          />
        )}
        renderItem={({ item }) => (
          <Card
            key={item.accountId}
            bg="#FFFFFF"
            onPress={() => handleNavigator(item)}
          >
            <Card.Header>
              <ThemedText style={{ fontWeight: "bold" }}>
                {item.accountId}
              </ThemedText>
            </Card.Header>
          </Card>
        )}
      />
    </View>
  );
}
