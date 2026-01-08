import { HorizontalTabs } from "@/components/HorizontalTabs";
import { ThemedView } from "@/components/themed-view";
import { useGridFilter } from "@/service/universal";
import { useEffect, useState } from "react";
import { Spinner } from "tamagui";

export default function HomeScreen() {
  const { data, isLoading } = useGridFilter({ entity: "SalesOrder" });
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    if (data) {
      const defaultItem = data.find((item) => item.isDefault);
      setActiveId(defaultItem.filterId);
    }
  }, [data]);

  const handleTabChange = (id: string) => {
    setActiveId(id);
  };

  if (isLoading) return <Spinner size="small" color="$green10" />;

  return (
    <ThemedView>
      <HorizontalTabs
        data={data || []}
        activeId={activeId}
        onTabChange={handleTabChange}
        idField="filterId"
        labelField="filterName"
      />
    </ThemedView>
  );
}
