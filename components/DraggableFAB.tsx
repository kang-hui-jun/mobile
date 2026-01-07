import React from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { Button, ButtonProps } from "tamagui";
import { Plus } from "@tamagui/lucide-icons";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface DraggableFABProps {
  onPress?: () => void;
  icon?: any;
  buttonProps?: ButtonProps;
  initialOffset?: { x: number; y: number };
}

export const DraggableFAB = ({
  onPress,
  icon = Plus,
  buttonProps,
  initialOffset = { x: 0, y: 0 },
}: DraggableFABProps) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // 1. 定义动画共享变量
  const translateX = useSharedValue(initialOffset.x);
  const translateY = useSharedValue(initialOffset.y);
  const context = useSharedValue({ x: 0, y: 0 });

  // 2. 配置拖拽手势
  const gesture = Gesture.Pan()
    .onStart(() => {
      // 记录开始拖动时的偏移量
      context.value = { x: translateX.value, y: translateY.value };
    })
    .onUpdate((event) => {
      // 实时更新位置
      translateX.value = event.translationX + context.value.x;
      translateY.value = event.translationY + context.value.y;
    })
    .onEnd(() => {
      // ✅ 增加边缘自动吸附效果 (可选)
      const snapPoint = translateX.value > 0 ? 0 : 0; // 如果需要吸附到屏幕边框可以计算 windowWidth
      translateX.value = withSpring(translateX.value, { damping: 20 });
      translateY.value = withSpring(translateY.value, { damping: 20 });
    });

  // 3. 关联动画样式
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.fabContainer, animatedStyle]}>
        <Button
          circular
          size="$6"
          elevate
          theme="orange"
          icon={icon}
          onPress={onPress}
          color="#FFFFFF"
          {...buttonProps} // 允许覆盖样式
        />
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  fabContainer: {
    position: "absolute",
    bottom: 80, // 初始位置
    right: 30, // 初始位置
    zIndex: 9999, // 确保在最顶层
  },
});
