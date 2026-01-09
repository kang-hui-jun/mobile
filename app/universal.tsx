import { DraggableFAB } from "@/components/DraggableFAB";
import { HorizontalTabs } from "@/components/HorizontalTabs";
import { InfiniteList } from "@/components/InfiniteList";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  useAdvQueryZn,
  useGridColumnFields,
  useGridFilter,
} from "@/service/universal";
import { Filter } from "@/types/grid-filter";
import { Plus } from "@tamagui/lucide-icons";
import { useQueryClient } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Card, Spinner, XStack } from "tamagui";

export default function UniversalScreen() {
  const router = useRouter();
  const [activeId, setActiveId] = useState("");
  const { entity, entityName } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useState({
    isDeleted: 0,
    entity,
    fields: "",
  });
  const [searchData, setSearchData] = useState<Filter>();

  const { data, isLoading } = useGridFilter({ entity } as any);

  const { data: fields } = useGridColumnFields({ entity } as any);

  const { data: gridColumnLayout } = useGridColumnFields({ entity } as any);

  useEffect(() => {
    if (data) {
      const defaultItem = data.find((item) => item.isDefault);
      setSearchData(defaultItem.filter);
      setActiveId(defaultItem.filterId);
    }
  }, [data]);

  useEffect(() => {
    if (fields) {
      setSearchParams({
        ...searchParams,
        fields: fields?.map((item) => item.fieldName).join(","),
      });
    }
  }, [fields]);

  const handleTabChange = (id: string) => {
    setActiveId(id);
    const item = data?.find((item) => item.filterId === id);
    setSearchData(item?.filter);
  };

  const {
    data: list,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  } = useAdvQueryZn(searchParams, searchData, {
    enabled: !!searchData,
  });

  const listData = useMemo(() => {
    return list?.pages.flatMap((page) => page.list) || [];
  }, [list]);

  const handleNavigator = (item: Record<string, string | number>) => {
    router.navigate({
      pathname: "/modal",
      params: {
        entity,
        multipleLayoutId: "143-b71b29f5-76f0-4bdc-8b69-846e94f35586",
        entityName,
      },
    });
  };

  const handleRefresh = async () => {
    await queryClient.resetQueries({
      queryKey: ["advQueryZn", searchParams, searchData],
    });
  };

  if (isLoading) return <Spinner size="small" color="$green10" />;

  return (
    <ThemedView style={{flex: 1, backgroundColor: "rgba(0, 0, 0, 0.00)"}}>
      <Stack.Screen
        options={{
          title: entityName as string,
          headerShown: true, // 确保显示
        }}
      />
      <HorizontalTabs
        data={data || []}
        activeId={activeId}
        onTabChange={handleTabChange}
        idField="filterId"
        labelField="filterName"
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
                {fields?.map((k) => (
                  <ThemedText key={k.fieldName}>
                    {k.fieldLabel}:{item[k.fieldName]}
                  </ThemedText>
                ))}
              </ThemedText>
            </Card.Header>
          </Card>
        )}
      />

      <XStack h={50} bg={"#FFFFFF"} style={{height: 50}} alignItems="center" pl={10} pr={10}>总数{}</XStack>
    </ThemedView>
  );
}
