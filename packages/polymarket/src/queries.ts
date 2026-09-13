export type MarketRef =
  | { readonly id: string; readonly slug?: never; readonly url?: never }
  | { readonly slug: string; readonly id?: never; readonly url?: never }
  | { readonly url: string; readonly id?: never; readonly slug?: never };

export type EventRef = MarketRef;

export type TagRef =
  | { readonly id: string; readonly slug?: never }
  | { readonly slug: string; readonly id?: never };

export interface ListMarketsQuery {
  readonly closed?: boolean;
  readonly tagId?: number;
  readonly pageSize?: number;
  readonly cursor?: string;
  readonly ids?: readonly number[];
  readonly conditionIds?: readonly string[];
  readonly slug?: readonly string[];
}

export interface ListEventsQuery {
  readonly closed?: boolean;
  readonly tagIds?: readonly number[];
  readonly pageSize?: number;
  readonly cursor?: string;
  readonly ids?: readonly number[];
  readonly slug?: readonly string[];
  readonly titleSearch?: string;
}

export interface SearchQuery {
  readonly q: string;
  readonly pageSize?: number;
  readonly cursor?: string;
}

export interface ListTagsQuery {
  readonly pageSize?: number;
  readonly cursor?: string;
}
