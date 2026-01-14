import { DraggableFAB } from "@/components/DraggableFAB";
import { ThemedView } from "@/components/themed-view";
import { AppList } from "@/components/ui/AppList";
import { Chart } from "@/components/ui/Chart";
import { DataPlate } from "@/components/ui/DataPlate";
import { InfoList } from "@/components/ui/InfoList";
import { Jyb } from "@/components/ui/Jyb";
import { useHomeDataBoard, useListHomeDataBoard } from "@/service/home";
import { AppData, Configuration, ModuleData } from "@/types/home-data-board";
import { Pencil } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { Card, Spinner } from "tamagui";

export default function HomeScreen() {
  const router = useRouter();
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
      <DraggableFAB
        onPress={() => {
          router.navigate("/jyb");
        }}
        icon={Pencil}
        buttonProps={{
          backgroundColor: "#ff4000",
        }}
      />
      {moduleData?.[activeId]?.map((k) => (
        <Card key={k.id}>
          {k.cid === "applicationList" && <AppList data={appData} />}
          {k.cid === "incomeDetails" && <Jyb />}
          {k.cid === "messageList" && <InfoList />}
          {k.cid === "dataPlate" && <DataPlate />}
          {k.type === "CHART" && <Chart chartData={k} />}
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
