// 组件类型
export const componentType = [
  "reference",
  "autonumber",
  "text",
  "phone",
  "picklist",
  "datetime",
  "date",
  "money",
  "attachment",
  "textarea",
  "picture",
  "multi",
  "referencelist",
  "simpleInput",
  "location",
  "queryAssignment",
  "number",
  "area",
  "barcode",
  "docComponent",
  "decimal"

] as const;

export type ComponentType = (typeof componentType)[number];
