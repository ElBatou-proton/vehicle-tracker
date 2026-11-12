import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { VehicleService } from '../../services/vehicle.service';
import { Vehicle } from '../../models/vehicle.model';
import { VehicleFormComponent } from '../vehicle-form/vehicle-form.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, VehicleFormComponent],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  vehicleService = inject(VehicleService);
  showAddModal = false;

  serviceAlertsCount = computed(() => {
    return this.vehicleService.vehicles().filter((v) => {
      const oil = this.vehicleService.calculateOilChangeCountdown(v);
      const soat = this.vehicleService.checkSoatStatus(v);
      const rev = this.vehicleService.checkRevisionStatus(v);
      return oil.status !== 'ok' || !soat.isValid || !rev.isValid;
    }).length;
  });

  ngOnInit(): void {
    this.vehicleService.loadAll().subscribe();
  }

  openAddModal(): void {
    this.showAddModal = true;
  }

  onVehicleCreated(data: any): void {
    this.vehicleService.createVehicle(data).subscribe({
      next: () => {
        this.showAddModal = false;
      },
      error: (err) => alert(err.message || 'Error creating vehicle')
    });
  }

  onDelete(vehicle: Vehicle): void {
    if (confirm(`Are you sure you want to delete ${vehicle.modelType} (${vehicle.plate})?`)) {
      this.vehicleService.deleteVehicle(vehicle._id).subscribe({
        error: (err) => alert(err.message || 'Error deleting vehicle')
      });
    }
  }

  onImgError(event: any): void {
    event.target.style.display = 'none';
  }
}
