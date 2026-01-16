import { useEntityAnalysisField } from "@/service/home";
import { useAuth } from "@/store";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { useMemo } from "react";
import { Card, Spinner, Text, XStack, YStack } from "tamagui";
dayjs.extend(isoWeek);

export function getWeekRange() {
  const now = dayjs();
  const startOfWeek = now.startOf("isoWeek").format("MM月DD日");
  const endOfWeek = now.endOf("isoWeek").format("MM月DD日");
  const startRaw = now.startOf("isoWeek").format("YYYY-MM-DD");
  const endRaw = now.endOf("isoWeek").format("YYYY-MM-DD");

  return {
    weekText: `${startOfWeek}-${endOfWeek}`,
    startRaw,
    endRaw,
  };
}

export const Jyb = () => {
  const { user } = useAuth();

  const today = dayjs().format("MM-DD");
  const todayRaw = dayjs().format("YYYY-MM-DD");
  const tomorrowRaw = dayjs().add(1, "day").format("YYYY-MM-DD");
  const week = useMemo(() => getWeekRange(), []);
  const currentMonthText = dayjs().format("MM月");
  const startOfMonth = dayjs().startOf("month").format("YYYY-MM-DD");
  const endOfMonth = dayjs().endOf("month").format("YYYY-MM-DD");

  const paramsConfig = useMemo(() => {
    const isSpecialVersion = ["NKB", "HYB"].includes(user?.versionSystem || "");
    const base = {
      entity1: "e__fkjl",
      field1: "c__zhichujine",
      dateField1: "c__zhichuriqi",
    };

    return isSpecialVersion
      ? {
          ...base,
          entity2: "e__skjl",
          field2: "c__shoukuanjine",
          dateField2: "c__shoukuanriqi",
        }
      : {
          ...base,
          entity2: "ReturnMoneyRecord",
          field2: "actualAmount",
          dateField2: "receivedDate",
        };
  }, [user?.versionSystem]);

  const queries = useMemo(
    () => ({
      today: [
        [
          {
            fieldName: paramsConfig.dateField1,
            operator: ">=",
            value: todayRaw,
          },
          {
            fieldName: paramsConfig.dateField1,
            operator: "<",
            value: tomorrowRaw,
          },
        ],
        [
          {
            fieldName: paramsConfig.dateField2,
            operator: ">=",
            value: todayRaw,
          },
          {
            fieldName: paramsConfig.dateField2,
            operator: "<",
            value: tomorrowRaw,
          },
        ],
      ],
      week: [
        [
          {
            fieldName: paramsConfig.dateField1,
            operator: ">=",
            value: week.startRaw,
          },
          {
            fieldName: paramsConfig.dateField1,
            operator: "<=",
            value: `${week.endRaw} 23:59:59`,
          },
        ],
        [
          {
            fieldName: paramsConfig.dateField2,
            operator: ">=",
            value: week.startRaw,
          },
          {
            fieldName: paramsConfig.dateField2,
            operator: "<=",
            value: `${week.endRaw} 23:59:59`,
          },
        ],
      ],
      month: [
        [
          {
            fieldName: paramsConfig.dateField1,
            operator: ">=",
            value: startOfMonth,
          },
          {
            fieldName: paramsConfig.dateField1,
            operator: "<=",
            value: `${endOfMonth} 23:59:59`,
          },
        ],
        [
          {
            fieldName: paramsConfig.dateField2,
            operator: ">=",
            value: startOfMonth,
          },
          {
            fieldName: paramsConfig.dateField2,
            operator: "<=",
            value: `${endOfMonth} 23:59:59`,
          },
        ],
      ],
    }),
    [paramsConfig, todayRaw, tomorrowRaw, week, startOfMonth, endOfMonth]
  );

  const { data: todayOut, isLoading } = useEntityAnalysisField(
    {
      entityName: paramsConfig.entity1,
      fields: paramsConfig.field1,
      analysisType: "sum",
    },
    {
      filters: queries.today[0],
      type: "AND",
    }
  );
  const { data: todayIn } = useEntityAnalysisField(
    {
      entityName: paramsConfig.entity2,
      fields: paramsConfig.field2,
      analysisType: "sum",
    },
    {
      filters: queries.today[1],
      type: "AND",
    }
  );
  const { data: weekOut } = useEntityAnalysisField(
    {
      entityName: paramsConfig.entity1,
      fields: paramsConfig.field1,
      analysisType: "sum",
    },
    {
      filters: queries.week[0],
      type: "AND",
    }
  );
  const { data: weekIn } = useEntityAnalysisField(
    {
      entityName: paramsConfig.entity2,
      fields: paramsConfig.field2,
      analysisType: "sum",
    },
    { filters: queries.week[1], type: "AND" }
  );
  const { data: monthOut } = useEntityAnalysisField(
    {
      entityName: paramsConfig.entity1,
      fields: paramsConfig.field1,
      analysisType: "sum",
    },
    { filters: queries.month[0], type: "AND" }
  );
  const { data: monthIn } = useEntityAnalysisField(
    {
      entityName: paramsConfig.entity2,
      fields: paramsConfig.field2,
      analysisType: "sum",
    },
    {
      filters: queries.month[1],
      type: "AND",
    }
  );

  if (isLoading) return <Spinner size="small" color="$green10" />;

  return (
    <Card bg={"#FFF"} borderRadius="$0">
      <Card.Header>
        <Text>收支详情</Text>
      </Card.Header>
      <XStack p={16} pt={0} justifyContent="space-between" gap={16}>
        <YStack gap={16} w={"48%"}>
          <Card bg={"#ffede4"} h={96} p={10}>
            <Text fontSize={"$2"}>{today}</Text>
            <XStack>
              <Text fontSize={"$2"}>收入</Text>
              <Text fontSize={"$2"}>{todayIn}</Text>
            </XStack>
            <XStack>
              <Text fontSize={"$2"}>支出</Text>
              <Text fontSize={"$2"}>{todayOut}</Text>
            </XStack>
          </Card>
          <Card bg={"#ffede4"} h={96} p={10}>
            <Text fontSize={"$2"}>{week.weekText}</Text>

            <XStack>
              <Text fontSize={"$2"}>收入</Text>
              <Text fontSize={"$2"}>{weekIn}</Text>
            </XStack>
            <XStack>
              <Text fontSize={"$2"}>支出</Text>
              <Text fontSize={"$2"}>{weekOut}</Text>
            </XStack>
          </Card>
        </YStack>
        <Card bg={"#ffede4"} h={208} p={10} flex={1}>
          <Text fontSize={"$2"}>{currentMonthText}</Text>

          <XStack>
            <Text fontSize={"$2"}>收入</Text>
            <Text fontSize={"$2"}>{monthIn}</Text>
          </XStack>
          <XStack>
            <Text fontSize={"$2"}>支出</Text>
            <Text fontSize={"$2"}>{monthOut}</Text>
          </XStack>
        </Card>
      </XStack>
    </Card>
  );
};
