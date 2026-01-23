import { useAdvQueryZn, useGridColumnFields } from "@/service/universal";
import { Filter } from "@/types/grid-filter";
import { useEffect, useMemo, useState } from "react";
import { ThemedView } from "../themed-view";
import { InfiniteList } from "../InfiniteList";
import { useQueryClient } from "@tanstack/react-query";
import { Card, Label, XStack } from "tamagui";
import { ThemedText } from "../themed-text";
interface TableListProps {
  entity: string;
  entityId: string;
  fieldName: string;
}

export const TableList = ({ entity, entityId, fieldName }: TableListProps) => {
  const { data: gridColumnFields } = useGridColumnFields({ entity, type: "1" });
  const [searchData, setSearchData] = useState<Filter>();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useState({
    isDeleted: 0,
    entity,
    fields: "",
  });

  useEffect(() => {
    if (!gridColumnFields) return;
    setSearchParams({
      ...searchParams,
      fields: gridColumnFields?.map((item) => item.fieldName).join(","),
    });
    setSearchData({
      type: "OR",
      filters: [
        {
          fieldName,
          operator: "=",
          value: entityId,
        },
      ],
    });
  }, [gridColumnFields]);

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

  const handleRefresh = async () => {
    await queryClient.resetQueries({
      queryKey: ["advQueryZn", searchParams, searchData],
    });
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <XStack>
        {gridColumnFields?.map((field) => (
          <Label maxWidth={100}>{field.fieldLabel}</Label>
        ))}
      </XStack>
      <InfiniteList
        data={listData}
        isRefreshing={isRefetching}
        isLoading={isFetchingNextPage}
        hasMore={!!hasNextPage}
        onRefresh={handleRefresh}
        onLoadMore={fetchNextPage}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          return (
            <XStack>
              {gridColumnFields?.map((field) => (
                <Label maxWidth={100}>{item[field.fieldName]}</Label>
              ))}
            </XStack>
          );
        }}
      />
    </ThemedView>
  );
};
