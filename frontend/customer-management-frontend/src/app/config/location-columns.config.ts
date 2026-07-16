import { SURGERY_TYPES, INSURANCE_TYPES } from './medical-data.config';

/**
 * Defines the structure of a single table column.
 * Exported so it can be used as a type in components.
 */
export interface ColumnConfig {
  field: string;
  label: string;
  type?: string;
  options?: string[];
  sortable?: boolean;
}

/**
 * Defines the full configuration for a location's table view.
 * Exported so it can be used as a type in components.
 */
export interface LocationConfig {
  title: string;
  columns: ColumnConfig[];
}

/**
 * Per-location table configuration.
 * Each key matches a location URL key from LOCATION_MAP.
 * Defines which columns are shown and their behaviour for each location.
 *
 * Locations 1-3 (riverside, hillcrest, oakdale) use the client model - show patient data.
 * Locations 4-8 (fairview, northgate, sunview, elmwood, ashford) use the daily entry model - show work dates only.
 */
export const LOCATION_CONFIG: Record<string, LocationConfig> = {
  northgate: {
    title: '🏥 Northgate',
    columns: [
      { field: 'workDate',       label: 'Work Date',      type: 'date',     sortable: true },
      { field: 'paymentStatus',  label: 'Status',         type: 'dropdown', options: ['Paid', 'Pending'], sortable: false },
      { field: 'paymentDate',    label: 'Payment',        type: 'date',     sortable: true },
      { field: 'amount',         label: 'Amount',      type: 'text',     sortable: true },
      { field: 'invoiceNumber',  label: 'Invoice Number', type: 'text',     sortable: false },
      { field: 'notes',          label: 'Notes',          type: 'text',     sortable: false }
    ]
  },

  oakdale: {
    title: '🏥 Oakdale',
    columns: [
      { field: 'name',           label: 'Patient',        type: 'text',     sortable: true },
      { field: 'clientDate',     label: 'Consultation',   type: 'date',     sortable: true },
      { field: 'paymentStatus',  label: 'Status',         type: 'dropdown', options: ['Paid', 'Pending'], sortable: false },
      { field: 'paymentDate',    label: 'Payment',        type: 'date',     sortable: true },
      { field: 'amount',         label: 'Amount',      type: 'text',     sortable: true },
      { field: 'invoiceNumber',  label: 'Invoice Number', type: 'text',     sortable: false },
      { field: 'notes',          label: 'Notes',          type: 'text',     sortable: false }
    ]
  },

  fairview: {
    title: '🏥 Fairview',
    columns: [
      { field: 'workDate',       label: 'Work Date',      type: 'date',     sortable: true },
      { field: 'paymentStatus',  label: 'Status',         type: 'dropdown', options: ['Paid', 'Pending'], sortable: false },
      { field: 'paymentDate',    label: 'Payment',        type: 'date',     sortable: true },
      { field: 'amount',         label: 'Amount',      type: 'text',     sortable: true },
      { field: 'invoiceNumber',  label: 'Invoice Number', type: 'text',     sortable: false },
      { field: 'notes',          label: 'Notes',          type: 'text',     sortable: false }
    ]
  },

  riverside: {
    title: '🏥 Riverside',
    columns: [
      { field: 'name',           label: 'Patient',         type: 'text',     sortable: true },
      { field: 'clientDate',     label: 'Consultation',    type: 'date',     sortable: true },
      { field: 'scmlCode',       label: 'SCML Code',       type: 'text',     sortable: false },
      { field: 'insuranceType',  label: 'Health Insurance',type: 'dropdown', options: INSURANCE_TYPES, sortable: false },
      { field: 'surgeryType',    label: 'Surgery',         type: 'dropdown', options: SURGERY_TYPES,   sortable: false },
      { field: 'paymentStatus',  label: 'Status',          type: 'dropdown', options: ['Paid', 'Pending'], sortable: false },
      { field: 'paymentDate',    label: 'Payment',         type: 'date',     sortable: true },
      { field: 'amount',         label: 'Amount',          type: 'text',     sortable: true },
      { field: 'invoiceNumber',  label: 'Invoice Number',  type: 'text',     sortable: false },
      { field: 'notes',          label: 'Notes',           type: 'text',     sortable: false }
    ]
  },

  'elmwood': {
    title: '🏥 Elmwood',
    columns: [
      { field: 'workDate',       label: 'Work Date',      type: 'date',     sortable: true },
      { field: 'paymentStatus',  label: 'Status',         type: 'dropdown', options: ['Paid', 'Pending'], sortable: false },
      { field: 'paymentDate',    label: 'Payment',        type: 'date',     sortable: true },
      { field: 'amount',         label: 'Amount',          type: 'text',     sortable: true },
      { field: 'invoiceNumber',  label: 'Invoice Number',  type: 'text',     sortable: false },
      { field: 'notes',          label: 'Notes',           type: 'text',     sortable: false }
    ]
  },

  ashford: {
    title: '🏥 Ashford',
    columns: [
      { field: 'workDate',       label: 'Work Date',      type: 'date',     sortable: true },
      { field: 'paymentStatus',  label: 'Status',         type: 'dropdown', options: ['Paid', 'Pending'], sortable: false },
      { field: 'paymentDate',    label: 'Payment',        type: 'date',     sortable: true },
      { field: 'amount',         label: 'Amount',          type: 'text',     sortable: true },
      { field: 'invoiceNumber',  label: 'Invoice Number', type: 'text',     sortable: false },
      { field: 'notes',          label: 'Notes',          type: 'text',     sortable: false }
    ]
  },

  sunview: {
    title: '🏥 Sunview',
    columns: [
      { field: 'workDate',       label: 'Work Date',      type: 'date',     sortable: true },
      { field: 'paymentStatus',  label: 'Status',         type: 'dropdown', options: ['Paid', 'Pending'], sortable: false },
      { field: 'paymentDate',    label: 'Payment',        type: 'date',     sortable: true },
      { field: 'amount',         label: 'Amount',      type: 'text',     sortable: true },
      { field: 'invoiceNumber',  label: 'Invoice Number', type: 'text',     sortable: false },
      { field: 'notes',          label: 'Notes',          type: 'text',     sortable: false }
    ]
  },

  'hillcrest': {
    title: '🏥 Hillcrest',
    columns: [
      { field: 'name',           label: 'Patient',         type: 'text',     sortable: true },
      { field: 'clientDate',     label: 'Consultation',    type: 'date',     sortable: true },
      { field: 'insuranceType',  label: 'Health Insurance',type: 'dropdown', options: INSURANCE_TYPES, sortable: false },
      { field: 'surgeryType',    label: 'Surgery',         type: 'dropdown', options: SURGERY_TYPES,   sortable: false },
      { field: 'paymentStatus',  label: 'Status',          type: 'dropdown', options: ['Paid', 'Pending'], sortable: false },
      { field: 'paymentDate',    label: 'Payment',         type: 'date',     sortable: true },
      { field: 'amount',         label: 'Amount',       type: 'text',     sortable: true },
      { field: 'invoiceNumber',  label: 'Invoice Number',  type: 'text',     sortable: false },
      { field: 'notes',          label: 'Notes',           type: 'text',     sortable: false }
    ]
  }
};