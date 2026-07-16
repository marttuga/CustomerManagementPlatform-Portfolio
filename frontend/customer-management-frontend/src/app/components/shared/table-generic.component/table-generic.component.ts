import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable, of, EMPTY, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { ClientService } from '../../../services/client.service';
import { DailyEntryService } from '../../../services/daily-entry.service';
import { LocationService } from '../../../services/location.service';
import { PaymentService } from '../../../services/payment.service';
import { ReportHistoryService } from '../../../services/reportHistory.service';
import { Payment } from '../../../models/payment/payment.model';
import { ColumnConfig } from '../../../config/location-columns.config';
import html2pdf from 'html2pdf.js';

/**
 * Generic table component used by all location pages.
 * Handles data loading, inline editing, deletion, duplicate detection
 * and PDF report generation for both client-model and daily-entry-model locations.
 */
@Component({
  selector: 'app-table-generic',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './table-generic.component.html',
  styleUrls: ['./table-generic.component.css']
})
export class TableGenericComponent implements OnChanges {

  @Input() columns: ColumnConfig[] = [];
  @Input() title = '';
  @Input() locationKey!: string;

  // --- Data ---
  rows: any[] = [];
  filteredRows: any[] = [];
  originalRows: any[] = [];

  /** Full list backup used to restore rows after cancelling a duplicate selection. */
  private originalRowsBackup: any[] = [];

  // --- UI State ---
  editIndex: number | null = null;
  message = '';
  isLoading = false;
  locationId!: number;

  // --- Sorting & Filtering ---
  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' | null = null;
  search = '';

  // --- Modals ---
  duplicateModalIndex: number | null = null;
  duplicateRows: any[] = [];
  actionModalIndex: number | null = null;
  confirmationModalType: 'payment' | 'entity' | null = null;

  isSelectingDuplicate = false;
  private messageTimeout: any;
  showReportConfig = false;

  // --- Multi-select dropdown state ---
  activeDropdownIndex: number | null = null;
  activeDropdownField: string | null = null;
  dropdownSearch = '';

  dropdownPosition = {
    top: 0,
    left: 0,
    openUpward: false,
    maxHeight: 250
  };

  // --- Report state ---
  selectedReportMonth: number = new Date().getMonth() + 1;
  selectedReportYear: number = new Date().getFullYear();

  /**
   * Month options for the report selector.
   * Value 13 is a convention used to request the full annual report.
   */
  months = [
    { value: 1,  name: 'January'   }, { value: 2,  name: 'February' },
    { value: 3,  name: 'March'     }, { value: 4,  name: 'April'    },
    { value: 5,  name: 'May'       }, { value: 6,  name: 'June'     },
    { value: 7,  name: 'July'      }, { value: 8,  name: 'August'   },
    { value: 9,  name: 'September' }, { value: 10, name: 'October'  },
    { value: 11, name: 'November'  }, { value: 12, name: 'December' },
    { value: 13, name: 'Full Year' }
  ];

  /**
   * Locations that use the daily entry billing model.
   * All others use the client billing model.
   */
  private dailyEntryLocations = [
    'northgate', 'fairview', 'ashford', 'elmwood', 'sunview'
  ];

  /** True if the current location uses the daily entry model. */
  get isDailyEntry(): boolean {
    return this.dailyEntryLocations.includes(this.locationKey);
  }

  constructor(
    private clientService: ClientService,
    private dailyEntryService: DailyEntryService,
    private paymentService: PaymentService,
    private reportService: ReportHistoryService,
    private locationService: LocationService
  ) {}

  /**
   * Closes open dropdowns and the report popover
   * when the user clicks outside of them.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (!target.closest('.multi-select-container')) {
      this.closeDropdown();
    }

    if (!target.closest('.report-popover') && !target.closest('.action-btn.report')) {
      this.showReportConfig = false;
    }
  }

  /** Reacts to locationKey changes - resets state and reloads data. */
  ngOnChanges(changes: SimpleChanges) {
    if (changes['locationKey']) {
      this.resetState();

      // Resolve the locationId dynamically from the API instead of a static map
      this.locationService.getAll().subscribe(locations => {
        const match = locations.find(l => l.key === this.locationKey);
        if (match) {
          this.locationId = match.locationId;
          this.loadData();
        }
      });
    }
  }

