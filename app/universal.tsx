import { DraggableFAB } from "@/components/DraggableFAB";
import { HorizontalTabs } from "@/components/HorizontalTabs";
import { ThemedView } from "@/components/themed-view";
import { DataTable } from "@/components/ui/DataTable";
import {
  useAdvQueryZn,
  useGridColumnFields,
  useGridColumnLayout,
  useGridFilter,
  useMultipleLayout,
} from "@/service/universal";
import { Filter } from "@/types/grid-filter";
import { Plus } from "@tamagui/lucide-icons";
import { useQueryClient } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Spinner } from "tamagui";

export default function UniversalScreen() {
  const router = useRouter();
  const [activeId, setActiveId] = useState("");
  const [multipleLayoutId, setMultipleLayoutId] = useState("");
  const { entity, entityName } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useState({
    isDeleted: 0,
    entity,
    fields: "",
  });
  const [searchData, setSearchData] = useState<Filter>();

  const { data, isLoading } = useGridFilter({ entity } as any);

  const { data: gridColumnFields } = useGridColumnFields({ entity } as any);

  const { data: gridColumnLayout } = useGridColumnLayout({ entity } as any);

  const { data: multipleLayout } = useMultipleLayout({ entity } as any);

  useEffect(() => {
    if (multipleLayout) {
      setMultipleLayoutId(multipleLayout?.mLayouts[0].id);
    }
  }, [multipleLayout]);

  useEffect(() => {
    if (data) {
      const defaultItem = data.find((item) => item.isDefault);
      setSearchData(defaultItem.filter);
      setActiveId(defaultItem.filterId);
    }
  }, [data]);

  useEffect(() => {
    if (gridColumnFields) {
      setSearchParams({
        ...searchParams,
        fields: gridColumnFields?.map((item) => item.fieldName).join(","),
      });
    }
  }, [gridColumnFields]);

  useEffect(() => {
    if (!gridColumnLayout) return;
    console.log(gridColumnLayout);
  }, [gridColumnLayout]);

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

  const total = useMemo(() => {
    return list?.pages.flatMap((page) => page.totalCount) || [];
  }, [list]);

  const handleNavigator = () => {
    router.navigate({
      pathname: "/modal",
      params: {
        entity,
        multipleLayoutId,
        entityName,
      },
    });
  };

  const handleToDetail = (item: Record<string, string | number>) => {
    router.navigate({
      pathname: "/detail",
      params: {
        entity,
        entityId: item.id,
        entityName,
        pageIndex: 1,
      },
    });
  };

  const handleRefresh = async () => {
    await queryClient.resetQueries({
      queryKey: ["advQueryZn", searchParams, searchData],
    });
  };

  const customFields = useMemo(() => {
    return gridColumnFields?.map((f) => ({
      ...f,
      width: 120,
    }));
  }, [gridColumnFields]);

  if (isLoading) return <Spinner size="small" color="$green10" />;

  return (
    <ThemedView style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.00)" }}>
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
        onPress={handleNavigator}
        icon={Plus}
        buttonProps={{
          backgroundColor: "#ff4000",
        }}
      />

      {total ? (
        <DataTable
          fields={customFields}
          data={listData}
          isRefreshing={isRefetching}
          isLoadingMore={isFetchingNextPage}
          hasMore={!!hasNextPage}
          onRefresh={handleRefresh}
          onLoadMore={fetchNextPage}
          onToDetail={handleToDetail}
        />
      ) : null}

      {/* <XStack h={50} bg={"#FFFFFF"} style={{height: 50}} alignItems="center" pl={10} pr={10}>总数{}</XStack> */}
    </ThemedView>
  );
}
