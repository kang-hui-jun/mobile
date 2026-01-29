import { DraggableFAB } from "@/components/DraggableFAB";
import { HorizontalTabs } from "@/components/HorizontalTabs";
import { ThemedView } from "@/components/themed-view";
import { Detail } from "@/components/ui/Detail";
import { TableList } from "@/components/ui/TableList";
import {
  useEntityDataV2,
  useMobileLayoutV2,
  useMultipleLayout,
} from "@/service/universal";
import { useAuth } from "@/store";
import { ReadMenu } from "@/types/detail";
import { Cell } from "@/types/mobile-layout";
import { handleLayout, LayoutData } from "@/utils";
import { Plus } from "@tamagui/lucide-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { Spinner } from "tamagui";

export default function DetailScreen() {
  const router = useRouter();
  const [activeId, setActiveId] = useState("detail");
  const { entity, entityId, entityName } = useLocalSearchParams();
  const { mobileLayout, setMobileLayout } = useAuth();
  const [multipleLayoutId, setMultipleLayoutId] = useState("");

  const [menu, setMenu] = useState<ReadMenu[]>([]);

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

  const { data: multipleLayout } = useMultipleLayout({ entity } as any);

  useEffect(() => {
    if (multipleLayout) {
      setMultipleLayoutId(multipleLayout?.mLayouts[0].id);
    }
  }, [multipleLayout]);

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
      const initialMenu = [
        {
          menuLabel: "详情",
          menuName: "detail",
          referenceFieldName: "",
          selectNum: 0,
        },
      ];
      const { ReadMenu } = data;
      const updateMenu = [...initialMenu, ...ReadMenu];
      setActiveId("detail");
      setMenu(updateMenu);
    }
  }, [data]);

  const handleNavigator = () => {
    const referenceFieldName = menu?.find(
      (k) => k.menuName === activeId,
    )?.referenceFieldName;
    const entity = menu?.find((k) => k.menuName === activeId)?.menuName;
    router.navigate({
      pathname: "/modal",
      params: {
        entity,
        entityId,
        multipleLayoutId,
        entityName,
        referenceFieldName,
      },
    });
  };

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
      ) : menu.find((k) => k.menuName === activeId)?.selectNum ? (
        <>
          <DraggableFAB
            onPress={handleNavigator}
            icon={Plus}
            buttonProps={{
              backgroundColor: "#ff4000",
            }}
          />
          <TableList
            entity={
              menu.find((k) => k.menuName === activeId)?.menuName as string
            }
            entityId={entityId as string}
            entityName={
              menu.find((k) => k.menuName === activeId)?.menuLabel as string
            }
            fieldName={
              menu.find((k) => k.menuName === activeId)
                ?.referenceFieldName as string
            }
          />
        </>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
