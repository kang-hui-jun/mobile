import { ComponentType } from "@/constants/mobile";

export type MobileLayout = {
  hasDetail: HasDetail;
  isUseAuditFlow: boolean;
  pickList: PickListItem[];
  areas: Area[];
  listAreas: Area[];
  detailLayoutId: string;
  isUseShare: boolean;
  layoutId: string;
  multi: unknown[];
};

export type HasDetail = {
  detailEntityLabel: string;
  detailInfoAreas: Area[];
  detailMulti: unknown[];
  detailLayout: Area[];
  detailEntityName: string;
  detailPickList: unknown[];
};

export type Area = {
  isShowFieldName: string;
  useEmptyJudgment: string;
  useDeleteTips: string;
  isSpread: string;
  lastId: string;
  id: string;
  packUpDetail: boolean;
  rows: Row[];
  title: string;
};

export type Row = {
  cells: Cell[];
};

export type Cell = {
  // common
  name: string;
  label: string;
  type: ComponentType;
  entity?: string;
  to?: string;
  value?: string;

  // display / layout
  width?: string;
  detailedWidth?: string;
  rows?: number;
  length?: number;
  showFields?: string;
  defaultValueLabel?: string;

  // behavior / validation
  req?: string;
  readable: boolean;
  canUpdate: boolean;
  canCreate?: boolean;
  canMultiple?: boolean;
  compute?: boolean;
  allowFrontEdit?: boolean;
  allowUpload?: boolean;
  allowUploadPicture?: boolean;
  allowUploadAttachment?: boolean;
  allowUploadProgress?: boolean;
  allowPhotograph?: boolean;
  enableRepeat?: boolean;
  enableRepeatMust?: boolean;
  selectionFinalLevel?: boolean;
  onlyWebExpression?: boolean;
  autoLocation?: boolean;
  lockRemoveLayout?: boolean;

  // numeric / precision
  precision?: number;

  // auxiliaries
  defaultValue?: string;
  fieldDefaultValue?: string;
  docSelectField?: string;
  nameField?: string;
  text?: string;
  express?: string;
  options?: string;
  pictureSize?: string;
  pictureSizeLimit?: string;
  attachments?: string;
  pictures?: string;
  lnglat?: string;
  desc?: string;
  timeId?: string;
  list?: string;
  dynamicScript?: string;
  loadDynamicScript?: boolean;
  referenceFilterCondition?: ReferenceFilterCondition | string;
  dataCascade?: string;
  toMain?: string;
  attendTotal?: boolean;
  attachmentSizeLimit?: string;
};

export type PickListItem = {
  fieldName: string;
  options: PickListOption[];
};

export type PickListOption = {
  isDefault?: string;
  lable?: string;
  label?: string;
  value: string;
};

export type ReferenceFilter = {
  fieldName: string;
  type: string;
  filterType?: "AND" | "OR" | string;
  value?: string | number | boolean | null | Array<string | number | boolean>;
  operator?: string;
};

export type ReferenceFilterCondition =
  | {
      children: ReferenceFilterCondition[];
      filters: ReferenceFilter[];
      type: "AND" | "OR" | string;
    }
  | {
      fieldName: string;
      type: string;
      filterType: string;
      value: string | number;
      operator: string;
    }[];
