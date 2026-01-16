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
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // 建议安装并使用
import {
  ScrollView,
  Button,
  Input,
  Spinner,
  Text,
  TextArea,
  XStack,
  YStack,
} from "tamagui";

export default function JybScreen() {
  const insets = useSafeAreaInsets(); // 获取系统安全区域高度
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [activeId, setActiveId] = useState("");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [formLayout, setFormLayout] = useState<FormComponent[]>([]);

  const [selectedValue, setSelectedValue] = useState("核销");
  const [currentField, setCurrentField] = useState("");

  const options = ["实付", "核销", "计提"];

  // --- 逻辑处理优化 ---

  const handleOpenSheet = useCallback(
    (field: string) => {
      setCurrentField(field);
      // 打开时同步表单当前已有的值，若无则默认选第一个
      setSelectedValue(formData[field] || options[0]);
      bottomSheetRef.current?.expand();
    },
    [formData]
  );

  const handleConfirm = useCallback(() => {
    if (currentField) {
      setFormData((prev) => ({ ...prev, [currentField]: selectedValue }));
    }
    bottomSheetRef.current?.close();
  }, [currentField, selectedValue]);

  const handleInput = (text: string, field: string) => {
    setFormData((prev) => ({ ...prev, [field]: text }));
  };

  // --- 权限与资源处理 ---

  const pickImage = async (field: string) => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) return;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      // 存储文件路径或名称
      setFormData((prev) => ({ ...prev, [field]: result.assets[0].uri }));
    }
  };

  // --- 数据监听 ---

  const { data, isLoading } = useRememberlayout();
  const { data: entityLayout, isLoading: entityLoading } = useEntityLayoutById({
    layoutId: activeId,
  });

  useEffect(() => {
    if (data?.[0]?.layoutContext) {
      const firstId = data[0].layoutContext[0].layoutId;
      setActiveId(firstId);
    }
  }, [data]);

  useEffect(() => {
    if (entityLayout?.content) {
      try {
        const parsed = JSON.parse(entityLayout.content);
        const container = parsed?.datajson?.find(
          (item: any) => item.type === "ConfigContainerForm"
        );
        if (container?.form) {
          const initialData: Record<string, string> = {};
          container.form.forEach((f: any) => {
            if (f.datasource?.field) initialData[f.datasource.field] = "";
          });
          setFormData(initialData);
          setFormLayout(container.form);
        }
      } catch (e) {
        console.error("解析布局失败", e);
      }
    }
  }, [entityLayout]);

  // --- 渲染辅助 ---

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

  if (isLoading || entityLoading)
    return <Spinner f={1} size="large" color="$orange10" />;

  return (
    <ThemedView style={styles.container}>
      <HorizontalTabs
        data={data?.[0]?.layoutContext || []}
        activeId={activeId}
        onTabChange={setActiveId}
        idField="layoutId"
        labelField="layoutName"
      />

      <ScrollView
        flex={1}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }} // 预留底部按钮空间
      >
        <XStack fw="wrap" p="$2">
          {formLayout?.map((f) => {
            const fieldKey = f.datasource?.field ?? "";
            const value = formData[fieldKey];
            const required = f.expression?.find(
              (key) => key.type === "required"
            );

            return (
              <YStack key={f.gid} p="$2" w="50%" gap="$2">
                <XStack ai="center" gap="$1" mb="$1">
                  <Text fontSize="$2" color="$gray11" fontWeight="500">
                    {f.label.text}
                  </Text>
                  {/* 这里可以根据 f 对象里的必填属性来判断是否显示，目前先默认显示 */}
                  {required && (
                    <Text
                      color="#FF4D4F"
                      fontSize="$4"
                      lineHeight={12}
                      marginTop={2}
                    >
                      *
                    </Text>
                  )}
                </XStack>

                {/* 金额输入 - 修正了 onChangeText */}
                {f.type === "ConfigMoney" && (
                  <Input
                    placeholder="请输入"
                    textAlign="right"
                    size="$3"
                    keyboardType="numeric"
                    value={value}
                    onChangeText={(text) => handleInput(text, fieldKey)}
                  />
                )}

                {/* 图片上传 */}
                {f.type === "ConfigPicture" && (
                  <XStack
                    bg="$gray3"
                    bw={1}
                    bc="$borderColor"
                    br="$2"
                    w={62}
                    h={62}
                    ai="center"
                    jc="center"
                    onPress={() => pickImage(fieldKey)}
                  >
                    <FileImage size="$2" color="$gray10" />
                  </XStack>
                )}

                {/* 选择器类组件 (日期/引用/下拉) */}
                {(f.type === "ConfigReference" ||
                  f.type === "ConfigDate" ||
                  f.type === "ConfigSelect") && (
                  <Button
                    jc="flex-end"
                    bg="$gray2"
                    bc="$borderColor"
                    size="$3"
                    iconAfter={<ChevronDown size="$1" color="$gray8" />}
                    onPress={() => handleOpenSheet(fieldKey)}
                  >
                    <Text color={value ? "$color" : "$gray9"} fontSize="$3">
                      {value || "请选择"}
                    </Text>
                  </Button>
                )}

                {/* 多行文本 */}
                {f.type === "ConfigTextarea" && (
                  <TextArea
                    placeholder="请输入"
                    size="$3"
                    value={value}
                    onChangeText={(text) => handleInput(text, fieldKey)}
                  />
                )}
              </YStack>
            );
          })}
        </XStack>
      </ScrollView>

      {/* 底部按钮区域 - 增加了安全距离适配 */}
      <YStack
        p="$3"
        bc="$background"
        bbw={1}
        style={{ paddingBottom: insets.bottom + 10 }}
      >
        <Button
          themeInverse
          size="$4"
          bg="#FF864B"
          onPress={() => console.log(formData)}
        >
          提交
        </Button>
      </YStack>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={["35%"]}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
      >
        <BottomSheetView style={{ flex: 1 }}>
          <YStack f={1} bg="$background">
            <XStack
              p="$3"
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

            <YStack f={1} jc="center">
              <Picker
                selectedValue={selectedValue}
                onValueChange={setSelectedValue}
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
  container: { flex: 1 },
});
