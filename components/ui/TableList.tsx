import { useAdvQueryZn, useGridColumnFields } from "@/service/universal";
import { Filter } from "@/types/grid-filter";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Label, ScrollView, XStack, YStack } from "tamagui";
import { InfiniteList } from "../InfiniteList";
import { ThemedView } from "../themed-view";
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

  const total = useMemo(() => {
    return list?.pages.flatMap((page) => page.totalCount) || [];
  }, [list]);

  const handleRefresh = async () => {
    await queryClient.resetQueries({
      queryKey: ["advQueryZn", searchParams, searchData],
    });
  };

  const colStyle = {
    p: "$2",
    minWidth: 100, // 最小宽度
    maxWidth: 150, // 建议使用固定数值的最大宽度，或者确保列宽逻辑一致
    textAlign: "left" as const,
  };

  if (!total) return;

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <YStack>
          <XStack
            borderBottomWidth={1}
            borderColor="$borderColor"
            background="$background"
          >
            {gridColumnFields?.map((field) => (
              <Label
                key={field.fieldName}
                {...colStyle}
                width={120} // 【关键】给每一列设置相同的固定宽度（或根据业务设定宽度）
                fontWeight="600"
              >
                {field.fieldLabel}
              </Label>
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
                <XStack borderBottomWidth={0.5} borderColor="#EEE">
                  {gridColumnFields?.map((field) => (
                    <Label
                      key={field.fieldName}
                      {...colStyle}
                      width={120} // 【关键】必须与表头的宽度设置完全一致
                    >
                      {/* 使用 numberOfLines 处理超长内容，防止撑开容器 */}
                      <Label
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        size="$3"
                        width="100%"
                      >
                        {item[field.fieldName] || "--"}
                      </Label>
                    </Label>
                  ))}
                </XStack>
              );
            }}
          />
        </YStack>
      </ScrollView>
    </ThemedView>
  );
};
