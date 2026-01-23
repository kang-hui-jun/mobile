import { Card } from "tamagui";
import { InfiniteList } from "../InfiniteList";
import { ThemedText } from "../themed-text";
import { ThemedView } from "../themed-view";

interface DataCardProps {
  data: any[];
  isRefreshing: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onRefresh: () => Promise<void>;
  onLoadMore: () => void;
  onToDetail: (item: Record<string, string | number>) => void;
  defaultColumnWidth?: number;
}

export const DataCard = ({
  data,
  isLoadingMore,
  isRefreshing,
  hasMore,
  onRefresh,
  onLoadMore,
  onToDetail,
}: DataCardProps) => {
  const renderRow = ({ item }: { item: any }) => (
    <Card key={item.accountId} bg="#FFFFFF" onPress={() => onToDetail(item)}>
      <Card.Header>
        <ThemedText style={{ fontWeight: "bold" }}>
          {/* {fields?.map((k) => (
            <ThemedText key={k.fieldName}>
              {k.fieldLabel}:{item[k.fieldName]}
            </ThemedText>
          ))} */}
        </ThemedText>
      </Card.Header>
    </Card>
  );

  return (
    <InfiniteList
      style={{ padding: 4 }}
      data={data}
      isRefreshing={isRefreshing}
      isLoading={isLoadingMore}
      hasMore={hasMore}
      onRefresh={onRefresh}
      onLoadMore={() => {
        if (!isLoadingMore && hasMore) {
          onLoadMore();
        }
      }}
      keyExtractor={(item) => item.id || Math.random().toString()}
      ItemSeparatorComponent={() => (
        <ThemedView
          style={{ height: 8, backgroundColor: "rgba(0, 0, 0, 0.00)" }}
        />
      )}
      renderItem={renderRow}
    />
  );
};
