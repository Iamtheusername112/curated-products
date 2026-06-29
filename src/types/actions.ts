export type BulkUploadResult = {
  success: boolean;
  inserted: number;
  skipped: number;
  errors: string[];
};

export type PurgeCatalogResult = {
  success: boolean;
  deletedCount: number;
  error?: string;
};

export type RefreshTestImagesResult = {
  success: boolean;
  updatedCount: number;
  error?: string;
};

export type ProductAdminFormState = {
  success: boolean;
  productId?: number;
  error?: string;
};

export type WatchlistActionResult = {
  success: boolean;
  isWatchlisted?: boolean;
  watchlistId?: number;
  error?: string;
};

export type SiteSettingActionResult = {
  success: boolean;
  key?: string;
  value?: string;
  error?: string;
};

export type CategoryActionResult = {
  success: boolean;
  error?: string;
};

export type CategoryFormState = CategoryActionResult & {
  slug?: string;
};

export type SheinUrlSyncResult = {
  success: boolean;
  synced: number;
  skipped: number;
  errors: string[];
  categorySlug?: string;
  sourceUrl?: string;
};
