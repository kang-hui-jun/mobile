export type JybEntityLayout = ContainerForm[];

export interface ContainerForm {
  usesubmit: boolean;
  css: ContainerCss;
  gid: string;
  expression: any[];
  methods: any[];
  columnsnum: number;
  description: string;
  label: Label;
  type: "ConfigContainerForm";
  childcss: ChildCss;
  bizrule: { rules: any[] };
  form: FormComponent[];
  datasource: LayoutDataSource[];
  name: { show: boolean; text: string };
  variable: any[];
}

export interface ContainerCss {
  print: PrintCss;
  paddingright: number;
  paddingbottom: number;
  width: { customvalue: string; type: string };
  paddingtop: number;
  paddingleft: number;
}
export interface PrintCss {
  pageformat_value: string;
  orientation: string;
  unit: string;
  pageformat_type: string;
  compress: boolean;
}
export interface ChildCss {
  margin_bottom: number;
  padding_left: number;
  margin_top: number;
  padding_right: number;
}

export interface Label {
  label_position: string;
  css: LabelCss;
  inline?: boolean;
  show: boolean;
  tooltip: string;
  placeholder_text: string;
  text: string;
  label_text_align?: string;
}
export interface LabelCss {
  fontweight: string;
  fontstyle: string;
  letterspacing: number;
  textdecoration: string;
  textalign: string;
  fontsize: number;
  fontcolor: string;
}

export type FormComponent = BaseComponent & Partial<Record<string, any>>;

export interface BaseComponent {
  sortindex: number;
  css: ComponentCss;
  gid: string;
  visible: boolean;
  expression: ExpressionRule[];
  methods: any[];
  modifier?: Modifier;
  description: string;
  label: Label;
  type: string;
  srch_pdf?: boolean;
  datasource?: ComponentDataSource;
  name: { show: boolean; text: string };
  banprint?: boolean;
  /* optional extras present in some components */
  listsource?: ListSource;
  btntext?: string;
  picture_h?: number;
  picture_w?: number;
  linenum?: number;
  decimalplace?: DecimalPlace;
}

export interface ComponentCss {
  pagebreak_before?: boolean;
  minh?: number;
  letterspacing?: number;
  h?: number;
  fontsize?: number;
  pagebreak_after?: boolean;
  bgcolor?: string;
  fontweight?: string;
  fontstyle?: string;
  minw?: number;
  w?: number;
  textdecoration?: string;
  textalign?: string;
  fontcolor?: string;
  height?: number;
  picture_h?: number;
  picture_w?: number;
  linenum?: number;
}

export interface ExpressionRule {
  msg: string;
  isblock: boolean;
  code: string;
  id: string;
  trigger: string;
  type: string;
  ruleproperty1: string;
  ruleproperty2: string;
  value: string;
}

export interface Modifier {
  prefix_str: string;
  prefix_icon: string;
  suffix_str: string;
  suffix_icon: string;
}

export interface DecimalPlace {
  definetype: string;
  usenum: number;
}

export interface ListSource {
  valuefield: string;
  datatype: string;
  listvalue: any[];
  displayfield: string;
}

export interface ComponentDataSource {
  defaultvaluetype: string;
  isbind: boolean;
  format: { type: string };
  defaultvalue: any;
  linkcomponent?: string;
  linkfield?: string;
  linkdata: LinkData;
  valueformat: string;
  field: string;
  editmode_behavior?: string;
  datasource: string;
  complexformula?: string;
  addmode_behavior?: string;
  allow_photograph?: boolean;
  allow_upload?: boolean;
}

export interface LinkData {
  showfield: string;
  conditions: LinkCondition[];
  entity: string;
  triggerTiming: number[];
}
export interface LinkCondition {
  componentid?: string;
  entityfield?: string;
  [key: string]: any;
}

export interface LayoutDataSource {
  fieldname: string;
  filtercondition: FilterCondition;
  showfield: string;
  ismain: boolean;
  name: string;
  entityname: string;
  sortField: string;
  type: string;
  ascending: boolean;
  typename?: string;
  linkmain_field?: string;
  primarykey?: string;
}

export interface FilterCondition {
  children: any[];
  filters: Filter[];
  type: string;
}
export interface Filter {
  valuetype?: string;
  fieldName?: string;
  filterType?: string;
  type?: string;
  ondemand?: boolean;
  value?: string;
  operator?: string;
  [key: string]: any;
}