  /** Resets all component state when navigating to a different location. */
  private resetState() {
    this.rows = [];
    this.filteredRows = [];
    this.originalRows = [];
    this.editIndex = null;
    this.sortColumn = null;
    this.sortDirection = null;
    this.search = '';
    this.message = '';
    this.isSelectingDuplicate = false;
    this.showReportConfig = false;
  }

  /**
   * Loads clients or daily entries depending on the location model.
   * Flattens each entity with its payments into individual table rows.
   */
  loadData() {
    if (!this.locationKey) return;

    const data$: Observable<any[]> = this.isDailyEntry
      ? this.dailyEntryService.getByLocation(this.locationKey)
      : this.clientService.getByLocation(this.locationKey);

    data$.subscribe((entities: any[]) => {
      this.rows = entities.flatMap(e => this.mapRow(e));
      this.originalRows = [...this.rows];
      this.applyFilter();
    });
  }

  /** Formats an ISO date string to YYYY-MM-DD for use in date inputs. */
  private formatDate(date: string | null | undefined): string {
    return date ? date.substring(0, 10) : '';
  }

  /**
   * Maps a single entity (client or daily entry) to one or more table rows.
   * If the entity has no payments, returns a single "Pending" row.
   * If it has payments, returns one row per payment (all "Paid").
   */
  private mapRow(entity: any) {
    const base = {
      ...entity,
      clientDate:    this.formatDate(entity.clientDate),
      workDate:      this.formatDate(entity.workDate),
      notes:         entity.notes ?? '',
      surgeryType:   entity.surgeryType ?? '',
      insuranceType: entity.insuranceType ?? '',
      scmlCode:      entity.scmlCode ?? '',
      locationId:    entity.locationId,
      locationName:  entity.locationName
    };

    if (!entity.payments || entity.payments.length === 0) {
      return [{
        ...base,
        paymentId:    null,
        amount:       null,
        paymentDate:  '',
        invoiceNumber: '',
        paymentStatus: 'Pending',
        clientId:     entity.clientId ?? null,
        dailyEntryId: entity.dailyEntryId ?? null,
      }];
    }

    // One row per payment
    return entity.payments.map((payment: Payment) => ({
      ...base,
      paymentId:     payment.paymentId,
      amount:        payment.amount,
      paymentDate:   this.formatDate(payment.paymentDate),
      invoiceNumber: payment.invoiceNumber ?? '',
      paymentStatus: 'Paid',
      clientId:      entity.clientId ?? null,
      dailyEntryId:  entity.dailyEntryId ?? null,
    }));
  }

  /** Filters visible rows based on the search input. */
  applyFilter() {
    const term = this.search.toLowerCase().trim();
    if (!term) {
      this.filteredRows = [...this.rows];
      return;
    }
    this.filteredRows = this.rows.filter(row =>
      Object.values(row).some(v =>
        v !== null && v !== undefined && v.toString().toLowerCase().startsWith(term)
      )
    );
  }

