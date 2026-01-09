import { Filter } from "./grid-filter";

export type FilterKeys =
  | "ALL"
  | "OVER_I_REVIEW"
  | "WHEN_I_REVIEW"
  | "I_POSTED"
  | "UN_APPROVED";

export type TodoFilter = Record<FilterKeys, string>;

export type DisplayType = "FixedDisplay" | string;

export interface TodoChild {
  filter: Filter;
  displayType: DisplayType;
  entityName: string;
  isDefaultOpen: boolean;
  name: string;
  icon: string;
  count: number;
  index: string;
  isShow: boolean;
}

export interface TodoMenu {
  children: TodoChild[];
  name: string;
  index: string;
  type: string;
  foldChildren: boolean;
  isShow: boolean;
}
