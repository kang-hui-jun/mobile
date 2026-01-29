import { ThemedView } from "@/components/themed-view";
import { FormItem } from "@/components/ui/FormItem";
import { userNameField } from "@/constants";
import { useMobileLayoutV2 } from "@/service/universal";
import { useAuth } from "@/store";
import { Area, Cell } from "@/types/mobile-layout";
import { handleLayout, LayoutData, shouldMapReferenceField } from "@/utils";
import { Maybe } from "@/utils/functor";
import { useHttp } from "@/utils/http";
import {
  cleanFormula,
  formatResult,
  getDepParams,
  getInitialValue,
  regGetField,
} from "@/utils/universal";
import { Plus } from "@tamagui/lucide-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useRef } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button, Card, Label, Spinner, XStack, YStack } from "tamagui";

export default function ModalScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const { entity, multipleLayoutId, entityName, referenceFieldName, entityId } =
    useLocalSearchParams();
  const client = useHttp();
  const { mobileLayout, setMobileLayout, user, formData, setFormData } =
    useAuth();
  const params = {
    entity,
    id: "",
    multipleLayoutId,
  } as {
    entity: string;
    id: string;
    multipleLayoutId: string;
  };

  const { data, isLoading } = useMobileLayoutV2(params);

  const formDataRef = useRef<Record<string, any>>({});
  const expressDictRef = useRef<Record<string, string[]>>({});
  const expressRef = useRef<Record<string, string>>({});
  const prevFormDataRef = useRef<Record<string, any>>({});
  const debounceTimersRef = useRef<Record<string, NodeJS.Timeout>>({});

  // 实时同步状态到 Ref，确保异步回调永远能拿到最新值
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  useEffect(() => {
    if (!data?.data) return;

    const runInitialization = async () => {
      const baseLayout: LayoutData = handleLayout(data.data);
      const initialFormData: Record<string, any> = {};
      const newExpress: Record<string, string> = {};
      const newExpressDict: Record<string, string[]> = {};

      // 用于记录哪些字段是被依赖的（只有这些字段需要防范 undefined）
      const dependencyFields = new Set<string>();

      for (const area of baseLayout.areas) {
        for (const row of area.rows) {
          initialFormData[row.name] = getInitialValue(row, baseLayout);
          if (row.express) {
            const fieldArr = regGetField(row.express);
            newExpress[row.name] = row.express;
            newExpressDict[row.name] = fieldArr as string[];
            fieldArr?.forEach((f) => dependencyFields.add(f));
          }
        }
      }

      const partialSnapshot: Record<string, any> = {};
      dependencyFields.forEach((field) => {
        partialSnapshot[field] = initialFormData[field] ?? "";
      });
      prevFormDataRef.current = partialSnapshot;

      setFormData(initialFormData);

      const cascadePromises = [];
      for (const area of baseLayout.areas) {
        for (const row of area.rows) {
          if (shouldMapReferenceField(row) || referenceFieldName) {
            if (row.name === userNameField) {
              initialFormData[row.name] = {
                label: user?.userName,
                value: user?.userId,
              };
              row.defaultValue = user?.userId;
            }
            cascadePromises.push(fetchCascadeData(row));
          }
        }
      }

      const cascadeResults = await Promise.all(cascadePromises);
      const updatedData = { ...initialFormData };
      cascadeResults.forEach((res) => res && Object.assign(updatedData, res));

      setFormData(updatedData);
      setMobileLayout(baseLayout);
      expressRef.current = newExpress;
      expressDictRef.current = newExpressDict;
    };

    runInitialization();
  }, [data]);

  const fetchCascadeData = async (cell: Cell) => {
    const { name, entity, defaultValue } = cell;

    if (!defaultValue && !referenceFieldName) return null;
    try {
      const res = await client("/gw/entity/initEntityMainData", {
        params: {
          id: defaultValue || entityId,
          entity,
          fieldName: name,
          actionType: "create",
        },
      });
      const mainData: Record<string, unknown> = {};
      for (const item in res.data.data) {
        const { destLabel, destValue } = res.data.data[item];
        mainData[item] = destLabel
          ? { label: destLabel, value: destValue }
          : res.data.data[item].destValue;
      }

      client("/gw/entity/GetEntityFieldMappingManager", {
        params: {
          id: entityId,
          entity,
          fieldName: referenceFieldName,
          actionType: "create",
        },
      }).then((entityFieldMappingManager) => {
        for (const item of entityFieldMappingManager.data) {
          if (item.details) {
            mappingDetailed(item.details);
          }
        }

        const fromDestName = Array.from(
          entityFieldMappingManager.data,
          ({ destName }) => destName,
        );

        if (fromDestName.length) {
          mapping({ data: entityFieldMappingManager.data, fromDestName, cell });
        }
      });

      return mainData;
    } catch (e) {
      console.error(`级联数据加载失败: ${name}`, e);
      return null;
    }
  };

  const mapping = async ({ data, fromDestName, cell }) => {
    const dataIndex = fromDestName.indexOf(cell.name);

    if (dataIndex !== -1 && cell.type === "reference") {
      const updatedFormData = { ...formData };
      for (const item of data) {
        updatedFormData[item.destName] = {
          label: item.destLabel,
          value: item.destValue,
        };
      }
      setFormData(updatedFormData);

      for (const item of data) {
        await mappingDetailed(item);
      }
    }
  };

  const mappingDetailed = async (item: {
    destValue: string;
    destName: string;
  }) => {
    if (!item?.destValue) return;
    const entityFieldMappingManager = await client(
      "/gw/entity/GetEntityFieldMappingManager",
      {
        params: {
          id: item.destValue,
          entity,
          fieldName: item.destName,
          actionType: "create",
        },
      },
    );

    if (!mobileLayout?.hasDetail) return;

    const initialRowBase = JSON.parse(
      JSON.stringify(mobileLayout.hasDetail.detailInfoAreas[0]),
    );

    const newDetailInfoAreas = [];

    for (const element of entityFieldMappingManager.data) {
      for (const detail of element.details) {
        const currentRowGroup = JSON.parse(JSON.stringify(initialRowBase));

        for (const [index, det] of detail.entries()) {
          if (currentRowGroup.rows[index]) {
            currentRowGroup.rows[index].defaultValue = det.destLabel;
            currentRowGroup.rows[index].value = det.destValue;
          }
        }

        newDetailInfoAreas.push(currentRowGroup);
      }
    }

    setMobileLayout({
      ...mobileLayout,
      hasDetail: {
        ...mobileLayout.hasDetail,
        detailInfoAreas: newDetailInfoAreas,
      },
    });
    console.log("最终生成的各行数据：", newDetailInfoAreas);
  };

  const trigger_express = async (targetField: string) => {
    const maybeConfig = Maybe.of(expressDictRef.current?.[targetField]);
    if (maybeConfig.isNothing) return;
    try {
      // 2. 准备数据
      const deps = expressDictRef.current![targetField];
      const params = getDepParams(deps, formDataRef.current);
      const formula = cleanFormula(expressRef.current?.[targetField] || "");

      // 3. 执行 IO 副作用
      const result = await client("/gw/formula/execute", {
        method: "post",
        data: { params, fieldName: targetField, entityName: entity, formula },
      });

      // 4. 更新状态
      if (result.error_code === 0) {
        const updatedFormData = {
          ...formData,
          [targetField]: formatResult(result.data.value, formData[targetField]),
        };
        setFormData(updatedFormData);
      }
    } catch (e) {
      console.error("公式执行失败:", e);
    }
  };

  useEffect(() => {
    const prevFormData = prevFormDataRef.current;
    const currentDict = expressDictRef.current;

    if (!currentDict || Object.keys(currentDict).length === 0) return;

    for (const field in formData) {
      const newValue = formData[field];
      const oldValue = prevFormData[field];
      if (
        oldValue !== undefined &&
        JSON.stringify(newValue) !== JSON.stringify(oldValue)
      ) {
        for (const formulaField in currentDict) {
          if (currentDict[formulaField].includes(field)) {
            if (debounceTimersRef.current[formulaField]) {
              clearTimeout(debounceTimersRef.current[formulaField]);
            }

            debounceTimersRef.current[formulaField] = setTimeout(
              trigger_express,
              500,
              formulaField,
            );
          }
        }
      }
    }

    prevFormDataRef.current = formData;
  }, [formData]);

  const handleAdd = () => {
    if (mobileLayout) {
      setMobileLayout({
        ...mobileLayout,
        hasDetail: {
          ...mobileLayout.hasDetail,
          detailInfoAreas: [
            ...mobileLayout.hasDetail.detailInfoAreas,
            mobileLayout.hasDetail.detailInfoAreas[0],
          ],
        },
      });

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 300);
    }
  };

  const handleSubmit = () => {
    console.log(formData);
  };

  if (isLoading) return <Spinner size="small" color="$green10" />;

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: ("新建" + entityName) as string,
          headerShown: true,
        }}
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
                <FormItem key={key.name} row={key} />
              ))}
            </Card>
          ))}

          {mobileLayout?.hasDetail?.detailEntityName && (
            <Card elevate size="$4" bordered background={"#ffffff"}>
              {mobileLayout?.hasDetail?.detailInfoAreas?.map((item, index) => (
                <Card key={item.id + index} background={"#ffffff"}>
                  <XStack p="$2">
                    <Label size="$5" fontWeight={600}>
                      明细{index + 1}
                    </Label>
                  </XStack>

                  {item.rows.map((key) => (
                    <FormItem key={key.name} row={key} />
                  ))}
                </Card>
              ))}

              <XStack p={"$2"}>
                <Button
                  size={"$3"}
                  width={"100%"}
                  bg={"#FFFFFF"}
                  icon={Plus}
                  onPress={handleAdd}
                >
                  新建一项
                </Button>
              </XStack>
            </Card>
          )}
        </YStack>
      </ScrollView>

      <XStack p={"$2"}>
        <Button width={"100%"} onPress={handleSubmit}>
          click
        </Button>
      </XStack>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    height: 44,
    position: "fixed",
    bottom: 0,
    left: 0,
    zIndex: 99,
  },
});
