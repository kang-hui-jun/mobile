import { HorizontalTabs } from "@/components/HorizontalTabs";
import { ThemedView } from "@/components/themed-view";
import { Detail } from "@/components/ui/Detail";
import { TableList } from "@/components/ui/TableList";
import { useEntityDataV2, useMobileLayoutV2 } from "@/service/universal";
import { useAuth } from "@/store";
import { ReadMenu } from "@/types/detail";
import { Cell } from "@/types/mobile-layout";
import { handleLayout, LayoutData } from "@/utils";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { Spinner } from "tamagui";

export default function DetailScreen() {
  const [activeId, setActiveId] = useState("detail");
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

  const attachDefaultValue = (entityMessage: any[]) => (row: Cell) => {
    const item = entityMessage?.find((k) => k.fieldName === row.name);
    return {
      ...row,
      defaultValue: item?.label || item?.fieldValue,
    };
  };

  const hasValue = (row: Cell) => !!row.defaultValue;

  useEffect(() => {
    if (!mobileLayoutV2?.data) return;
    const runInitialization = () => {
      const baseLayout: LayoutData = handleLayout(mobileLayoutV2.data);

      const entityMessage = data?.entityMessage || [];

      const updatedAreas = baseLayout.areas.map((area) => ({
        ...area,
        rows: area.rows.map(attachDefaultValue(entityMessage)).filter(hasValue),
      }));

      setMobileLayout({ ...baseLayout, areas: updatedAreas });
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
      <Stack.Screen
        options={{
          title: entityName as string,
          headerShown: true,
        }}
      />
      <HorizontalTabs
        data={menu || []}
        activeId={activeId}
        onTabChange={handleTabChange}
        idField="menuName"
        labelField="menuLabel"
      />
      {activeId === "detail" ? (
        <Detail mobileLayout={mobileLayout} />
      ) : (
        <TableList
          entity={menu.find((k) => k.menuName === activeId)?.menuName as string}
          entityId={entityId as string}
          fieldName={
            menu.find((k) => k.menuName === activeId)
              ?.referenceFieldName as string
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
