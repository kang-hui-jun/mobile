import { useAdvQueryZn, useGridColumnFields } from "@/service/universal";
import { Filter } from "@/types/grid-filter";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { DataTable } from "./DataTable";
import { useRouter } from "expo-router";
interface TableListProps {
  entity: string;
  entityId: string;
  entityName: string;
  fieldName: string;
}

export const TableList = ({
  entity,
  entityId,
  fieldName,
  entityName,
}: TableListProps) => {
  const router = useRouter();
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

  if (!total) return;

  const customFields = useMemo(() => {
    return gridColumnFields?.map((f) => ({
      ...f,
      width: 120,
    }));
  }, [gridColumnFields]);

  return (
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
  );
};
