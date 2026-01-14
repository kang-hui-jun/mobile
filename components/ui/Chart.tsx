import { ModuleItem } from "@/types/home-data-board";
import { Card, Text } from "tamagui";

interface ChartProps {
  chartData: ModuleItem;
}

export const Chart = ({ chartData }: ChartProps) => {
  return (
    <Card bg={"#FFF"} borderRadius="$0">
      <Card.Header>
        <Text>{chartData.label}</Text>
      </Card.Header>
    </Card>
  );
};
