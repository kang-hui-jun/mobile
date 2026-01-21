import { ThemedView } from "@/components/themed-view";
import { FormItem } from "@/components/ui/FormItem";
import { userNameField } from "@/constants";
import { useMobileLayoutV2 } from "@/service/universal";
import { useAuth } from "@/store";
import { Cell } from "@/types/mobile-layout";
import { handleLayout, LayoutData, shouldMapReferenceField } from "@/utils";
import { useHttp } from "@/utils/http";
import { Plus } from "@tamagui/lucide-icons";
import dayjs from "dayjs";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button, Card, Label, Spinner, XStack, YStack } from "tamagui";

export default function ModalScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const { entity, multipleLayoutId, entityName } = useLocalSearchParams();
  const client = useHttp();
  const [express, setExpress] = useState<any>();
  const [expressDict, setExpressDict] = useState<any>();
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

  const initEntityCascade = async (cell: Cell) => {
    const { name, entity, defaultValue } = cell;
    if (defaultValue) {
      const initEntityMainData = await client("/gw/entity/initEntityMainData", {
        params: {
          id: defaultValue,
          entity,
          fieldName: name,
          actionType: "create",
        },
      });

      const mainData: Record<string, unknown> = {};
      for (const item in initEntityMainData.data.data) {
        const { destLabel, destValue } = initEntityMainData.data.data[item];
        mainData[item] = destValue;
      }
      setFormData((pre) => ({ ...pre, ...mainData }));
    }
  };

  const fieldReg = /c__[a-z_]+(Id)?\.?(c__[a-z]+)?/g;
  const fieldReg2 = /\{.*?\}/g;
  function regGetField(express: string) {
    try {
      if (express[0] == "=")
        return express
          .match(fieldReg2)
          ?.map((item) => item.slice(1, item.length - 1))
          ?.map((item) =>
            item.indexOf("Id.") > -1 ? item.split(".")[1] : item,
          );
      return express
        .match(fieldReg)
        ?.map((item) => (item.indexOf("Id.") > -1 ? item.split(".")[1] : item));
    } catch (e) {
      return [];
    }
  }

  useEffect(() => {
    if (!data?.data) return;

    const runInitialization = async () => {
      // 1. 同步计算基础布局和初始表单数据
      const baseLayout: LayoutData = handleLayout(data.data);
      const initialFormData: Record<string, unknown> = { ...formData }; // 继承现有值
      const newExpress: Record<string, string> = {};
      const newExpressDict: Record<string, string[]> = {};

      // 2. 预填基础字段值（Picklist/Date 等）
      for (const area of baseLayout.areas) {
        for (const row of area.rows) {
          if (row.type === "picklist") {
            const pick = baseLayout.pickList.find(
              (key) => key.fieldName === row.name,
            );
            const defaultValue = pick?.options?.find(
              (opt) => opt.isDefault === "Y",
            )?.lable;
            initialFormData[row.name] = defaultValue || "";
          } else if (
            (row.defaultValue === "$NOW$" && row.type === "datetime") ||
            row.type === "date"
          ) {
            initialFormData[row.name] = dayjs().format("YYYY-MM-DD");
          } else {
            initialFormData[row.name] = row.defaultValue || "";
          }

          // 提取表达式逻辑
          if (row.express) {
            const fieldArr = regGetField(row.express);
            newExpress[row.name] = row.express;
            newExpressDict[row.name] = fieldArr as string[];
          }
        }
      }

      // 3. 处理异步级联数据（如用户名或引用字段）
      // 注意：我们将更新 initialFormData 而不是直接 setFormData
      const cascadePromises = [];
      for (const area of baseLayout.areas) {
        for (const row of area.rows) {
          if (shouldMapReferenceField(row)) {
            if (row.name === userNameField) {
              initialFormData[row.name] = user?.userId;
            }
            // 将异步初始化逻辑改造为返回数据的形式
            cascadePromises.push(fetchCascadeData(row));
          }
        }
      }

      const cascadeResults = await Promise.all(cascadePromises);
      console.log(cascadePromises);
      console.log(cascadeResults);
      
      cascadeResults.forEach((result) => {
        if (result) Object.assign(initialFormData, result);
      });

      // 4. 最后：一次性同步所有状态
      setFormData(initialFormData);
      setExpress(newExpress);
      setExpressDict(newExpressDict);
      setMobileLayout(baseLayout);
    };

    runInitialization();
  }, [data]); // 仅在接口数据返回时触发

  // 辅助函数：将原有的 initEntityCascade 改造为支持 Promise
  const fetchCascadeData = async (cell: Cell) => {
    const { name, entity, defaultValue } = cell;
    console.log(cell);
    
    if (!defaultValue) return null;
    try {
      const res = await client("/gw/entity/initEntityMainData", {
        params: {
          id: defaultValue,
          entity,
          fieldName: name,
          actionType: "create",
        },
      });
      const mainData: Record<string, unknown> = {};
      for (const item in res.data.data) {
        mainData[item] = res.data.data[item].destValue;
      }
      return mainData;
    } catch (e) {
      console.error(`级联数据加载失败: ${name}`, e);
      return null;
    }
  };

  const prevFormDataRef = useRef<Record<string, unknown>>({});
  const debounceTimersRef = useRef<Record<string, NodeJS.Timeout>>({});
  useEffect(() => {
    const trigger_express = async (i: string) => {
      let params = {};
      expressDict[i] &&
        expressDict[i].forEach((_) => {
          params[_] = formData[_];
        });

      const result = await client("/gw/formula/execute", {
        method: "post",
        data: {
          params,
          fieldName: i,
          entityName: entity,
          formula: express[i]
            .replace(/{/g, "")
            .replace(/}/g, "")
            .replace(/\./g, "_"),
        },
      });
      if (result.error_code === 0) {
        setFormData((pre) => ({
          ...pre,
          [i]: result.data.value,
        }));
      }
    };
    const prevFormData = prevFormDataRef.current;
    if (prevFormData) {
      for (const field in formData) {
        const newValue = formData[field];
        const oldValue = prevFormData[field];

        if (
          JSON.stringify(oldValue) !== undefined &&
          JSON.stringify(newValue) !== JSON.stringify(oldValue)
        ) {
          console.log(JSON.stringify(newValue), JSON.stringify(oldValue));

          for (const i in expressDict) {
            if (expressDict[i].includes(field)) {
              if (debounceTimersRef.current[i]) {
                clearTimeout(debounceTimersRef.current[i]);
              }
              debounceTimersRef.current[i] = setTimeout(() => {
                trigger_express(i);
              }, 500);
            }
          }
        }
      }
    }
    prevFormDataRef.current = formData;
    return () => {
      Object.values(debounceTimersRef.current).forEach(clearTimeout);
    };
  }, [formData, expressDict]);

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
          headerShown: true, // 确保显示
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

              {item.rows.map(
                (key) => key.canCreate && <FormItem key={key.name} row={key} />,
              )}
            </Card>
          ))}

          {mobileLayout?.hasDetail?.detailEntityName && (
            <Card elevate size="$4" bordered background={"#ffffff"}>
              {mobileLayout?.hasDetail?.detailInfoAreas?.map((item, index) => (
                <Card key={item.id + index} background={"#ffffff"}>
                  <XStack p="$2">
                    <Label size="$5" fontWeight={600}>
                      明细{index}
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
