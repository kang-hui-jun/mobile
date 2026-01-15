import { AppData } from "@/types/home-data-board";
import { Plus } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Dimensions } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, {
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";
import { Card, XStack } from "tamagui";
import { AppItem } from "./AppItem";

interface AppProps {
  data: AppData[];
}

function transformArray(inputArr: AppData[]) {
  const transformedArr: AppData[] = [];

  inputArr?.forEach((item) => {
    if (typeof item === "object" && item !== null) {
      const newItem = {
        ...item,
      };

      transformedArr.push(newItem);
    }
  });

  const result = [];
  for (let i = 0; i < transformedArr.length; i += 8) {
    result.push(transformedArr.slice(i, i + 8));
  }

  return result;
}

const width = Dimensions.get("window").width;

export const AppList = ({ data }: AppProps) => {
  const appList = transformArray(data);
  const ref = React.useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);

  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };

  return (
    <Card bg={"#FFF"} borderRadius="$0" flex={1}>
      <Carousel
        ref={ref}
        width={width}
        style={{ width, height: 174 }}
        data={appList}
        loop={false}
        onProgressChange={progress}
        renderItem={({ item }) => {
          return (
            <XStack fw="wrap" p="$2">
              {item?.map((child) => (
                <AppItem key={child.menuName} menu={child} />
              ))}
            </XStack>
          );
        }}
      />

      <Pagination.Basic
        progress={progress}
        data={appList}
        dotStyle={{ backgroundColor: "rgba(0,0,0,0.2)", borderRadius: 50 }}
        activeDotStyle={{
          backgroundColor: "#ff864b", // 如果在 Tamagui 环境下支持 token
          // 或者直接使用 Hex 颜色
          // backgroundColor: "#FF6D00"
        }}
        containerStyle={{ gap: 10, margin: 10 }}
        onPress={onPressPagination}
      />
    </Card>
  );
};
