
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { AppList } from "@/components/ui/AppList";
import { DataPlate } from "@/components/ui/DataPlate";
import { InfoList } from "@/components/ui/InfoList";
import { useHomeDataBoard, useListHomeDataBoard } from "@/service/home";
import { AppData, Configuration, ModuleData } from "@/types/home-data-board";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { Card, Image, Spinner } from "tamagui";

export default function HomeScreen() {
  const [appData, setAppData] = useState<AppData[]>([]);
  const [moduleData, setModuleData] = useState<ModuleData>({});
  const [activeId, setActiveId] = useState("");
  const { data, isLoading } = useHomeDataBoard();
  const { data: panelList } = useListHomeDataBoard();

  useEffect(() => {
    if (panelList && data) {
      const { configurationJson } = data.userConfigurationInfo;
      const configuration = JSON.parse(
        configurationJson as unknown as string
      ) as Configuration;

      const { module_list_data, app_list_data } = configuration;
      const { homeDataBoardId } = panelList?.[0];
      setActiveId(homeDataBoardId);
      setAppData(app_list_data);
      setModuleData(module_list_data);
    }
  }, [data, panelList]);

  if (isLoading) return <Spinner size="small" color="$green10" />;

  return (
    <ThemedView style={styles.container}>
      {moduleData?.[activeId]?.map((k) => (
        <Card key={k.id}>
          {k.cid === "applicationList" && <AppList data={appData} />}
          {k.cid === "incomeDetails" && <ThemedText>收支详情</ThemedText>}
          {k.cid === "messageList" && <InfoList />}
          {k.cid === "dataPlate" && (
            <DataPlate />
          )}
          {k.type === "CHART" && <ThemedText>图表</ThemedText>}
        </Card>
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 15,
    backgroundColor: "#F6F8FA",
  },
});
