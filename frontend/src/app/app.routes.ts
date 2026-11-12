import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { VehicleDetailComponent } from './components/vehicle-detail/vehicle-detail.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'vehicle/:id', component: VehicleDetailComponent },
  { path: '**', redirectTo: '' }
];
