/** Represents a report history record as returned by the API. */
export interface ReportHistory {
  reportHistoryId: number;

  /** Report category label (e.g. "Monthly Report", "Annual Report"). */
  type: string;

  /** Path to the generated PDF file on disk, if saved. */
  filePath?: string;

  /** Timestamp when the report was generated. */
  generatedAt: string | Date;

  /** JSON string with the filter criteria used to generate the report. */
  filterCriteriaJson?: string;
}