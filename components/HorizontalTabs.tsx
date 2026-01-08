import React, { useRef, useEffect } from 'react';
import { ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { View, Text, XStack, YStack } from 'tamagui';

// 使用泛型 T 来适配不同的数据结构
interface HorizontalTabsProps<T> {
  data: T[];
  activeId: string;
  onTabChange: (id: string) => void;
  // 定义映射关系，默认为 id 和 label
  idField?: keyof T;
  labelField?: keyof T;
}

export function HorizontalTabs<T>({
  data,
  activeId,
  onTabChange,
  idField = 'id' as keyof T,     // 默认取 id
  labelField = 'label' as keyof T // 默认取 label
}: HorizontalTabsProps<T>) {
  const { width: screenWidth } = useWindowDimensions();
  const itemWidth = screenWidth / 3;
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    // 根据动态的 idField 查找索引
    const index = data.findIndex((item) => item[idField] === activeId);
    if (index !== -1 && scrollRef.current) {
      const scrollToX = index * itemWidth - itemWidth;
      scrollRef.current.scrollTo({
        x: Math.max(0, scrollToX),
        animated: true,
      });
    }
  }, [activeId, data, itemWidth, idField]);

  return (
    <View bg="#FFFFFF" borderBottomWidth={1} borderColor="$borderColor">
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={itemWidth}
        decelerationRate="fast"
      >
        <XStack>
          {data.map((item, index) => {
            const currentId = item[idField] as unknown as string;
            const currentLabel = item[labelField] as unknown as string;
            const isActive = activeId === currentId;

            return (
              <TouchableOpacity
                key={currentId}
                onPress={() => onTabChange(currentId)}
                style={{ width: itemWidth }}
              >
                <YStack ai="center" py="$3" gap="$1">
                  <Text
                    fontSize={15}
                    fontWeight={isActive ? "600" : "400"}
                    color={isActive ? "#FF8C00" : "#666"}
                  >
                    {currentLabel}
                  </Text>
                  <View
                    height={2}
                    width={20}
                    bg={isActive ? "#FF8C00" : "transparent"}
                    mt="$1"
                  />
                </YStack>
              </TouchableOpacity>
            );
          })}
        </XStack>
      </ScrollView>
    </View>
  );
}