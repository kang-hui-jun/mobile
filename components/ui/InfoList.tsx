import { useMessageNotificationsByTypeNew } from "@/service/home";
import { ChevronRight } from "@tamagui/lucide-icons";
import { useState } from "react";
import { Card, Image, Spinner, Text, XStack } from "tamagui";

export const InfoList = () => {
  const [searchParams, setSearchParams] = useState({
    messageType: "",
    firstResult: 0,
    maxResults: 20,
    isUnRed: true,
  });

  const { data, isLoading } = useMessageNotificationsByTypeNew(searchParams);

  if (isLoading) return <Spinner size="small" color="$green10" />;

  return (
    <Card fd={"column"} p={16} bg={"#FFFFFF"} gap={16}>
      {data?.map((item) => (
        <XStack
          key={item.msgId}
          justifyContent={"space-between"}
          alignItems="center"
          gap={10}
        >
          <Image
            borderRadius={"$12"}
            source={{
              width: 36,
              height: 36,
              uri: "https://img.vip.imocq.com/000-0ef3acb9-229d-4be2-bb9c-b01ed0a1e4c2/20251105/1762323191646_001.png",
            }}
          />
          <Text fontSize="$2" flex={1} overflow={"hidden"}>
            {item.content}
          </Text>
          <ChevronRight size="$1" color="$colorPress" />
        </XStack>
      ))}
    </Card>
  );
};
