import { HorizontalTabs } from "@/components/HorizontalTabs";
import { ThemedView } from "@/components/themed-view";
import { useEntityLayoutById, useRememberlayout } from "@/service/jyb";
import { ContainerForm, FormComponent } from "@/types/jyb-entity-layout";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Picker } from "@react-native-picker/picker";
import { ChevronDown, FileImage } from "@tamagui/lucide-icons";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import {
  Button,
  Input,
  Spinner,
  Text,
  TextArea,
  XStack,
  YStack,
} from "tamagui";

export default function JybScreen() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [activeId, setActiveId] = useState("");
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formLayout, setFormLayout] = useState<FormComponent[]>([]);

  const [selectedValue, setSelectedValue] = useState("核销"); // 临时选中的值
  const [currentField, setCurrentField] = useState(""); // 记录当前正在操作哪个字段

  const options = ["实付", "核销", "计提"];

  // 打开 Sheet 时，记录是哪个字段触发的
  const handleOpenSheet = (field: string) => {
    setCurrentField(field);
    setSelectedValue(formData[field] || options[0]); // 初始化为已选值或第一个
    bottomSheetRef.current?.expand();
  };

  // 点击确认时，将值写入表单并关闭
  const handleConfirm = () => {
    if (currentField) {
      setFormData({ ...formData, [currentField]: selectedValue });
    }
    bottomSheetRef.current?.close();
  };

  const snapPoints = useMemo(() => ["40%"], []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    []
  );

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

  const pickImage = async (field: string) => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setFormData({ ...formData, [field]: result.assets[0].fileName });
    }
  };

  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  const handleTabChange = (id: string) => {
    setActiveId(id);
  };

  const handleInput = (val: any, field: string) => {
    setFormData({ ...formData, [field]: val.target.value });
  };

  const handleSubmit = () => {
    console.log(formData);
  };

  if (isLoading)
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

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <XStack fw="wrap" p={"$2"}>
          {formLayout?.map((f: FormComponent) => {
            const fieldKey = f.datasource?.field ?? "";
            return (
              <YStack key={f.gid} p="$2" w={"50%"} gap={"$3"}>
                <Text fontSize="$2">{f.label.text}</Text>

                {f.type === "ConfigMoney" && (
                  <Input
                    id={fieldKey || "name"}
                    placeholder="请输入"
                    textAlign="right"
                    size="$3"
                    onChange={(e) => handleInput(e, f.datasource?.field || "")}
                    value={fieldKey ? formData[fieldKey] : ""}
                  />
                )}

                {f.type === "ConfigPicture" && (
                  // <Button
                  //   flex={1}
                  //   justifyContent="flex-end"
                  //   bg={"#f8f8f8"}
                  //   bc={"#ebebeb"}
                  //   color={"$gray1"}
                  //   size="$3"
                  //   iconAfter={<ChevronDown size="$1" color="$colorPress" />}
                  //   onPress={() => pickImage(fieldKey)}
                  // >
                  //   {formData[fieldKey] || "请选择"}
                  // </Button>
                  <FileImage
                    flex={1}
                    justifyContent="flex-end"
                    bg={"#f0ecec4d"}
                    bc={"#ebebeb"}
                    w={62}
                    h={62}
                    color={"#666"}
                    size="$3"
                    onPress={() => pickImage(fieldKey)}
                  />
                )}
                {f.type === "ConfigReference" && (
                  <Button
                    flex={1}
                    justifyContent="flex-end"
                    bg={"#f8f8f8"}
                    bc={"#ebebeb"}
                    color={"gray"}
                    size="$3"
                    iconAfter={<ChevronDown size="$1" color="#c0c4cc" />}
                    onPress={() => handleOpenSheet(fieldKey)}
                  >
                    {formData[fieldKey] || "请选择"}
                  </Button>
                )}
                {f.type === "ConfigDate" && (
                  <Button
                    flex={1}
                    justifyContent="flex-end"
                    bg={"#f8f8f8"}
                    bc={"#ebebeb"}
                    color={"gray"}
                    size="$3"
                    iconAfter={<ChevronDown size="$1" color="#c0c4cc" />}
                    onPress={() => handleOpenSheet(fieldKey)}
                  >
                    {formData[fieldKey] || "请选择"}
                  </Button>
                )}
                {f.type === "ConfigSelect" && (
                  <Button
                    flex={1}
                    justifyContent="flex-end"
                    bg={"#f8f8f8"}
                    bc={"#ebebeb"}
                    color={"gray"}
                    size="$3"
                    iconAfter={<ChevronDown size="$1" color="#c0c4cc" />}
                    onPress={() => handleOpenSheet(fieldKey)}
                  >
                    {formData[fieldKey] || "请选择"}
                  </Button>
                )}

                {f.type === "ConfigTextarea" && (
                  <TextArea flex={1} id="name" placeholder="请输入" size="$3" />
                )}
              </YStack>
            );
          })}
        </XStack>
      </ScrollView>

      <XStack p={"$2"} w={"100%"}>
        <Button w={"100%"} bg={"#FF864B"} color={"#FFF"} onPress={handleSubmit}>
          提交
        </Button>
      </XStack>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={["35%"]}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
      >
        <BottomSheetView style={{ flex: 1 }}>
          <YStack f={1} bg="$background">
            {/* 头部：取消 - 确认 */}
            <XStack
              p="$4"
              jc="space-between"
              ai="center"
              bc="$borderColor"
              bbw={1}
            >
              <Button
                chromeless
                onPress={() => bottomSheetRef.current?.close()}
              >
                <Text color="$gray10">取消</Text>
              </Button>
              <Text fontWeight="bold">请选择</Text>
              <Button chromeless onPress={handleConfirm}>
                <Text fontWeight="bold" color="#FF864B">
                  确认
                </Text>
              </Button>
            </XStack>

            {/* 滚轮选择器部分：模拟 uniapp picker-view */}
            <YStack f={1} jc="center">
              <Picker
                selectedValue={selectedValue}
                onValueChange={(itemValue) => setSelectedValue(itemValue)}
                style={{ backgroundColor: "transparent" }}
                itemStyle={{ fontSize: 20, height: 120 }} // 调整高度和字号
              >
                {options.map((item) => (
                  <Picker.Item key={item} label={item} value={item} />
                ))}
              </Picker>
            </YStack>
          </YStack>
        </BottomSheetView>
      </BottomSheet>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