  /** Adds a blank row at the top of the table and enters edit mode. */
  addRow() {
    if (this.editIndex !== null) return;

    this.originalRowsBackup = [...this.rows];

    const existingLocationName = this.rows.length > 0 ? this.rows[0].locationName : '';

    this.rows.unshift({
      paymentId:     null,
      amount:        null,
      paymentDate:   '',
      invoiceNumber: '',
      paymentStatus: 'Pending',
      clientId:      this.isDailyEntry ? null : undefined,
      dailyEntryId:  this.isDailyEntry ? undefined : null,
      notes:         '',
      name:          '',
      locationName:  existingLocationName
    });

    this.applyFilter();
    this.editIndex = 0;

    // Scroll to the top so the new row is visible
    setTimeout(() => {
      const container = document.getElementById('myScrollContainer');
      if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  }

  /** Removes diacritics and lowercases a string for comparison. */
  private normalizeString(str: string | null | undefined): string {
    if (!str) return '';
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  /** Capitalises each word in a name (e.g. "JOÃO SILVA" → "João Silva"). */
  formatNameCoherently(name: string | null | undefined): string {
    if (!name) return '';
    return name.trim().split(/\s+/).map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }

  /**
   * Returns existing rows that match the given row based on
   * location-specific duplicate detection rules.
   */
  private findDuplicates(row: any): any[] {
    if (this.isDailyEntry) {
      return this.rows.filter(r =>
        this.formatDate(r.workDate) === this.formatDate(row.workDate) &&
        r.locationId === this.locationId
      );
    }

    switch (this.locationKey) {
      case 'riverside':
        return this.rows.filter(r =>
          this.normalizeString(r.name) === this.normalizeString(row.name) &&
          this.normalizeString(r.scmlCode) === this.normalizeString(row.scmlCode) &&
          this.formatDate(r.clientDate) === this.formatDate(row.clientDate)
        );
      case 'hillcrest':
        return this.rows.filter(r =>
          this.normalizeString(r.name) === this.normalizeString(row.name) &&
          this.formatDate(r.clientDate) === this.formatDate(row.clientDate) &&
          this.normalizeString(r.surgeryType) === this.normalizeString(row.surgeryType)
        );
      case 'oakdale':
        return this.rows.filter(r =>
          this.normalizeString(r.name) === this.normalizeString(row.name) &&
          this.formatDate(r.clientDate) === this.formatDate(row.clientDate)
        );
      default:
        return [];
    }
  }

  /**
   * Checks for duplicates before saving.
   * Returns true if duplicates were found (and opens the modal).
   */
  private checkDuplicatesBeforeSave(row: any, index: number): boolean {
    const allMatches = this.findDuplicates(row);
    const realDuplicates = allMatches.filter(existing => {
      if (row.clientId && existing.clientId === row.clientId) return false;
      if (row.dailyEntryId && existing.dailyEntryId === row.dailyEntryId) return false;
      return existing !== this.filteredRows[index];
    });

    if (realDuplicates.length > 0) {
      this.duplicateModalIndex = index;
      this.duplicateRows = realDuplicates;
      return true;
    }
    return false;
  }

  /**
   * Saves the current row - validates input, checks for duplicates,
   * then creates or updates the entity and its payment in sequence.
   */
  saveRow(row: any) {
    this.closeDropdown();
    if (row.name) row.name = this.formatNameCoherently(row.name);

    // Riverside-specific validation: SCML code must be up to 6 digits
    if (this.locationKey === 'riverside' && row.scmlCode && !/^\d{1,6}$/.test(row.scmlCode)) {
      this.showMessage('⚠️ SCML Code must be up to 6 digits.');
      return;
    }

    // Payment validation: amount and date are required if status is Paid
    if (row.paymentStatus === 'Paid') {
      if (!row.amount || row.amount <= 0 || !row.paymentDate) {
        this.showMessage('⚠️ Amount and Date are required for Paid status.');
        return;
      }
    }

    if (this.checkDuplicatesBeforeSave(row, this.editIndex!)) return;

    this.isLoading = true;

    // Step 1: create or update the entity (client or daily entry)
    const entity$: Observable<any> = this.isDailyEntry
      ? this.updateDailyEntryEntity(row)
      : this.updateClientEntity(row);

    entity$.pipe(
      switchMap((entity: any) => {
        // Persist generated IDs back to the row for subsequent payment operations
        if (!row.clientId && entity?.clientId) row.clientId = entity.clientId;
        if (!row.dailyEntryId && entity?.dailyEntryId) row.dailyEntryId = entity.dailyEntryId;

        // Step 2: create or update the payment if status is Paid
        if (row.paymentStatus === 'Paid') {
          return row.paymentId ? this.updatePayment(row) : this.createPayment(row);
        }
        return of({ success: true });
      }),
      tap(() => {
        this.showMessage('✅ Saved successfully.');
        this.editIndex = null;
        this.loadData();
      }),
      catchError(err => {
        this.isLoading = false;
        if (err.status === 409) {
          // API returned a duplicate conflict
          this.duplicateRows = err.error?.matches || [];
          this.openDuplicateModal();
          return EMPTY;
        }
        this.showMessage('❌ An error occurred while saving.');
        return throwError(() => err);
      })
    ).subscribe({
      complete: () => this.isLoading = false
    });
  }

  // --- API call helpers ---

  private createPayment(row: any) {
    return this.paymentService.create({
      clientId:      row.clientId,
      dailyEntryId:  row.dailyEntryId,
      amount:        row.amount,
      paymentDate:   row.paymentDate,
      invoiceNumber: row.invoiceNumber
    });
  }

  private updatePayment(row: any) {
    return this.paymentService.update(row.paymentId, {
      amount:        row.amount,
      paymentDate:   row.paymentDate,
      invoiceNumber: row.invoiceNumber
    });
  }

  private updateClientEntity(row: any) {
    const data = {
      name:          row.name,
      scmlCode:      row.scmlCode,
      surgeryType:   row.surgeryType,
      insuranceType: row.insuranceType,
      notes:         row.notes,
      clientDate:    row.clientDate
    };
    return row.clientId
      ? this.clientService.update(row.clientId, data)
      : this.clientService.create({ ...data, locationId: this.locationId });
  }

  private updateDailyEntryEntity(row: any) {
    const data = { notes: row.notes, workDate: row.workDate };
    return row.dailyEntryId
      ? this.dailyEntryService.update(row.dailyEntryId, data)
      : this.dailyEntryService.create({ ...data, locationId: this.locationId });
  }

  // ==========================================
  // DELETE LOGIC
  // ==========================================

  /** Opens the appropriate delete modal based on location model. */
  openDeleteModal(i: number) {
    this.closeDropdown();
    this.actionModalIndex = i;
    // Daily entry model goes straight to confirmation - no "remove payment only" option
    this.confirmationModalType = this.isDailyEntry ? 'entity' : null;
  }

  confirmDeletePayment()  { this.confirmationModalType = 'payment'; }
  confirmDeleteEntity()   { this.confirmationModalType = 'entity'; }
  cancelActionModal()     { this.actionModalIndex = null; this.confirmationModalType = null; }
  cancelConfirmationModal() { this.confirmationModalType = null; this.actionModalIndex = null; }

  /** Executes the final deletion based on the confirmed modal type. */
  confirmDeleteFinal() {
    if (this.actionModalIndex === null || !this.confirmationModalType) return;
    const row = this.filteredRows[this.actionModalIndex];

    if (this.isDailyEntry) {
      // Daily entry model: delete the entire daily entry (cascade removes its payment)
      this.dailyEntryService.delete(row.dailyEntryId).subscribe(() => {
        this.showMessage('Record deleted.');
        this.loadData();
        this.cancelActionModal();
      });
    } else if (this.confirmationModalType === 'entity') {
      // Client model - full delete: removes client and all history via cascade
      this.clientService.delete(row.clientId).subscribe(() => {
        this.showMessage('Client and history deleted.');
        this.loadData();
        this.cancelActionModal();
      });
    } else {
      // Client model - payment only: remove just this payment row
      const occurrenceCount = this.rows.filter(r => r.clientId === row.clientId).length;

      if (occurrenceCount <= 1 && row.clientId) {
        // Only one row for this client - delete the client entirely
        this.clientService.delete(row.clientId).subscribe(() => {
          this.showMessage('Client removed (no other records).');
          this.finishDeletion(row);
        });
      } else {
        if (row.paymentId) {
          this.paymentService.delete(row.paymentId).subscribe(() => {
            this.showMessage('Payment removed.');
            this.finishDeletion(row);
          });
        } else {
          this.finishDeletion(row);
        }
      }
    }
  }

  private finishDeletion(row: any) {
    const idx = this.rows.indexOf(row);
    if (idx !== -1) this.rows.splice(idx, 1);
    this.cancelActionModal();
    this.applyFilter();
  }

  // ==========================================
  // DUPLICATE MODAL
  // ==========================================

  /** Shows the duplicate rows and enters selection mode so the user can pick one to edit. */
  editExistingDuplicate() {
    this.duplicateModalIndex = null;
    this.rows = [...this.duplicateRows];
    this.filteredRows = [...this.duplicateRows];
    this.editIndex = null;
    this.isSelectingDuplicate = true;
    this.message = 'Select one to edit.';
    this.duplicateRows = [];
  }

  /** Exits selection mode and restores the full row list. */
  exitSelectionMode() {
    this.isSelectingDuplicate = false;
    this.message = '';
    this.editIndex = null;
    this.duplicateModalIndex = null;

    this.rows = this.originalRowsBackup.length > 0
      ? [...this.originalRowsBackup]
      : [...this.originalRows];

    this.originalRowsBackup = [];
    this.applyFilter();
  }

  cancelDuplicateModal() {
    this.duplicateModalIndex = null;
    this.duplicateRows = [];
    this.exitSelectionMode();
  }

  private openDuplicateModal(index?: number) {
    this.duplicateModalIndex = index !== undefined ? index : this.editIndex;
  }

  // ==========================================
  // DROPDOWN & SORTING
  // ==========================================

  toggleDropdown(index: number, field: string, event: Event) {
    event.stopPropagation();

    if (this.activeDropdownIndex === index && this.activeDropdownField === field) {
      this.closeDropdown();
      return;
    }

    const trigger = event.target as HTMLElement;
    const rect = trigger.getBoundingClientRect();

    const viewportHeight = window.innerHeight;

    const estimatedDropdownHeight = 220;

    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    const shouldOpenUpward =
      spaceBelow < estimatedDropdownHeight &&
      spaceAbove > spaceBelow;

    const maxHeight = shouldOpenUpward
      ? Math.min(spaceAbove - 20, 250)
      : Math.min(spaceBelow - 20, 250);

    this.dropdownPosition = {
      left: rect.left,
      top: shouldOpenUpward
        ? rect.top - maxHeight - 4
        : rect.bottom + 4,
      openUpward: shouldOpenUpward,
      maxHeight: maxHeight
    };

    this.activeDropdownIndex = index;
    this.activeDropdownField = field;
    this.dropdownSearch = '';
  }

  closeDropdown() {
    this.activeDropdownIndex = null;
    this.activeDropdownField = null;
  }

  /** Toggles a multi-select option on or off (used for surgeryType). */
  toggleOption(row: any, field: string, opt: string, event: Event) {
    event.stopPropagation();
    let selected = row[field] ? row[field].split(',').map((s: any) => s.trim()) : [];
    selected = selected.includes(opt)
      ? selected.filter((s: any) => s !== opt)
      : [...selected, opt];
    row[field] = selected.sort().join(', ');
  }

  /** Selects a single option and closes the dropdown (used for insuranceType). */
  selectSingleOption(row: any, field: string, opt: string, event: Event) {
    event.stopPropagation();
    row[field] = opt;
    this.closeDropdown();
  }

  /** Filters dropdown options by the dropdown search input. */
  getFilteredOptions(options: string[] | undefined): string[] {
    if (!options) return [];    
    if (!this.dropdownSearch) return options;
      return options.filter(o => o.toLowerCase().startsWith(this.dropdownSearch.toLowerCase()));
  }

  /** Returns true if the given option is already selected in the current value. */
  isOptionSelected(current: string, opt: string): boolean {
    return current ? current.split(',').map(s => s.trim()).includes(opt) : false;
  }

  startEdit(i: number) {
    this.editIndex = i;
    if (this.isSelectingDuplicate) {
      this.isSelectingDuplicate = false;
      this.message = '';
    }
  }

  /** Cancels editing and restores the previous row state. */
  cancel() {
    this.editIndex = null;
    this.isSelectingDuplicate = false;

    this.rows = this.originalRowsBackup.length > 0
      ? [...this.originalRowsBackup]
      : [...this.originalRows];

    this.originalRowsBackup = [];
    this.applyFilter();
  }

  private showMessage(msg: string) {
    this.message = msg;

    if (!this.isSelectingDuplicate) {
      clearTimeout(this.messageTimeout);
      this.messageTimeout = setTimeout(() => {
        this.message = '';
        this.messageTimeout = null;
      }, 2500);
    }
  }

  sortAsc(f: string)  { this.sortColumn = f; this.sortDirection = 'asc';  this.sortRows(); }
  sortDesc(f: string) { this.sortColumn = f; this.sortDirection = 'desc'; this.sortRows(); }
  resetSort()         { this.sortColumn = null; this.rows = [...this.originalRows]; this.applyFilter(); }

  private sortRows() {
    if (!this.sortColumn || !this.sortDirection) return;
    const col = this.sortColumn;
    const dir = this.sortDirection;
    this.rows.sort((a, b) => {
      const A = a[col] ?? '';
      const B = b[col] ?? '';
      return dir === 'asc'
        ? String(A).localeCompare(String(B))
        : String(B).localeCompare(String(A));
    });
    this.applyFilter();
  }

  // ==========================================
  // REPORT GENERATION
  // ==========================================

  toggleReportConfig() {
    this.showReportConfig = !this.showReportConfig;
  }

  /** Requests the report data from the API and downloads it as a PDF if there are pending items. */
  generateMonthlyReport() {
    this.isLoading = true;

    this.reportService.generateMonthlyReport(
      this.locationId,
      this.selectedReportMonth,
      this.selectedReportYear
    ).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.totalPendingItems > 0) {
          this.downloadPdfReport(res);
        } else {
          this.showMessage('ℹ️ No pending items found for this period.');
        }
      },
      error: () => {
        this.isLoading = false;
        this.showMessage('❌ Error fetching report data.');
      }
    });
  }

  /** Builds the PDF HTML and triggers the download using html2pdf. */
  private downloadPdfReport(res: any) {
    const element = document.createElement('div');

    const monthObj = this.months.find(m => m.value === this.selectedReportMonth);
    const monthLabel = monthObj ? monthObj.name : 'report';

    // File name: e.g. "Riverside_January_2026.pdf" or "Riverside_Full_Year_2026.pdf"
    const fileNameLabel = monthLabel.replace(/\s+/g, '_');
    const finalFileName = `${res.locationName}_${fileNameLabel}_${this.selectedReportYear}.pdf`;

    const tableRows = res.isDailyModel
      ? this.buildDailyRows(res.data)
      : this.buildClientRows(res.data, res.isRiverside);

    element.innerHTML = `
      <style>
        .report-container { padding: 10mm; font-family: 'Segoe UI', Arial, sans-serif; color: #2c3e50; background: white; }
        .header { border-bottom: 2px solid #34495e; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
        table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        thead { display: table-header-group; }
        tr { page-break-inside: avoid; page-break-after: auto; }
        th { background: #f8f9fa; padding: 12px; font-size: 11px; color: #34495e; border-bottom: 2px solid #eee; text-align: left; font-weight: bold; }
        .row { border-bottom: 1px solid #eee; }
        .subtitle-container { display: flex; align-items: center; margin-bottom: 20px; gap: 15px; }
      </style>

      <div class="report-container">
        <div class="header">
          <div>
            <h1 style="margin:0; font-size:20px; text-transform:uppercase; color:#000;">Pending Items Report</h1>
            <p style="margin:5px 0; color:#34495e;">Location: <b style="color:#000;">${res.locationName}</b></p>
          </div>
          <div style="text-align:right">
            <div style="background:#ebf2f7; padding:10px 15px; border-radius:8px; border-left:4px solid #3498db;">
              <span style="font-size:10px; color:#3498db; font-weight:bold;">TOTAL PENDING</span><br>
              <b style="font-size:18px; color:#000;">${res.totalPendingItems}</b>
            </div>
          </div>
        </div>

        <div class="subtitle-container">
          <span style="background:#34495e; color:white; padding:6px 15px; border-radius:4px; font-size:14px; font-weight:bold; display:inline-block;">
            ${monthLabel} ${this.selectedReportYear}
          </span>
          <span style="color:#2c3e50; font-size:12px; font-weight:500;">
            Generated at: <b style="color:#000;">${res.generatedAt}</b>
          </span>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width:35%;">PENDING</th>
              <th style="width:65%;">DETAILS & NOTES</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </div>
    `;

    const opt = {
      margin:     [10, 5, 10, 5],
      filename:   finalFileName,
      image:      { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false, letterRendering: true, scrollY: 0 },
      jsPDF:      { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak:  { mode: ['css', 'legacy'] }
    };

    html2pdf().from(element).set(opt).save().then(() => element.remove());
  }

  /**
   * Builds HTML table rows for client-model locations.
   * Riverside includes the SCML code; other locations do not.
   */
  private buildClientRows(data: any[], isRiverside: boolean): string {
    return [...data]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(item => {
        const formattedDate = item.date
          ? new Date(item.date).toLocaleDateString('pt-PT')
          : '---';

        return `
          <tr class="row">
            <td style="padding:15px; width:35%; vertical-align:top;">
              <b style="color:#000; font-size:14px;">${item.name}</b>
              ${isRiverside && item.scmlCode ? `<br><small style="color:#2c3e50; font-weight:bold;">SCML: ${item.scmlCode}</small>` : ''}
            </td>
            <td style="padding:15px; vertical-align:top;">
              <div style="font-size:12px;">
                <span style="color:#34495e; text-transform:uppercase; font-size:10px; font-weight:bold;">DATE:</span>
                <b style="color:#000; font-size:13px;">${formattedDate}</b>
                <div style="display:flex; gap:20px; margin-top:8px; background:#f9f9f9; border:1px solid #dcdcdc; padding:10px; border-radius:4px;">
                  <div>
                    <span style="color:#34495e; text-transform:uppercase; font-size:9px; font-weight:bold;">Surgery:</span><br>
                    <b style="color:#000; font-size:11px;">${item.surgeryType || '---'}</b>
                  </div>
                  <div>
                    <span style="color:#34495e; text-transform:uppercase; font-size:9px; font-weight:bold;">Insurance:</span><br>
                    <b style="color:#000; font-size:11px;">${item.insuranceType || '---'}</b>
                  </div>
                </div>
                <div style="margin-top:10px; padding:8px; border-left:3px solid #34495e; background:#fff; color:#000; font-size:11px;">
                  <b style="text-transform:uppercase; font-size:9px; color:#34495e;">Notes:</b>
                  <span style="font-weight:500;">${item.notes && item.notes.trim() !== '' ? item.notes : 'No notes.'}</span>
                </div>
              </div>
            </td>
          </tr>
        `;
      }).join('');
  }

  /** Builds HTML table rows for daily-entry-model locations. */
  private buildDailyRows(data: any[]): string {
    return data.map(item => {
      const formattedDate = item.date
        ? new Date(item.date).toLocaleDateString('pt-PT')
        : '---';

      return `
        <tr class="row" style="border-bottom:1px solid #eee;">
          <td style="padding:15px; width:35%; vertical-align:middle;">
            <div style="display:flex; flex-direction:column;">
              <span style="font-size:10px; color:#7f8c8d; text-transform:uppercase;">Work Date:</span>
              <b style="font-size:13px; color:#2c3e50;">${formattedDate}</b>
            </div>
          </td>
          <td style="padding:15px; width:65%; vertical-align:middle;">
            <div style="font-style:italic; color:#34495e;">
              <b style="font-size:13px;">${item.notes || ''}</b>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }
}