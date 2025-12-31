import React from "react";
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  FlatListProps,
} from "react-native";

// 定义组件的 Props 接口
interface InfiniteListProps<T> extends Partial<FlatListProps<T>> {
  data: T[];
  isLoading: boolean;        // 是否正在加载更多
  isRefreshing: boolean;     // 是否正在下拉刷新
  hasMore: boolean;          // 是否还有更多数据
  onRefresh: () => void;     // 下拉刷新回调
  onLoadMore: () => void;    // 上拉加载回调
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement;
}

export function InfiniteList<T>({
  data,
  isLoading,
  isRefreshing,
  hasMore,
  onRefresh,
  onLoadMore,
  renderItem,
  ...restProps // 允许传入原生 FlatList 的所有其他属性
}: InfiniteListProps<T>) {
  
  // 渲染底部状态
  const renderFooter = () => {
    if (isLoading) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color="#999" />
          <Text style={styles.footerText}>正在加载...</Text>
        </View>
      );
    }
    if (!hasMore && data.length > 0) {
      return (
        <View style={styles.footer}>
          <Text style={styles.footerText}>—— 没有更多数据了 ——</Text>
        </View>
      );
    }
    return <View style={{ height: 20 }} />;
  };

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item, index) => (item as any).id || index.toString()}
      
      // 下拉刷新
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }

      // 上拉加载
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.2}
      
      // 列表辅助组件
      ListFooterComponent={renderFooter}
      ListEmptyComponent={
        !isRefreshing ? <Text style={styles.emptyText}>暂无数据</Text> : null
      }
      
      {...restProps} // 透传剩余属性
    />
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: 'row',
    gap: 8
  },
  footerText: {
    color: "#bbb",
    fontSize: 13,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 100,
    color: "#999",
  },
});