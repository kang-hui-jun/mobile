type Filters = {
  fieldName: string;
  filterType: string;
  operator: string;
  type: string;
  value: string;
};

export type Filter = {
  type: string;
  children: [];
  filters: Filters[];
};

export type GridFilter = {
  filterId: string;
  filterName: string;
  isDefault: boolean;
  filter: Filter;
};

