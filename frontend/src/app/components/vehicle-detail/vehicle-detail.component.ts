import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { VehicleService } from '../../services/vehicle.service';
import { Vehicle } from '../../models/vehicle.model';
import { MaintenanceFormComponent } from '../maintenance-form/maintenance-form.component';
import { TaxFormComponent } from '../tax-form/tax-form.component';
import { VehicleFormComponent } from '../vehicle-form/vehicle-form.component';

@Component({
  selector: 'app-vehicle-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MaintenanceFormComponent,
    TaxFormComponent,
    VehicleFormComponent
  ],
  templateUrl: './vehicle-detail.component.html'
})
export class VehicleDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  vehicleService = inject(VehicleService);

  vehicle = signal<Vehicle | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  showMaintenanceModal = false;
  showTaxModal = false;
  showEditVehicleModal = false;

  totalMaintenanceCost = computed(() => {
    const v = this.vehicle();
    if (!v || !v.maintenanceHistory) return 0;
    return v.maintenanceHistory.reduce((sum, m) => sum + (m.totalCost || 0), 0);
  });

  totalTaxCost = computed(() => {
    const v = this.vehicle();
    if (!v || !v.taxes) return 0;
    return v.taxes.reduce((sum, t) => sum + (t.amount || 0), 0);
  });

  sortedMaintenance = computed(() => {
    const v = this.vehicle();
    if (!v || !v.maintenanceHistory) return [];
    return [...v.maintenanceHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  sortedTaxes = computed(() => {
    const v = this.vehicle();
    if (!v || !v.taxes) return [];
    return [...v.taxes].sort((a, b) => new Date(b.paidDate).getTime() - new Date(a.paidDate).getTime());
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchVehicle(id);
    }
  }

  fetchVehicle(id: string): void {
    this.loading.set(true);
    this.vehicleService.getVehicleById(id).subscribe({
      next: (data) => {
        this.vehicle.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Vehicle not found');
        this.loading.set(false);
      }
    });
  }

  onMaintenanceSubmit(data: any): void {
    const v = this.vehicle();
    if (!v) return;
    this.vehicleService.addMaintenance(v._id, data).subscribe({
      next: (updated) => {
        this.vehicle.set(updated);
        this.showMaintenanceModal = false;
      },
      error: (err) => alert(err.message || 'Error saving maintenance record')
    });
  }

  onTaxSubmit(data: any): void {
    const v = this.vehicle();
    if (!v) return;
    this.vehicleService.addTax(v._id, data).subscribe({
      next: (updated) => {
        this.vehicle.set(updated);
        this.showTaxModal = false;
      },
      error: (err) => alert(err.message || 'Error saving tax record')
    });
  }

  onVehicleUpdate(data: any): void {
    const v = this.vehicle();
    if (!v) return;
    this.vehicleService.updateVehicle(v._id, data).subscribe({
      next: (updated) => {
        this.vehicle.set(updated);
        this.showEditVehicleModal = false;
      },
      error: (err) => alert(err.message || 'Error updating vehicle')
    });
  }

  onDelete(): void {
    const v = this.vehicle();
    if (!v) return;
    if (confirm(`Are you sure you want to delete ${v.modelType} (${v.plate})?`)) {
      this.vehicleService.deleteVehicle(v._id).subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (err) => alert(err.message || 'Error deleting vehicle')
      });
    }
  }
}
