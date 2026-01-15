import { HorizontalTabs } from "@/components/HorizontalTabs";
import { ThemedView } from "@/components/themed-view";
import { useEntityLayoutById, useRememberlayout } from "@/service/jyb";
import { ContainerForm, FormComponent } from "@/types/jyb-entity-layout";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { Button, Input, Spinner, Text, XStack, YStack } from "tamagui";

export default function JybScreen() {
  const [activeId, setActiveId] = useState("");
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formLayout, setFormLayout] = useState<FormComponent[]>([]);
  const [topMenu, setTopMenu] = useState<
    {
      layoutName: string;
      layoutId: string;
      layoutIcon: string;
    }[]
  >([]);

  const { data, isLoading } = useRememberlayout();
  const { data: entityLayout, isLoading: entityLoading } = useEntityLayoutById({
    layoutId: activeId,
  });

  useEffect(() => {
    if (data) {
      setTopMenu(data?.[0]?.layoutContext);
      setActiveId(data?.[0]?.layoutContext[0].layoutId);
    }
  }, [data]);

  useEffect(() => {
    if (entityLayout) {
      const form: FormComponent[] = JSON.parse(
        entityLayout?.content || "{}"
      )?.datajson?.find(
        (item: ContainerForm) => (item.type = "ConfigContainerForm")
      )?.form;
      const formData: Record<string, any> = {};
      for (const item of form) {
        formData[item.datasource?.field as string] = "";
      }
      setFormData(formData);
      setFormLayout(form);
    }
  }, [entityLayout]);

  const handleTabChange = (id: string) => {
    setActiveId(id);
  };

  const handleInput = (val: any, field: string) => {
    setFormData({ ...formData, [field]: val.target.value });
  };

  const handleSubmit = () => {
    console.log(formData);
  };

  if (isLoading || entityLoading)
    return <Spinner size="small" color="$green10" />;

  return (
    <ThemedView style={styles.container}>
      <HorizontalTabs
        data={topMenu || []}
        activeId={activeId}
        onTabChange={handleTabChange}
        idField="layoutId"
        labelField="layoutName"
      />
      <XStack fw="wrap" p={"$2"}>
        {formLayout?.map((f: FormComponent) => {
          const fieldKey = f.datasource?.field ?? "";
          return (
            <YStack key={f.gid} p="$2" w={"50%"} gap={"$3"}>
              <Text fontSize="$2">{f.label.text}</Text>
              <Input
                id={fieldKey || "name"}
                placeholder="请输入"
                textAlign="right"
                size="$3"
                onChange={(e) => handleInput(e, f.datasource?.field || "")}
                value={fieldKey ? formData[fieldKey] : ""}
              />
            </YStack>
          );
        })}
      </XStack>

      <XStack p={"$2"} pos={"fixed"} bottom={0} left={0} w={"100%"}>
        <Button bg={"#FF864B"} color={"#FFF"} w={"100%"} onPress={handleSubmit}>
          提交
        </Button>
      </XStack>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
