import { HorizontalTabs } from "@/components/HorizontalTabs";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useEntityLayoutById, useRememberlayout } from "@/service/jyb";
import { useEffect, useState } from "react";
import { Spinner } from "tamagui";

export default function JybScreen() {
  const [activeId, setActiveId] = useState("");
  const [topMenu, setTopMenu] = useState<
    {
      layoutName: string;
      layoutId: string;
      layoutIcon: string;
    }[]
  >([]);

  const { data, isLoading } = useRememberlayout();
  const { data: entityLayout } = useEntityLayoutById({ layoutId: activeId });

  useEffect(() => {
    if (data) {
      setTopMenu(data?.[0]?.layoutContext);
      setActiveId(data?.[0]?.layoutContext[0].layoutId);
    }
  }, [data]);

  const handleTabChange = (id: string) => {
    setActiveId(id);
  };

  if (isLoading) return <Spinner size="small" color="$green10" />;

  return (
    <ThemedView style={{ flex: 1 }}>
      <HorizontalTabs
        data={topMenu || []}
        activeId={activeId}
        onTabChange={handleTabChange}
        idField="layoutId"
        labelField="layoutName"
      />

      <ThemedText>{entityLayout?.layoutType}</ThemedText>
    </ThemedView>
  );
}
