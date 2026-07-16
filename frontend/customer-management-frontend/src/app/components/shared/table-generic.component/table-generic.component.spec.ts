import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TableGenericComponent } from './table-generic.component';

describe('TableGenericComponent', () => {
  let component: TableGenericComponent;
  let fixture: ComponentFixture<TableGenericComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableGenericComponent, HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(TableGenericComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with empty rows', () => {
    expect(component.rows.length).toBe(0);
    expect(component.filteredRows.length).toBe(0);
  });

  it('should start with no active edit', () => {
    expect(component.editIndex).toBeNull();
  });

  it('should start with no active message', () => {
    expect(component.message).toBe('');
  });

  it('should return true for isDailyEntry on daily-entry locations', () => {
    component.locationKey = 'northgate';
    expect(component.isDailyEntry).toBeTrue();

    component.locationKey = 'fairview';
    expect(component.isDailyEntry).toBeTrue();
  });

  it('should return false for isDailyEntry on client locations', () => {
    component.locationKey = 'riverside';
    expect(component.isDailyEntry).toBeFalse();

    component.locationKey = 'oakdale';
    expect(component.isDailyEntry).toBeFalse();
  });

  it('should filter rows by search term', () => {
    component.rows = [
      { name: 'João Silva', paymentStatus: 'Paid', amount: 300 },
      { name: 'Maria Costa', paymentStatus: 'Pending', amount: null }
    ] as any[];

    component.search = 'joão';
    component.applyFilter();

    expect(component.filteredRows.length).toBe(1);
    expect((component.filteredRows[0] as any).name).toBe('João Silva');
  });

  it('should return all rows when search is empty', () => {
    component.rows = [
      { name: 'João Silva' },
      { name: 'Maria Costa' }
    ] as any[];

    component.search = '';
    component.applyFilter();

    expect(component.filteredRows.length).toBe(2);
  });

  it('should capitalise name correctly in formatNameCoherently()', () => {
    expect(component.formatNameCoherently('JOÃO SILVA')).toBe('João Silva');
    expect(component.formatNameCoherently('maria costa')).toBe('Maria Costa');
    expect(component.formatNameCoherently('  ana  sofia  ')).toBe('Ana Sofia');
  });

  it('should return empty string for null or empty name in formatNameCoherently()', () => {
    expect(component.formatNameCoherently(null)).toBe('');
    expect(component.formatNameCoherently('')).toBe('');
    expect(component.formatNameCoherently(undefined)).toBe('');
  });

  it('should return filtered options matching search term', () => {
    const options = ['Septoplastia', 'Rinoplastia', 'Amigdalectomia'];
    component.dropdownSearch = 'se';
    const result = component.getFilteredOptions(options);
    expect(result.length).toBe(1);
    expect(result).toContain('Septoplastia');
  });

  it('should return all options when dropdownSearch is empty', () => {
    const options = ['Septoplastia', 'Rinoplastia'];
    component.dropdownSearch = '';
    expect(component.getFilteredOptions(options).length).toBe(2);
  });

  it('should return empty array for undefined options in getFilteredOptions()', () => {
    expect(component.getFilteredOptions(undefined)).toEqual([]);
  });

  it('should detect selected option in isOptionSelected()', () => {
    expect(component.isOptionSelected('Septoplastia, Rinoplastia', 'Septoplastia')).toBeTrue();
    expect(component.isOptionSelected('Septoplastia', 'Rinoplastia')).toBeFalse();
    expect(component.isOptionSelected('', 'Septoplastia')).toBeFalse();
  });

  it('should set editIndex when startEdit() is called', () => {
    component.rows = [{ name: 'Test' }] as any[];
    component.filteredRows = [...component.rows];
    component.startEdit(0);
    expect(component.editIndex).toBe(0);
  });

  it('should reset editIndex when cancel() is called', () => {
    component.editIndex = 0;
    component.originalRows = [];
    component.cancel();
    expect(component.editIndex).toBeNull();
  });

  it('should toggle showReportConfig on toggleReportConfig()', () => {
    expect(component.showReportConfig).toBeFalse();
    component.toggleReportConfig();
    expect(component.showReportConfig).toBeTrue();
    component.toggleReportConfig();
    expect(component.showReportConfig).toBeFalse();
  });
});