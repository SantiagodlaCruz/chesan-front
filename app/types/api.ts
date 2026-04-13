export interface ApiMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  links: ApiMetaLink[];
  path: string;
  per_page: number;
  to: number | null;
  total: number;
}

export interface ApiMetaLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface ApiLinks {
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
}

export interface ApiResponse<T> {
  data: T;
}

export interface ApiPaginatedResponse<T> {
  data: {
    data: T[];
    links: ApiLinks;
    meta: ApiMeta;
  };
}

export interface SelectOption {
  label: string;
  value: string | number;
}
