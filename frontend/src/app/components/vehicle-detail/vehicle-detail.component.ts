import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { VehicleService } from '../../services/vehicle.service';
import { Vehicle, MaintenanceRecord, TaxRecord, FuelRecord } from '../../models/vehicle.model';
import { MaintenanceFormComponent } from '../maintenance-form/maintenance-form.component';
import { TaxFormComponent } from '../tax-form/tax-form.component';
import { VehicleFormComponent } from '../vehicle-form/vehicle-form.component';
import { FuelFormComponent } from '../fuel-form/fuel-form.component';

@Component({
  selector: 'app-vehicle-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MaintenanceFormComponent,
    TaxFormComponent,
    VehicleFormComponent,
    FuelFormComponent
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

  // Modals visibility
  showMaintenanceModal = false;
  showTaxModal = false;
  showEditVehicleModal = false;
  showFuelModal = false;

  // Selected records for editing
  selectedMaintenance = signal<MaintenanceRecord | null>(null);
  selectedTax = signal<TaxRecord | null>(null);
  selectedFuel = signal<FuelRecord | null>(null);

  // Date range filter for fuel expenses
  fuelStartDate = signal<string>('');
  fuelEndDate = signal<string>('');

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

  totalFuelCostAllTime = computed(() => {
    const v = this.vehicle();
    if (!v || !v.fuelHistory) return 0;
    return v.fuelHistory.reduce((sum, f) => sum + (f.totalCost || 0), 0);
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

  // Filtered fuel records based on fuelStartDate and fuelEndDate
  filteredFuelRecords = computed(() => {
    const v = this.vehicle();
    if (!v || !v.fuelHistory) return [];

    let list = [...v.fuelHistory];
    const startStr = this.fuelStartDate();
    const endStr = this.fuelEndDate();

    if (startStr) {
      const start = new Date(startStr);
      list = list.filter((f) => new Date(f.date) >= start);
    }

    if (endStr) {
      const end = new Date(endStr);
      end.setHours(23, 59, 59, 999);
      list = list.filter((f) => new Date(f.date) <= end);
    }

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  filteredFuelTotalCost = computed(() => {
    return this.filteredFuelRecords().reduce((sum, f) => sum + (f.totalCost || 0), 0);
  });

  filteredFuelTotalVolume = computed(() => {
    return this.filteredFuelRecords().reduce((sum, f) => sum + (f.volume || 0), 0);
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

  setFuelDateFilter(range: 'all' | '30days' | 'thisMonth' | 'thisYear'): void {
    const now = new Date();
    const format = (d: Date) => d.toISOString().split('T')[0];

    if (range === 'all') {
      this.fuelStartDate.set('');
      this.fuelEndDate.set('');
    } else if (range === '30days') {
      const past = new Date();
      past.setDate(now.getDate() - 30);
      this.fuelStartDate.set(format(past));
      this.fuelEndDate.set(format(now));
    } else if (range === 'thisMonth') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      this.fuelStartDate.set(format(start));
      this.fuelEndDate.set(format(now));
    } else if (range === 'thisYear') {
      const start = new Date(now.getFullYear(), 0, 1);
      this.fuelStartDate.set(format(start));
      this.fuelEndDate.set(format(now));
    }
  }

  // --- Maintenance Handlers ---
  openAddMaintenance(): void {
    this.selectedMaintenance.set(null);
    this.showMaintenanceModal = true;
  }

  openEditMaintenance(m: MaintenanceRecord): void {
    this.selectedMaintenance.set(m);
    this.showMaintenanceModal = true;
  }

  onMaintenanceSubmit(data: any): void {
    const v = this.vehicle();
    if (!v) return;

    if (data._id) {
      // Edit existing
      this.vehicleService.updateMaintenance(v._id, data._id, data).subscribe({
        next: (updated) => {
          this.vehicle.set(updated);
          this.showMaintenanceModal = false;
        },
        error: (err) => alert(err.message || 'Error updating maintenance record')
      });
    } else {
      // Add new
      this.vehicleService.addMaintenance(v._id, data).subscribe({
        next: (updated) => {
          this.vehicle.set(updated);
          this.showMaintenanceModal = false;
        },
        error: (err) => alert(err.message || 'Error saving maintenance record')
      });
    }
  }

  onDeleteMaintenance(m: MaintenanceRecord): void {
    const v = this.vehicle();
    if (!v || !m._id) return;
    if (confirm('Are you sure you want to delete this maintenance record?')) {
      this.vehicleService.deleteMaintenance(v._id, m._id).subscribe({
        next: (updated) => this.vehicle.set(updated),
        error: (err) => alert(err.message || 'Error deleting maintenance record')
      });
    }
  }

  // --- Tax Handlers ---
  openAddTax(): void {
    this.selectedTax.set(null);
    this.showTaxModal = true;
  }

  openEditTax(t: TaxRecord): void {
    this.selectedTax.set(t);
    this.showTaxModal = true;
  }

  onTaxSubmit(data: any): void {
    const v = this.vehicle();
    if (!v) return;

    if (data._id) {
      // Edit existing
      this.vehicleService.updateTax(v._id, data._id, data).subscribe({
        next: (updated) => {
          this.vehicle.set(updated);
          this.showTaxModal = false;
        },
        error: (err) => alert(err.message || 'Error updating tax record')
      });
    } else {
      // Add new
      this.vehicleService.addTax(v._id, data).subscribe({
        next: (updated) => {
          this.vehicle.set(updated);
          this.showTaxModal = false;
        },
        error: (err) => alert(err.message || 'Error saving tax record')
      });
    }
  }

  onDeleteTax(t: TaxRecord): void {
    const v = this.vehicle();
    if (!v || !t._id) return;
    if (confirm('Are you sure you want to delete this tax record?')) {
      this.vehicleService.deleteTax(v._id, t._id).subscribe({
        next: (updated) => this.vehicle.set(updated),
        error: (err) => alert(err.message || 'Error deleting tax record')
      });
    }
  }

  // --- Fuel Handlers ---
  openAddFuel(): void {
    this.selectedFuel.set(null);
    this.showFuelModal = true;
  }

  openEditFuel(f: FuelRecord): void {
    this.selectedFuel.set(f);
    this.showFuelModal = true;
  }

  onFuelSubmit(data: any): void {
    const v = this.vehicle();
    if (!v) return;

    if (data._id) {
      // Edit existing
      this.vehicleService.updateFuel(v._id, data._id, data).subscribe({
        next: (updated) => {
          this.vehicle.set(updated);
          this.showFuelModal = false;
        },
        error: (err) => alert(err.message || 'Error updating fuel record')
      });
    } else {
      // Add new
      this.vehicleService.addFuel(v._id, data).subscribe({
        next: (updated) => {
          this.vehicle.set(updated);
          this.showFuelModal = false;
        },
        error: (err) => alert(err.message || 'Error saving fuel record')
      });
    }
  }

  onDeleteFuel(f: FuelRecord): void {
    const v = this.vehicle();
    if (!v || !f._id) return;
    if (confirm('Are you sure you want to delete this refuel record?')) {
      this.vehicleService.deleteFuel(v._id, f._id).subscribe({
        next: (updated) => this.vehicle.set(updated),
        error: (err) => alert(err.message || 'Error deleting fuel record')
      });
    }
  }

  // --- Vehicle Handlers ---
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
