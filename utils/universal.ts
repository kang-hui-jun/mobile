import { curry, map, pipe } from "ramda";
import { Maybe } from "./functor";
import { Cell, PickListItem } from "@/types/mobile-layout";
import dayjs from "dayjs";
import { LayoutData } from ".";
import { ComponentType } from "@/constants/mobile";

const matchWith = curry((reg, str) => str.match(reg) || []);

const cleanId = (item: string) =>
  item.includes("Id.") ? item.split(".")[1] : item;

const stripBraces = (item: string) => item.slice(1, -1);

// 处理以 "=" 开头的表达式
export const pipeWithEqual = pipe(
  matchWith(/\{.*?\}/g) as (str: string) => string[],
  map(stripBraces),
  map(cleanId),
);

// 普通处理
export const pipeDefault = pipe(
  matchWith(/c__[a-z_]+(Id)?\.?(c__[a-z]+)?/g) as (str: string) => string[],
  map(cleanId),
);

export const regGetField = (express: string) => {
  if (!express) return [];
  const runPipeline = express[0] === "=" ? pipeWithEqual : pipeDefault;

  try {
    return runPipeline(express);
  } catch (e) {
    return [];
  }
};

export const formatResult = (raw: string, currentVal: unknown) => {
  if (typeof currentVal !== "object" || currentVal === null) {
    return raw;
  }

  const [label, value] = String(raw).split("@@");
  return { label, value };
};

export const cleanFormula = (formula: string): string =>
  formula.replace(/{|}/g, "").replace(/\./g, "_");

export const getDepParams = (deps: string[], formData: any) =>
  deps.reduce(
    (acc, field) => ({
      ...acc,
      [field]: formData[field]?.value ?? formData[field],
    }),
    {},
  );

// Picklist
const getDefaultFromPick = (pickList: PickListItem[], rowName: string) =>
  Maybe.of(pickList.find((p) => p.fieldName === rowName))
    .map((p) => p?.options.find((o) => o.isDefault === "Y"))
    .map((o) => o?.lable)
    .getOrElse("");

// 日期
const getDateValue = (row: Cell) =>
  row.defaultValue === "$NOW$" || row.type === "date"
    ? dayjs().format("YYYY-MM-DD")
    : row.defaultValue || "";

// 报文
const initialDocComponent = {
  content: "",
  pictures: {
    g_value: [],
    g_fieldValue: [],
    g_valuePicture: [],
  },
  files: {
    g_value: [],
    g_fieldValue: [],
    g_valuePicture: [],
  },
  labels: {
    g_value: [],
  },
};

const getReferenceDefault = (row: Cell) => {
  return {
    label: row.defaultValueLabel || "",
    value: row.defaultValue || "",
  };
};

export const getInitialValue = (row: Cell, baseLayout: LayoutData) => {
  const strategies: Record<ComponentType | "default", () => any> = {
    ...Object.create(null),
    picklist: () => getDefaultFromPick(baseLayout.pickList, row.name),
    attachment: () => row.defaultValue || [],
    picture: () => row.defaultValue || [],
    docComponent: () => row.defaultValue || initialDocComponent,
    reference: () => getReferenceDefault(row),
    default: () => getDateValue(row),
  };

  return (strategies[row.type] || strategies.default)();
};
