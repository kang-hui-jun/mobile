import { HorizontalTabs } from "@/components/HorizontalTabs";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useEntityDataV2, useMobileLayoutV2 } from "@/service/universal";
import { useAuth } from "@/store";
import { ReadMenu } from "@/types/detail";
import { handleLayout, LayoutData } from "@/utils";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { Card, Label, ScrollView, Spinner, XStack, YStack } from "tamagui";

export default function DetailScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeId, setActiveId] = useState("详情");
  const { entity, entityId, entityName } = useLocalSearchParams();
  const { mobileLayout, setMobileLayout } = useAuth();

  const [menu, setMenu] = useState<ReadMenu[]>([
    {
      menuLabel: "详情",
      menuName: "detail",
      referenceFieldName: "",
      selectNum: 0,
    },
  ]);

  const params = {
    entity,
    id: entityId,
    multipleLayoutId: "",
  } as {
    entity: string;
    id: string;
    multipleLayoutId: string;
  };

  const { data: mobileLayoutV2 } = useMobileLayoutV2(params);

  const { data, isLoading } = useEntityDataV2({
    entity,
    entityId,
  } as any);

  const handleTabChange = (id: string) => {
    setActiveId(id);
  };

  useEffect(() => {
    if (!mobileLayoutV2?.data) return;
    const runInitialization = () => {
      const baseLayout: LayoutData = handleLayout(mobileLayoutV2.data);

      for (const area of baseLayout.areas) {
        for (const row of area.rows) {
          const filterEntityMessage = data?.entityMessage;
          const item = filterEntityMessage?.find(
            (key) => key.fieldName === row.name,
          );
          row.defaultValue = item?.label || item?.fieldValue;
        }
      }

      for (const area of baseLayout.areas) {        
        area.rows = area.rows.filter((k) => k.defaultValue);
      }

      setMobileLayout(baseLayout);
    };

    runInitialization();
  }, [mobileLayoutV2]);

  useEffect(() => {
    if (data) {
      const { ReadMenu } = data;
      const updateMenu = [...menu, ...ReadMenu];
      setMenu(updateMenu);
    }
  }, [data]);

  if (isLoading) return <Spinner size="small" color="$green10" />;

  return (
    <ThemedView style={styles.container}>
      <HorizontalTabs
        data={menu || []}
        activeId={activeId}
        onTabChange={handleTabChange}
        idField="menuName"
        labelField="menuLabel"
      />
      <ScrollView ref={scrollViewRef}>
        <YStack gap="$2" p="$2">
          {mobileLayout?.areas?.map((item) => (
            <Card
              key={item.id}
              elevate
              size="$4"
              bordered
              background={"#ffffff"}
            >
              <XStack p="$2">
                <Label size="$5" fontWeight={600}>
                  {item.title}
                </Label>
              </XStack>

              {item.rows.map((key) => (
                // <FormItem key={key.name} row={key} />
                <ThemedText key={key.name}>
                  {key.label} : {key.defaultValue}
                </ThemedText>
              ))}
            </Card>
          ))}
        </YStack>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
