type Cid = "applicationList" | "incomeDetails" | "messageList" | "dataPlate";
type ComponentType = "NUMBER" | "CHART";
type ChartType =
  | "ORDER"
  | "CLUSTER_BAR"
  | "BAR"
  | "BAR2"
  | "PIE"
  | "LINE"
  | "FUNNEL"
  | "ECHARTS_FUNNEL"
  | "GAUGE"
  | "LINE_MIX_BAR";

export type AppData = {
  bgColor: string;
  color: string;
  img: string;
  menuIcon: string;
  menuLabel: string;
  menuName: string;
  menuUrl: string;
  name: string;
  operate: string;
  show: boolean;
};

export type ModuleData = {
  [key in string]: {
    children: [];
    cid: Cid;
    dataPlate: DataPlate[];
    id: number;
    label: string;
    name: string;
    size: string;
    theme: string;
    type: ComponentType;
    chartType?: ChartType;
  }[];
};

export type DataPlate = {
  id: string;
  name: string;
};

export type Configuration = {
  app_list_data: AppData[];
  module_list_data: ModuleData;
};

export type HomeDataBoard = {
  userConfigurationInfo: {
    configurationJson: Configuration;
    configurationType: string;
    owner: string;
    entity: string;
  };
};
