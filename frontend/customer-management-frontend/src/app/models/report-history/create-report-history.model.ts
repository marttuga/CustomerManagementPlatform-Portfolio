/** Payload for saving a report generation record to history. */
export interface CreateReportHistory {
  /** Report category label (e.g. "Monthly Report", "Annual Report"). */
  type: string;

  /** Path to the generated PDF file, if saved to disk. */
  filePath?: string;

  /** JSON string with the filter criteria used to generate the report. */
  filterCriteriaJson?: string;
}