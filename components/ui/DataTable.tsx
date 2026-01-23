import { Label, ScrollView, styled, XStack, YStack } from "tamagui";
import { ThemedView } from "../themed-view";
import { InfiniteList } from "../InfiniteList";

// 定义通用的列配置接口
interface ColumnField {
  fieldName: string;
  fieldLabel: string;
  width?: number; // 允许自定义每一列的宽度
}

interface DataTableProps {
  fields: ColumnField[] | undefined;
  data: any[];
  isRefreshing: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onRefresh: () => Promise<void>;
  onLoadMore: () => void;
  onToDetail: (item: Record<string, string | number>) => void;
  defaultColumnWidth?: number;
}

// 抽取统一的单元格容器，确保对齐逻辑一致
const TableCell = styled(Label, {
  p: "$2",
  textAlign: "left",
  // 核心：强制不换行，这是对齐的基础
  whiteSpace: "nowrap",
});

export const DataTable = ({
  fields,
  data,
  isRefreshing,
  isLoadingMore,
  hasMore,
  onRefresh,
  onLoadMore,
  onToDetail,
  defaultColumnWidth = 120,
}: DataTableProps) => {
  // 渲染单行内容
  const renderRow = ({ item }: { item: any }) => (
    <XStack
      borderBottomWidth={0.5}
      borderColor="#EEE"
      onPress={() => onToDetail(item)}
    >
      {fields?.map((field) => {
        const colWidth = field.width || defaultColumnWidth;
        return (
          <TableCell key={field.fieldName} width={colWidth}>
            {/* 内部嵌套 Label 处理截断和省略号 */}
            <Label
              size="$3"
              width="100%"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item[field.fieldName] || "--"}
            </Label>
          </TableCell>
        );
      })}
    </XStack>
  );

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <YStack>
          {/* 表头渲染 */}
          <XStack
            borderBottomWidth={1}
            borderColor="$borderColor"
            background="$background"
          >
            {fields?.map((field) => (
              <TableCell
                key={field.fieldName}
                width={field.width || defaultColumnWidth}
                fontWeight="600"
              >
                {field.fieldLabel}
              </TableCell>
            ))}
          </XStack>

          {/* 列表渲染 */}
          <InfiniteList
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
            renderItem={renderRow}
          />
        </YStack>
      </ScrollView>
    </ThemedView>
  );
};
