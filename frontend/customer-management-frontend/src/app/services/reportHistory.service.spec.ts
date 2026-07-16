import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReportHistoryService } from './reportHistory.service';
import { ReportHistory } from '../models/report-history/report-history.model';
import { environment } from '../../environments/environment';

describe('ReportService', () => {
  let service: ReportHistoryService;
  let httpMock: HttpTestingController;

  const mockReport: ReportHistory = {
    reportHistoryId: 1,
    type: 'Monthly Report',
    generatedAt: '2026-01-31T10:00:00Z',
    filePath: undefined,
    filterCriteriaJson: undefined
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(ReportHistoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call GET /api/report on getAll()', () => {
    service.getAll().subscribe(reports => {
      expect(reports.length).toBe(1);
      expect(reports[0].type).toBe('Monthly Report');
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/report`);
    expect(req.request.method).toBe('GET');
    req.flush([mockReport]);
  });

  it('should call GET /api/report/:id on getById()', () => {
    service.getById(1).subscribe(report => {
      expect(report.reportHistoryId).toBe(1);
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/report/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockReport);
  });

  it('should call POST /api/report on create()', () => {
    const newReport = { type: 'Annual Report' };

    service.create(newReport).subscribe(report => {
      expect(report.type).toBe('Monthly Report');
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/report`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.type).toBe('Annual Report');
    req.flush(mockReport);
  });

  it('should call DELETE /api/report/:id on delete()', () => {
    service.delete(1).subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/report/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should call GET /api/report/generate-monthly/:id with correct params', () => {
    service.generateMonthlyReport(1, 3, 2026).subscribe(res => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne(r =>
      r.url === `${environment.apiBaseUrl}/report/generate-monthly/1` &&
      r.params.get('month') === '3' &&
      r.params.get('year') === '2026'
    );
    expect(req.request.method).toBe('GET');
    req.flush({ totalPendingItems: 2, data: [] });
  });
});