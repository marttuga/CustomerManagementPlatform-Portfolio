import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component/dashboard.component';
import { LocationBaseComponent } from './components/shared/location-base.component/location-base.component';

export const routes: Routes = [
  // Default route - redirects to dashboard
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  // Main dashboard showing all locations
  { path: 'dashboard', component: DashboardComponent },

  // Location detail page - locationKey identifies which location to display
  { path: 'locations/:locationKey', component: LocationBaseComponent }
];