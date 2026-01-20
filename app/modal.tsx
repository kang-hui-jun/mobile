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
        mainData[item] = destLabel || destValue;
      }
      // setFormData({ ...formData, ...mainData });
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
    if (data?.data) {
      const baseLayout: LayoutData = handleLayout(data.data);
      const dataForm: Record<string, unknown> = {};
      for (const area of baseLayout.areas) {
        for (const row of area.rows) {
          if (row.type === "picklist") {
            const pick = baseLayout.pickList.find(
              (key) => key.fieldName === row.name,
            );
            const defaultValue = pick?.options?.find(
              (opt) => opt.isDefault === "Y",
            )?.lable;
            dataForm[row.name] = defaultValue || "";
          } else {
            dataForm[row.name] = row.defaultValue || "";
          }
          if (
            (row.defaultValue == "$NOW$" && row.type == "datetime") ||
            row.type == "date"
          ) {
            dataForm[row.name] = dayjs().format("YYYY-MM-DD") || "";
          }
        }
      }
      setFormData({ ...formData, ...dataForm });
      const initAsyncData = async (layoutData: LayoutData) => {
        for (const area of layoutData.areas) {
          for (const row of area.rows) {
            if (row.express) {
              const fieldArr = regGetField(row.express);
              setExpress((pre) => ({
                ...pre,
                [row.name]: row.express,
              }));

              setExpressDict((pre) => ({
                ...pre,
                [row.name]: [...(fieldArr as any)],
              }));
            }
            if (shouldMapReferenceField(row)) {
              if (row.name === userNameField) {
                row.defaultValue = user?.userId;
              }
              // todo-----------
              initEntityCascade(row);
            }
          }
        }
        setMobileLayout(layoutData);
      };

      const runAsyncUpdates = async () => {
        try {
          await initAsyncData(baseLayout);
        } catch (err) {
          console.error("异步数据加载失败", err);
          setMobileLayout(baseLayout);
        }
      };
      setMobileLayout(baseLayout);
      runAsyncUpdates();
    }
  }, [data]);

  const prevFormDataRef = useRef<Record<string, unknown>>({});

  useEffect(() => {
    const ex = async () => {
      const prevFormData = prevFormDataRef.current;
      if (prevFormData) {
        for (const field in formData) {
          const newValue = formData[field];
          const oldValue = prevFormData[field];

          if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
            for (const i in expressDict) {
              if (expressDict[i].includes(field)) {
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
                  console.log({ [i]: result.data.value });

                  setFormData((pre) => ({ ...pre, [i]: result.data.value }));
                }
              }
            }
          }
        }
      }
      prevFormDataRef.current = formData;
    };

    ex()
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
