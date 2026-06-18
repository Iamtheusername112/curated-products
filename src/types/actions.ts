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

export type WatchlistActionResult = {
  success: boolean;
  isWatchlisted?: boolean;
  error?: string;
};
