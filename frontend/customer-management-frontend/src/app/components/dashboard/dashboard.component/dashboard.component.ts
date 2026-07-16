import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { forkJoin } from 'rxjs';
import { NavbarComponent } from '../../shared/navbar.component/navbar.component';
import { LocationService } from '../../../services/location.service';
import { ClientService } from '../../../services/client.service';
import { DailyEntryService } from '../../../services/daily-entry.service';
import { PaymentService } from '../../../services/payment.service';

Chart.register(...registerables);

/** Aggregated statistics per location shown in the dashboard charts. */
interface LocationStats {
  location: string;
  totalPayments: number;
  pendingPayments: number;
  totalRegistos: number;
}

/**
 * Main dashboard component.
 * Loads all data on init and renders a pie chart and bar chart
 * summarising payment status across all locations.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NavbarComponent, CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('pieChart') pieChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChart') barChartRef!: ElementRef<HTMLCanvasElement>;

  locationStats: LocationStats[] = [];

  totalPayments = 0;
  totalPending = 0;
  totalRegistos = 0;

  private pieChartInstance?: Chart;
  private barChartInstance?: Chart;

  constructor(
    private clientService: ClientService,
    private dailyEntryService: DailyEntryService,
    private locationService: LocationService,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    // Load data on init - not in constructor to follow Angular lifecycle best practices
    this.loadAllData();
  }

  ngAfterViewInit(): void {
    // Initial render with empty data - will re-render once loadAllData completes
    this.renderCharts();
  }

  /** Sums totals across all location stats for the summary cards. */
  private computeTotalsFromData() {
    this.totalPayments = this.locationStats.reduce((a, b) => a + b.totalPayments, 0);
    this.totalPending  = this.locationStats.reduce((a, b) => a + b.pendingPayments, 0);
    this.totalRegistos = this.locationStats.reduce((a, b) => a + b.totalRegistos, 0);
  }

  /** Destroys existing chart instances and re-renders with current data. */
  renderCharts() {
    setTimeout(() => {
      if (this.pieChartInstance) this.pieChartInstance.destroy();
      if (this.barChartInstance) this.barChartInstance.destroy();

      // Pie chart - paid vs pending distribution
      this.pieChartInstance = new Chart(this.pieChartRef.nativeElement, {
        type: 'pie',
        data: {
          labels: ['Paid', 'Pending'],
          datasets: [{
            data: [this.totalPayments, this.totalPending],
            backgroundColor: ['#6cca6fff', '#e6453aff'],
            hoverOffset: 8,
          }],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' },
            title: { display: true, text: 'Payment Distribution', font: { size: 16 } },
          },
        },
      });

      // Bar chart - pending payments per location
      this.barChartInstance = new Chart(this.barChartRef.nativeElement, {
        type: 'bar',
        data: {
          labels: this.locationStats.map(s => s.location),
          datasets: [{
            label: 'Pending Payments',
            data: this.locationStats.map(s => s.pendingPayments),
            backgroundColor: '#e6453aff',
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' },
            title: { display: true, text: 'Pending and Invoices to Issue', font: { size: 16 } },
          },
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1 } },
          },
        },
      });
    }, 300);
  }

  /**
   * Loads all clients, daily entries, payments and locations in parallel.
   * Computes per-location statistics and re-renders charts when done.
   */
  loadAllData() {
    forkJoin({
      clients:    this.clientService.getAll(),
      dailyEntry: this.dailyEntryService.getAll(),
      payments:   this.paymentService.getAll(),
      locations:  this.locationService.getAll()
    }).subscribe(({ clients, dailyEntry, payments, locations }) => {

      this.locationStats = locations.map(loc => {
        const locClients = clients.filter(c => c.locationId === loc.locationId);
        const locEntries = dailyEntry.filter(de => de.locationId === loc.locationId);

        // Count payments linked to this location's clients
        const paymentsFromClients = payments.filter(p =>
          locClients.some(c => c.clientId === p.clientId)
        );

        // Count payments linked to this location's daily entries
        const paymentsFromEntries = payments.filter(p =>
          locEntries.some(d => d.dailyEntryId === p.dailyEntryId)
        );

        const totalPayments = paymentsFromClients.length + paymentsFromEntries.length;

        // Pending = records with no associated payment
        const pendingClients = locClients.filter(c =>
          !payments.some(p => p.clientId === c.clientId)
        );
        const pendingEntries = locEntries.filter(d =>
          !payments.some(p => p.dailyEntryId === d.dailyEntryId)
        );

        return {
          location:       loc.name,
          totalPayments,
          pendingPayments: pendingClients.length + pendingEntries.length,
          totalRegistos:   locClients.length + locEntries.length
        };
      });

      this.computeTotalsFromData();
      this.renderCharts();
    });
  }
}