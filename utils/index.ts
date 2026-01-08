import { componentType } from "@/constants/mobile";
import { useMobileLayoutV2 } from "@/service/universal";
import { useAuth } from "@/store";
import { Area, Cell, MobileLayout, Row } from "@/types/mobile-layout";
import { useHttp } from "./http";
import { Menu } from "@/types/menu";
import { ACCOUNT, userNameField } from "@/constants";
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

export const menuList = [
  {
    menuIcon: "",
    menuUrl: "",
    children: [
      {
        menuIcon: "A037",
        menuUrl: "/genericEntity/showGrid?entity=e__gys",
        menuName: "e__gys",
        menuLabel: "供应商",
        name: "供应商",
        bgColor: "rgba(255,134,75,.15)",
        color: "#FF864B",
        img: "iconA037",
        operate: "empty",
      },
      {
        menuIcon: "E24D",
        menuUrl: "/genericEntity/showGrid?entity=e__cgdd",
        menuName: "e__cgdd",
        menuLabel: "采购订单",
        name: "采购订单",
        bgColor: "rgba(255,134,75,.15)",
        color: "#FF864B",
        img: "iconE24D",
        operate: "empty",
      },
      {
        menuIcon: "E558",
        menuUrl: "/genericEntity/showGrid?entity=e__rkjl",
        menuName: "e__rkjl",
        menuLabel: "采购入库",
        name: "采购入库",
        bgColor: "rgba(255,134,75,.15)",
        color: "#FF864B",
        img: "iconE558",
        operate: "empty",
      },
      {
        menuIcon: "E24D",
        menuUrl: "/genericEntity/showGrid?entity=e__cgth",
        menuName: "e__cgth",
        menuLabel: "采购退货",
        name: "采购退货",
        bgColor: "rgba(255,134,75,.15)",
        color: "#FF864B",
        img: "iconE24D",
        operate: "empty",
      },
      {
        menuIcon: "E24D",
        menuUrl: "/invoice/showGrid?entity=Invoice",
        menuName: "Invoice",
        menuLabel: "采购开票",
        name: "采购开票",
        bgColor: "rgba(255,134,75,.15)",
        color: "#FF864B",
        img: "iconE24D",
        operate: "empty",
      },
      {
        menuIcon: "A037",
        menuUrl: "/genericEntity/showGrid?entity=e__fkjl",
        menuName: "e__fkjl",
        menuLabel: "采购付款",
        name: "采购付款",
        bgColor: "rgba(255,134,75,.15)",
        color: "#FF864B",
        img: "iconA037",
        operate: "empty",
      },
      {
        menuIcon: "E24D",
        menuUrl: "/genericEntity/showGrid?entity=e__cgdz",
        menuName: "e__cgdz",
        menuLabel: "采购对账",
        name: "采购对账",
        bgColor: "rgba(255,134,75,.15)",
        color: "#FF864B",
        img: "iconE24D",
        operate: "empty",
      },
      {
        menuIcon: "A046",
        menuUrl: "/genericEntity/showGrid?entity=e__zcsq",
        menuName: "e__zcsq",
        menuLabel: "支出申请",
        name: "支出申请",
        bgColor: "rgba(255,134,75,.15)",
        color: "#FF864B",
        img: "iconA046",
        operate: "empty",
      },
      {
        menuIcon: "E24D",
        menuUrl: "/document/showGrid?entity=Document",
        menuName: "Document",
        menuLabel: "文件",
        name: "文件",
        bgColor: "rgba(255,134,75,.15)",
        color: "#FF864B",
        img: "iconE24D",
        operate: "empty",
      },
      {
        menuIcon: "E85D",
        menuUrl: "/salesOrder/showGrid?entity=SalesOrder",
        menuName: "SalesOrder",
        menuLabel: "订单",
        name: "订单",
        bgColor: "rgba(255,134,75,.15)",
        color: "#FF864B",
        img: "iconE85D",
        operate: "empty",
      },
      {
        menuIcon: "E918",
        menuUrl: "/product/showGrid?entity=Product",
        menuName: "Product",
        menuLabel: "产品",
        name: "产品",
        bgColor: "rgba(255,134,75,.15)",
        color: "#FF864B",
        img: "iconE918",
        operate: "empty",
      },
      {
        menuIcon: "E24D",
        menuUrl: "/genericEntity/showGrid?entity=e__fz",
        menuName: "e__fz",
        menuLabel: "fz",
        name: "fz",
        bgColor: "rgba(255,134,75,.15)",
        color: "#FF864B",
        img: "iconE24D",
        operate: "add",
      },
    ],
    menuName: "采购",
    menuLabel: "采购",
  },
  {
    menuIcon: "",
    menuUrl: "",
    children: [
      {
        menuIcon: "A077",
        menuUrl: "/accountList/showGrid?entity=Account",
        menuName: "Account",
        menuLabel: "客户",
        name: "客户",
        bgColor: "rgba(87,141,217,.15)",
        color: "#578DD9",
        img: "iconA077",
        operate: "empty",
      },
      {
        menuIcon: "tongxunlu",
        menuLabel: "通讯录",
        menuName: "mailList",
        menuUrl: "/acc/mailList",
        name: "通讯录",
        bgColor: "rgba(87,141,217,.15)",
        color: "#578DD9",
        img: "icontongxunlu",
        operate: "add",
      },
      {
        menuIcon: "E85D",
        menuUrl: "/salesOrder/showGrid?entity=SalesOrder",
        menuName: "SalesOrder",
        menuLabel: "销售订单",
        name: "销售订单",
        bgColor: "rgba(87,141,217,.15)",
        color: "#578DD9",
        img: "iconE85D",
        operate: "empty",
      },
      {
        menuIcon: "E547",
        menuUrl: "/genericEntity/showGrid?entity=e__ckjl",
        menuName: "e__ckjl",
        menuLabel: "销售出库",
        name: "销售出库",
        bgColor: "rgba(87,141,217,.15)",
        color: "#578DD9",
        img: "iconE547",
        operate: "empty",
      },
      {
        menuIcon: "E24D",
        menuUrl: "/genericEntity/showGrid?entity=e__xsth",
        menuName: "e__xsth",
        menuLabel: "销售退货",
        name: "销售退货",
        bgColor: "rgba(87,141,217,.15)",
        color: "#578DD9",
        img: "iconE24D",
        operate: "empty",
      },
      {
        menuIcon: "E24D",
        menuUrl: "/invoice/showGrid?entity=Invoice",
        menuName: "Invoice",
        menuLabel: "销售开票",
        name: "销售开票",
        bgColor: "rgba(87,141,217,.15)",
        color: "#578DD9",
        img: "iconE24D",
        operate: "empty",
      },
      {
        menuIcon: "E3A1",
        menuUrl: "/genericEntity/showGrid?entity=e__skjl",
        menuName: "e__skjl",
        menuLabel: "销售收款",
        name: "销售收款",
        bgColor: "rgba(87,141,217,.15)",
        color: "#578DD9",
        img: "iconE3A1",
        operate: "empty",
      },
      {
        menuIcon: "E24D",
        menuUrl: "/genericEntity/showGrid?entity=e__xsdz",
        menuName: "e__xsdz",
        menuLabel: "销售对账",
        name: "销售对账",
        bgColor: "rgba(87,141,217,.15)",
        color: "#578DD9",
        img: "iconE24D",
        operate: "empty",
      },
      {
        menuIcon: "A042",
        menuUrl: "/genericEntity/showGrid?entity=e__skdj",
        menuName: "e__skdj",
        menuLabel: "收款登记",
        name: "收款登记",
        bgColor: "rgba(87,141,217,.15)",
        color: "#578DD9",
        img: "iconA042",
        operate: "empty",
      },
      {
        menuIcon: "E8A1",
        menuUrl: "/genericEntity/showGrid?entity=e__kjpz",
        menuName: "e__kjpz",
        menuLabel: "会计",
        name: "会计",
        bgColor: "rgba(87,141,217,.15)",
        color: "#578DD9",
        img: "iconE8A1",
        operate: "add",
      },
    ],
    menuName: "业务",
    menuLabel: "销售",
  },
  {
    menuIcon: "",
    menuUrl: "",
    children: [
      {
        menuIcon: "E558",
        menuUrl: "/genericEntity/showGrid?entity=e__rkjl",
        menuName: "e__rkjl",
        menuLabel: "采购入库",
        name: "采购入库",
        bgColor: "rgba(242,98,85,.15)",
        color: "#F26255",
        img: "iconE558",
        operate: "empty",
      },
      {
        menuIcon: "E547",
        menuUrl: "/genericEntity/showGrid?entity=e__ckjl",
        menuName: "e__ckjl",
        menuLabel: "销售出库",
        name: "销售出库",
        bgColor: "rgba(242,98,85,.15)",
        color: "#F26255",
        img: "iconE547",
        operate: "empty",
      },
      {
        menuIcon: "E8A0",
        menuUrl: "/genericEntity/showGrid?entity=e__kcpd",
        menuName: "e__kcpd",
        menuLabel: "库存盘点",
        name: "库存盘点",
        bgColor: "rgba(242,98,85,.15)",
        color: "#F26255",
        img: "iconE8A0",
        operate: "empty",
      },
      {
        menuIcon: "A076",
        menuUrl: "/genericEntity/showGrid?entity=e__kctb",
        menuName: "e__kctb",
        menuLabel: "库存调拨",
        name: "库存调拨",
        bgColor: "rgba(242,98,85,.15)",
        color: "#F26255",
        img: "iconA076",
        operate: "empty",
      },
      {
        menuIcon: "E918",
        menuUrl: "/product/showGrid?entity=Product",
        menuName: "Product",
        menuLabel: "产品库存",
        name: "产品库存",
        bgColor: "rgba(242,98,85,.15)",
        color: "#F26255",
        img: "iconE918",
        operate: "empty",
      },
      {
        menuIcon: "E24D",
        menuUrl: "/genericEntity/showGrid?entity=e__dw",
        menuName: "e__dw",
        menuLabel: "计量单位",
        name: "计量单位",
        bgColor: "rgba(242,98,85,.15)",
        color: "#F26255",
        img: "iconE24D",
        operate: "empty",
      },
      {
        menuIcon: "E24D",
        menuUrl: "/genericEntity/showGrid?entity=e__cpkcb",
        menuName: "e__cpkcb",
        menuLabel: "库存明细表",
        name: "库存明细表",
        bgColor: "rgba(242,98,85,.15)",
        color: "#F26255",
        img: "iconE24D",
        operate: "empty",
      },
      {
        menuIcon: "E24D",
        menuUrl: "/genericEntity/showGrid?entity=e__kcydb",
        menuName: "e__kcydb",
        menuLabel: "库存异动表",
        name: "库存异动表",
        bgColor: "rgba(242,98,85,.15)",
        color: "#F26255",
        img: "iconE24D",
        operate: "empty",
      },
      {
        menuIcon: "E24D",
        menuUrl: "/genericEntity/showGrid?entity=e__ck",
        menuName: "e__ck",
        menuLabel: "存储仓库",
        name: "存储仓库",
        bgColor: "rgba(242,98,85,.15)",
        color: "#F26255",
        img: "iconE24D",
        operate: "add",
      },
      {
        menuIcon: "E24D",
        menuUrl: "/genericEntity/showGrid?entity=e__cw",
        menuName: "e__cw",
        menuLabel: "存储仓位",
        name: "存储仓位",
        bgColor: "rgba(242,98,85,.15)",
        color: "#F26255",
        img: "iconE24D",
        operate: "add",
      },
      {
        menuIcon: "E24D",
        menuUrl: "/genericEntity/showGrid?entity=e__qtrk",
        menuName: "e__qtrk",
        menuLabel: "其它入库",
        name: "其它入库",
        bgColor: "rgba(242,98,85,.15)",
        color: "#F26255",
        img: "iconE24D",
        operate: "add",
      },
      {
        menuIcon: "E24D",
        menuUrl: "/genericEntity/showGrid?entity=e__qtck",
        menuName: "e__qtck",
        menuLabel: "其它出库",
        name: "其它出库",
        bgColor: "rgba(242,98,85,.15)",
        color: "#F26255",
        img: "iconE24D",
        operate: "add",
      },
      {
        menuIcon: "E24D",
        menuUrl: "/genericEntity/showGrid?entity=e__xsth",
        menuName: "e__xsth",
        menuLabel: "销售退货",
        name: "销售退货",
        bgColor: "rgba(242,98,85,.15)",
        color: "#F26255",
        img: "iconE24D",
        operate: "empty",
      },
    ],
    menuName: "仓库 ",
    menuLabel: "仓库 ",
  },
  {
    menuIcon: "",
    menuUrl: "",
    children: [
      {
        menuIcon: "E24D",
        menuUrl: "/genericEntity/showGrid?entity=e__wfddnew",
        menuName: "e__wfddnew",
        menuLabel: "生产订单",
        name: "生产订单",
        bgColor: "rgba(255,134,75,.15)",
        color: "#FF864B",
        img: "iconE24D",
        operate: "add",
      },
      {
        menuIcon: "E24D",
        menuUrl: "/genericEntity/showGrid?entity=e__wfcp",
        menuName: "e__wfcp",
        menuLabel: "计划发料",
        name: "计划发料",
        bgColor: "rgba(255,134,75,.15)",
        color: "#FF864B",
        img: "iconE24D",
        operate: "empty",
      },
      {
        menuIcon: "E24D",
        menuUrl: "/genericEntity/showGrid?entity=e__wfflnew",
        menuName: "e__wfflnew",
        menuLabel: "生产发料",
        name: "生产发料",
        bgColor: "rgba(255,134,75,.15)",
        color: "#FF864B",
        img: "iconE24D",
        operate: "add",
      },
      {
        menuIcon: "E24D",
        menuUrl: "/genericEntity/showGrid?entity=e__wftlnew",
        menuName: "e__wftlnew",
        menuLabel: "生产退料",
        name: "生产退料",
        bgColor: "rgba(255,134,75,.15)",
        color: "#FF864B",
        img: "iconE24D",
        operate: "add",
      },
      {
        menuIcon: "E24D",
        menuUrl: "/genericEntity/showGrid?entity=e__wfrknew",
        menuName: "e__wfrknew",
        menuLabel: "生产入库",
        name: "生产入库",
        bgColor: "rgba(255,134,75,.15)",
        color: "#FF864B",
        img: "iconE24D",
        operate: "add",
      },
      {
        menuIcon: "E24D",
        menuUrl: "/genericEntity/showGrid?entity=e__wfhxmx",
        menuName: "e__wfhxmx",
        menuLabel: "生产核销",
        name: "生产核销",
        bgColor: "rgba(255,134,75,.15)",
        color: "#FF864B",
        img: "iconE24D",
        operate: "add",
      },
      {
        menuIcon: "E24D",
        menuUrl: "/genericEntity/showGrid?entity=e__wlmxd",
        menuName: "e__wlmxd",
        menuLabel: "物料清单",
        name: "物料清单",
        bgColor: "rgba(255,134,75,.15)",
        color: "#FF864B",
        img: "iconE24D",
        operate: "add",
      },
      {
        menuIcon: "E869",
        menuUrl: "/genericEntity/showGrid?entity=e__scgd",
        menuName: "e__scgd",
        menuLabel: "生产组装单",
        name: "生产组装单",
        bgColor: "rgba(255,134,75,.15)",
        color: "#FF864B",
        img: "iconE869",
        operate: "add",
      },
    ],
    menuName: "外发",
    menuLabel: "生产",
  },
  {
    menuIcon: "",
    menuUrl: "",
    children: [
      {
        menuIcon: "A015",
        menuUrl: "/genericEntity/showGrid?entity=e__yhzh",
        menuName: "e__yhzh",
        menuLabel: "资金账户",
        name: "资金账户",
        bgColor: "rgba(87,141,217,.15)",
        color: "#578DD9",
        img: "iconA015",
        operate: "add",
      },
      {
        menuIcon: "E918",
        menuUrl: "/product/showGrid?entity=Product",
        menuName: "Product",
        menuLabel: "库存商品",
        name: "库存商品",
        bgColor: "rgba(87,141,217,.15)",
        color: "#578DD9",
        img: "iconE918",
        operate: "empty",
      },
      {
        menuIcon: "E8F7",
        menuUrl: "/genericEntity/showGrid?entity=e__zcdj",
        menuName: "e__zcdj",
        menuLabel: "其它资产",
        name: "其它资产",
        bgColor: "rgba(87,141,217,.15)",
        color: "#578DD9",
        img: "iconE8F7",
        operate: "add",
      },
      {
        menuIcon: "E24D",
        menuUrl: "",
        menuName: "e__xsdz",
        menuLabel: "销售应收",
        name: "销售应收",
        bgColor: "rgba(87,141,217,.15)",
        color: "#578DD9",
        img: "iconE24D",
        operate: "empty",
      },
      {
        menuIcon: "A037",
        menuUrl: "/genericEntity/showGrid?entity=e__gys",
        menuName: "e__gys",
        menuLabel: "采购应付",
        name: "采购应付",
        bgColor: "rgba(87,141,217,.15)",
        color: "#578DD9",
        img: "iconA037",
        operate: "empty",
      },
      {
        menuIcon: "A031",
        menuUrl: "/genericEntity/showGrid?entity=e__wldw",
        menuName: "e__wldw",
        menuLabel: "其它往来",
        name: "其它往来",
        bgColor: "rgba(87,141,217,.15)",
        color: "#578DD9",
        img: "iconA031",
        operate: "add",
      },
      {
        menuIcon: "E3A1",
        menuUrl: "/genericEntity/showGrid?entity=e__skjl",
        menuName: "e__skjl",
        menuLabel: "回款记录",
        name: "回款记录",
        bgColor: "rgba(87,141,217,.15)",
        color: "#578DD9",
        img: "iconE3A1",
        operate: "empty",
      },
      {
        menuIcon: "A037",
        menuUrl: "/genericEntity/showGrid?entity=e__fkjl",
        menuName: "e__fkjl",
        menuLabel: "付款记录",
        name: "付款记录",
        bgColor: "rgba(87,141,217,.15)",
        color: "#578DD9",
        img: "iconA037",
        operate: "empty",
      },
      {
        menuIcon: "A031",
        menuUrl: "/genericEntity/showGrid?entity=e__zjtb",
        menuName: "e__zjtb",
        menuLabel: "资金调拨",
        name: "资金调拨",
        bgColor: "rgba(87,141,217,.15)",
        color: "#578DD9",
        img: "iconA031",
        operate: "add",
      },
      {
        menuIcon: "A007",
        menuUrl: "/genericEntity/showGrid?entity=e__zjpd",
        menuName: "e__zjpd",
        menuLabel: "资金盘点",
        name: "资金盘点",
        bgColor: "rgba(87,141,217,.15)",
        color: "#578DD9",
        img: "iconA007",
        operate: "add",
      },
      {
        menuIcon: "E24D",
        menuUrl: "/genericEntity/showGrid?entity=e__szlb",
        menuName: "e__szlb",
        menuLabel: "收支类别",
        name: "收支类别",
        bgColor: "rgba(87,141,217,.15)",
        color: "#578DD9",
        img: "iconE24D",
        operate: "add",
      },
      {
        menuIcon: "A046",
        menuUrl: "/genericEntity/showGrid?entity=e__zcsq",
        menuName: "e__zcsq",
        menuLabel: "支出申请",
        name: "支出申请",
        bgColor: "rgba(87,141,217,.15)",
        color: "#578DD9",
        img: "iconA046",
        operate: "empty",
      },
    ],
    menuName: "财务",
    menuLabel: "财务",
  },
  {
    menuIcon: "",
    menuUrl: "",
    children: [
      {
        menuIcon: "E24D",
        menuUrl: "/genericEntity/showGrid?entity=e__zcfz",
        menuName: "e__zcfz",
        menuLabel: "核算主体",
        name: "核算主体",
        bgColor: "rgba(242,98,85,.15)",
        color: "#F26255",
        img: "iconE24D",
        operate: "add",
      },
      {
        menuIcon: "A044",
        menuUrl: "/genericEntity/showGrid?entity=e__lrb",
        menuName: "e__lrb",
        menuLabel: "核算月份",
        name: "核算月份",
        bgColor: "rgba(242,98,85,.15)",
        color: "#F26255",
        img: "iconA044",
        operate: "add",
      },
      {
        menuIcon: "E24D",
        menuUrl: "/genericEntity/showGrid?entity=e__cgdz",
        menuName: "e__cgdz",
        menuLabel: "采购对账",
        name: "采购对账",
        bgColor: "rgba(242,98,85,.15)",
        color: "#F26255",
        img: "iconE24D",
        operate: "empty",
      },
      {
        menuIcon: "E24D",
        menuUrl: "/genericEntity/showGrid?entity=e__xsdz",
        menuName: "e__xsdz",
        menuLabel: "销售对账",
        name: "销售对账",
        bgColor: "rgba(242,98,85,.15)",
        color: "#F26255",
        img: "iconE24D",
        operate: "empty",
      },
      {
        menuIcon: "E24D",
        menuUrl: "/genericEntity/showGrid?entity=e__ysmxb",
        menuName: "e__ysmxb",
        menuLabel: "应收明细",
        name: "应收明细",
        bgColor: "rgba(242,98,85,.15)",
        color: "#F26255",
        img: "iconE24D",
        operate: "add",
      },
      {
        menuIcon: "E24D",
        menuUrl: "/genericEntity/showGrid?entity=e__yfmx",
        menuName: "e__yfmx",
        menuLabel: "应付明细",
        name: "应付明细",
        bgColor: "rgba(242,98,85,.15)",
        color: "#F26255",
        img: "iconE24D",
        operate: "add",
      },
      {
        menuIcon: "E24D",
        menuUrl: "/genericEntity/showGrid?entity=e__zczj",
        menuName: "e__zczj",
        menuLabel: "分摊明细",
        name: "分摊明细",
        bgColor: "rgba(242,98,85,.15)",
        color: "#F26255",
        img: "iconE24D",
        operate: "add",
      },
      {
        menuIcon: "A033",
        menuUrl: "/genericEntity/showGrid?entity=e__szmx",
        menuName: "e__szmx",
        menuLabel: "收支明细",
        name: "收支明细",
        bgColor: "rgba(242,98,85,.15)",
        color: "#F26255",
        img: "iconA033",
        operate: "add",
      },
      {
        menuIcon: "E24D",
        menuUrl:
          "/seniorSetting/moduleManagerment/getLayoutById?layoutId=209-12121ee1-20e1-4b7a-b4de-f8a7e7c4521c&layoutType=3",
        menuName: "layoutId:209-12121ee1-20e1-4b7a-b4de-f8a7e7c4521c",
        menuLabel: "经营报告",
        name: "经营报告",
        bgColor: "rgba(242,98,85,.15)",
        color: "#F26255",
        img: "iconE24D",
        operate: "add",
      },
      {
        menuIcon: "E24D",
        menuUrl:
          "/seniorSetting/moduleManagerment/getLayoutById?layoutId=209-b6126762-329a-47ae-8623-0a8d8adf2cae&layoutType=3",
        menuName: "layoutId:209-b6126762-329a-47ae-8623-0a8d8adf2cae",
        menuLabel: "a报表",
        name: "a报表",
        bgColor: "rgba(242,98,85,.15)",
        color: "#F26255",
        img: "iconE24D",
        operate: "add",
      },
      {
        menuIcon: "E24D",
        menuUrl:
          "/seniorSetting/moduleManagerment/getLayoutById?layoutId=209-f858ae73-cbeb-4a9c-ae87-3dca23e9946c&layoutType=3",
        menuName: "layoutId:209-f858ae73-cbeb-4a9c-ae87-3dca23e9946c",
        menuLabel: "测试导入",
        name: "测试导入",
        bgColor: "rgba(242,98,85,.15)",
        color: "#F26255",
        img: "iconE24D",
        operate: "add",
      },
      {
        menuIcon: "E24D",
        menuUrl:
          "/seniorSetting/moduleManagerment/getLayoutById?layoutId=209-57343595-7549-442f-9273-89e63bb5c3da&layoutType=3",
        menuName: "layoutId:209-57343595-7549-442f-9273-89e63bb5c3da",
        menuLabel: "测试3",
        name: "测试3",
        bgColor: "rgba(242,98,85,.15)",
        color: "#F26255",
        img: "iconE24D",
        operate: "add",
      },
    ],
    menuName: "报表",
    menuLabel: "报表",
  },
  {
    menuIcon: "",
    menuUrl: "",
    children: [
      {
        menuIcon: "E24D",
        menuUrl: "/genericEntity/showGrid?entity=e__xlhzt",
        menuName: "e__xlhzt",
        menuLabel: "序列号状态",
        name: "序列号状态",
        bgColor: "rgba(255,134,75,.15)",
        color: "#FF864B",
        img: "iconE24D",
        operate: "add",
      },
      {
        menuIcon: "E24D",
        menuUrl: "/genericEntity/showGrid?entity=e__xlhgzb",
        menuName: "e__xlhgzb",
        menuLabel: "序列号跟踪",
        name: "序列号跟踪",
        bgColor: "rgba(255,134,75,.15)",
        color: "#FF864B",
        img: "iconE24D",
        operate: "add",
      },
    ],
    menuName: "文件",
    menuLabel: "序列号",
  },
  {
    menuIcon: "",
    menuUrl: "",
    children: [
      {
        menuIcon: "E24D",
        menuUrl: "",
        menuName: "e__cp",
        menuLabel: "车票1",
        name: "车票1",
        bgColor: "rgba(87,141,217,.15)",
        color: "#578DD9",
        img: "iconE24D",
        operate: "add",
      },
    ],
    menuName: "车票",
    menuLabel: "车票",
  },
];
