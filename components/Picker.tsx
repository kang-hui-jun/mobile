import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;
const OFFSET_COUNT = 2;

const WebFriendlyPicker = ({
  data = ["1", "2", "3", "4", "5", "6", "7", "8"],
  onValueChange = (index: string) => {},
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const scrollViewRef = useRef(null);

  // 物理吸附执行函数
  const scrollToNearest = (offsetY: number) => {
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const safeIndex = Math.max(0, Math.min(index, data.length - 1));

    scrollViewRef.current?.scrollTo({
      y: safeIndex * ITEM_HEIGHT,
      animated: true,
    });
    setSelectedIndex(safeIndex);
    if (onValueChange) onValueChange(data[safeIndex]);
  };

  // 监听滚动实时更新状态
  const onScroll = (event) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    if (index !== selectedIndex && index >= 0 && index < data.length) {
      setSelectedIndex(index);
    }
  };

  return (
    <View style={styles.container}>
      {/* 工具栏 */}
      {/* <View style={styles.toolbar}>
        <TouchableOpacity>
          <Text style={styles.btnCancel}>取消</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.btnConfirm}>完成</Text>
        </TouchableOpacity>
      </View> */}

      <View style={styles.pickerWrapper}>
        {/* 选中框两条线 */}
        <View style={styles.indicator} pointerEvents="none" />

        <ScrollView
          ref={scrollViewRef}
          onScroll={onScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          // 基础吸附配置
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          // 停止滚动的 JS 补丁（针对不支持 snap 的浏览器环境）
          onMomentumScrollEnd={(e) => {
            console.log(e);

            return scrollToNearest(e.nativeEvent.contentOffset.y);
          }}
          onScrollEndDrag={(e) => {
            const velocity = e.nativeEvent.velocity?.y || 0;
            if (velocity === 0) scrollToNearest(e.nativeEvent.contentOffset.y);
          }}
          // --- Web 平台核心优化：注入 CSS Scroll Snap ---
          {...Platform.select({
            web: {
              style: {
                scrollSnapType: "y mandatory", // 强制纵向捕捉
              },
              contentContainerStyle: {
                // 确保容器允许捕捉
              },
            },
          })}
        >
          {/* 顶部占位 */}
          <View style={{ height: ITEM_HEIGHT * OFFSET_COUNT }} />

          {data.map((item, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={1}
              onPress={() => scrollToNearest(index * ITEM_HEIGHT)}
              // Web 端的子元素捕捉点
              {...Platform.select({
                web: {
                  style: [
                    styles.item,
                    { height: ITEM_HEIGHT, scrollSnapAlign: "center" },
                  ],
                },
                default: {
                  style: [styles.item, { height: ITEM_HEIGHT }],
                },
              })}
            >
              <Text
                style={[
                  styles.itemText,
                  selectedIndex === index && styles.selectedText,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}

          {/* 底部占位 */}
          <View style={{ height: ITEM_HEIGHT * OFFSET_COUNT }} />
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    width: "100%",
    maxWidth: 400, // Web 端常见限制宽度
    alignSelf: "center",
  },
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  btnCancel: { color: "#666", fontSize: 16 },
  btnConfirm: { color: "#007AFF", fontSize: 16, fontWeight: "bold" },
  pickerWrapper: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    position: "relative",
    backgroundColor: "#fff",
  },
  indicator: {
    position: "absolute",
    top: ITEM_HEIGHT * 2,
    height: ITEM_HEIGHT,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    zIndex: 1,
  },
  item: {
    justifyContent: "center",
    alignItems: "center",
  },
  itemText: { fontSize: 18, color: "#ccc" },
  selectedText: { color: "#000", fontWeight: "bold", fontSize: 22 },
});

export default WebFriendlyPicker;
