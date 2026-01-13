import { userNameField } from "@/constants";
import { useMobileLayoutV2 } from "@/service/universal";
import { ModuleData } from "@/types/home-data-board";
import { Menu } from "@/types/menu";
import { Area, Cell, MobileLayout, Row } from "@/types/mobile-layout";
import { User } from "@/types/user";

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
      ...data?.hasDetail,
      detailInfoAreas: data?.hasDetail?.detailInfoAreas?.map(mapRow),
      detailLayout: data?.hasDetail?.detailLayout?.map(mapRow),
    },
    listAreas: data?.listAreas?.map(mapRow),
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
    (cell.defaultValue && cell.type === "reference") ||
    cell.name === userNameField
  );
};

export const transformMenu = (menus: Menu[], user: User | null) => {
  // 1. 禁用列表和常量定义
  const disabledApp = [
    "EventCalendar",
    "FreshStatistics",
    "Analysis",
    "CallRecord",
    "ManageUser",
    "Report",
    "SmsMain",
    "Home",
    "manageUser",
    "e__kcydjl",
  ];
  const systemVersion = ["OCQ_JZZB", "OCQ_TYJZ", "OCQ_TYGJ", "OCQ_XMZB"];
  const jz = ["记账", "【记账】"];

  const moreChildren: Menu[] = [];

  const result = menus.reduce((acc: Menu[], menu) => {
    if (!menu?.children || menu.children.length === 0) {
      moreChildren.push(menu);
      return acc;
    }

    let newChildren = [...menu.children];

    const isSpecialVersion = systemVersion.includes(user?.systemVersion || "");
    const isJzMenu = jz.includes(menu.menuName);

    if (!isSpecialVersion && !isJzMenu) {
      const hasAccount = newChildren.some(
        (child) => child.menuName === "ACCOUNT"
      );
      const hasContacts = newChildren.some(
        (child) => child.menuName === "mailList"
      );

      if (hasAccount && !hasContacts) {
        newChildren.push({
          menuIcon: "tongxunlu",
          menuLabel: "通讯录",
          menuName: "mailList",
          menuUrl: "/acc/mailList",
        });
      }
    }

    acc.push({ ...menu, children: newChildren });
    return acc;
  }, []);

  if (moreChildren.length > 0) {
    result.push({
      menuIcon: "",
      menuUrl: "",
      menuName: "更多",
      menuLabel: "更多",
      children: moreChildren,
    });
  }

  return result;
};

export const processModuleListData = (module_list_data: ModuleData) => {
  const result = deepClone(module_list_data);
  
};

function deepClone(module_list_data: ModuleData): ModuleData {
  if (typeof (globalThis as any).structuredClone === "function") {
    return (globalThis as any).structuredClone(module_list_data);
  }

  const visited = new WeakMap();
  const cloneValue = <T>(value: T): T => {
    if (value === null || typeof value !== "object") return value;
    // Dates
    if (value instanceof Date) return new Date(value.getTime()) as any;
    // RegExp
    if (value instanceof RegExp)
      return new RegExp(value.source, value.flags) as any;
    // Map
    if (value instanceof Map) {
      if (visited.has(value as any)) return visited.get(value as any);
      const m = new Map();
      visited.set(value as any, m);
      (value as Map<any, any>).forEach((v, k) =>
        m.set(cloneValue(k), cloneValue(v))
      );
      return m as any;
    }
    // Set
    if (value instanceof Set) {
      if (visited.has(value as any)) return visited.get(value as any);
      const s = new Set();
      visited.set(value as any, s);
      (value as Set<any>).forEach((v) => s.add(cloneValue(v)));
      return s as any;
    }
    // Array
    if (Array.isArray(value)) {
      if (visited.has(value as any)) return visited.get(value as any);
      const arr: any[] = [];
      visited.set(value as any, arr);
      (value as any[]).forEach((v, i) => (arr[i] = cloneValue(v)));
      return arr as any;
    }
    if (visited.has(value as any)) return visited.get(value as any);
    const obj: any = {};
    visited.set(value as any, obj);
    Object.keys(value as any).forEach((k) => {
      obj[k] = cloneValue((value as any)[k]);
    });
    Object.getOwnPropertySymbols(value as any).forEach((s) => {
      obj[s as any] = cloneValue((value as any)[s as any]);
    });
    return obj;
  };

  return cloneValue(module_list_data);
}
