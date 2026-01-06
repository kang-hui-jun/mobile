import { componentType, userNameField } from "@/constants/mobile";
import { useMobileLayoutV2 } from "@/service/universal";
import { useAuth } from "@/store";
import { Area, Cell, MobileLayout, Row } from "@/types/mobile-layout";
import { useHttp } from "./http";

const mapRow = (area: Area) => ({
  ...area,
  rows: area.rows.flatMap((row: Row) => row.cells),
});

// 处理布局数据
export const handleLayout = (data: MobileLayout) => {
  const result = {
    ...data,
    areas: data.areas.map(mapRow),
    hasDetail: {
      ...data.hasDetail,
      detailInfoAreas: data.hasDetail.detailInfoAreas.map(mapRow),
      detailLayout: data.hasDetail.detailLayout.map(mapRow),
    },
    listAreas: data.listAreas.map(mapRow),
  };
  return result;
};

export type LayoutData = ReturnType<typeof handleLayout>;

type InitControlsParams = {
  entity: string;
  status: "add" | "edit";
  layout_id: string;
};

// 初始化布局
export const useInitControls = (params: InitControlsParams) => {
  const { entity, status, layout_id } = params;
  return useInitDetailLayout({ entity, status, layout_id, type: 1 });
};

type InitDetailLayout = {
  entity: string;
  type: number;
  status: string;
  layout_id: string;
  entityId?: string;
};

type Quote = {
  index: number;
  seq: number;
  nameField: Cell["nameField"];
  value: {
    id: Cell["nameField"];
  };
};

// 表单布局
export const useInitDetailLayout = (params: InitDetailLayout) => {
  const {
    data: layoutData,
    isLoading,
    error,
  } = useMobileLayoutV2({
    entity: params.entity,
    id: "",
    multipleLayoutId: params.layout_id,
  });

  return {
    layoutData,
    isLoading,
    error,
  };
};

// 初始化映射和级联映射
export const useInitEntityCascade = (params: Quote, layoutData: LayoutData) => {
  const { entity, name } = layoutData["areas"][params.index].rows[params.seq];

  // 明细模块名
  const detailEntityName = layoutData["hasDetail"]["detailEntityName"];
  if (!params.value.id) return layoutData;
};

export const getCurrentDate = (): string => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// 判断是否有值并且类型是reference或者是用户字段名

export const shouldMapReferenceField = (cell: Cell) => {
  return (
    (cell.defaultValue && cell.type === componentType.reference) ||
    cell.name === userNameField
  );
};
