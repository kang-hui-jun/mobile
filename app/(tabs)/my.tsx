import { WebFriendlyPicker } from "@/components/Picker";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { BottomSheetDefaultBackdropProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types";
import { ChevronRight } from "@tamagui/lucide-icons";
import { Stack } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Card, XStack } from "tamagui";

const NUM_ITEMS = 10;
function getColor(i: number) {
  const multiplier = 255 / (NUM_ITEMS - 1);
  const colorVal = i * multiplier;
  return `rgb(${colorVal}, ${Math.abs(128 - colorVal)}, ${255 - colorVal})`;
}

type Item = {
  key: string;
  label: string;
  height: number;
  width: number;
  backgroundColor: string;
};

const initialData: Item[] = [...Array(NUM_ITEMS)].map((d, index) => {
  const backgroundColor = getColor(index);
  return {
    key: `item-${index}`,
    label: String(index) + "",
    height: 100,
    width: 60 + Math.random() * 40,
    backgroundColor,
  };
});

const System = [
  ["depentment", "user", "statistics", "share"],
  ["editpass", "blackmode", "system"],
  ["select", "logout"],
];

export default function MyScreen() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [selectedValue, setSelectedValue] = useState("1");

  // 设置 Bottom Sheet 展开的高度（Picker高度 + Toolbar高度）
  const snapPoints = useMemo(() => ["45%"], []);

  // 展开选择器
  const handleOpenPicker = () => bottomSheetRef.current?.expand();

  // 关闭选择器
  const handleClose = () => bottomSheetRef.current?.close();

  // 渲染背景遮罩（点击灰色区域关闭）
  const renderBackdrop = useCallback(
    (props: BottomSheetDefaultBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    [],
  );

  // const renderItem = ({ item, drag, isActive }: RenderItemParams<Item>) => {
  //   return (
  //     <ScaleDecorator>
  //       <TouchableOpacity
  //         onLongPress={drag}
  //         disabled={isActive}
  //         style={[
  //           styles.rowItem,
  //           { backgroundColor: isActive ? "red" : item.backgroundColor },
  //         ]}
  //       >
  //         <Text style={styles.text}>{item.label}</Text>
  //       </TouchableOpacity>
  //     </ScaleDecorator>
  //   );
  // };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: "我的",
          headerShown: true,
        }}
      />

      <View style={styles.screen}>
        <TouchableOpacity style={styles.input} onPress={handleOpenPicker}>
          <Text>当前选择：{selectedValue}</Text>
        </TouchableOpacity>

        <BottomSheet
          ref={bottomSheetRef}
          index={-1} // 初始状态隐藏
          snapPoints={snapPoints}
          enablePanDownToClose={true}
          backdropComponent={renderBackdrop}
          // 移除默认手柄以便更像 uni-app 风格
          handleComponent={null}
        >
          <BottomSheetView style={styles.contentContainer}>
            {/* 顶部的自定义 Toolbar */}
            <View style={styles.toolbar}>
              <TouchableOpacity onPress={handleClose}>
                <Text style={styles.btnCancel}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleClose}>
                <Text style={styles.btnConfirm}>完成</Text>
              </TouchableOpacity>
            </View>

            <WebFriendlyPicker
              data={["1", "2", "3", "4", "5", "6", "7", "8"]}
              onValueChange={(val) => setSelectedValue(val)}
            />
          </BottomSheetView>
        </BottomSheet>
      </View>
    </GestureHandlerRootView>

    // <DraggableFlatList
    //   data={data}
    //   onDragEnd={({ data }) => setData(data)}
    //   keyExtractor={(item) => item.key}
    //   renderItem={renderItem}
    // />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  input: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    width: "80%",
  },
  contentContainer: { flex: 1, backgroundColor: "#fff" },
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  btnCancel: { color: "#666", fontSize: 16 },
  btnConfirm: { color: "#007AFF", fontSize: 16, fontWeight: "bold" },
});
