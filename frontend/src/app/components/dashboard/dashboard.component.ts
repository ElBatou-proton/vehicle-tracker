import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { VehicleService } from '../../services/vehicle.service';
import { Vehicle } from '../../models/vehicle.model';
import { VehicleFormComponent } from '../vehicle-form/vehicle-form.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, VehicleFormComponent],
  template: `
    <div class="space-y-6">
      <!-- Header / Top Bar -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
        <div>
          <h1 class="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Fleet Overview</h1>
          <p class="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Real-time status, maintenance intervals and legal compliance</p>
        </div>
        <button (click)="openAddModal()"
          class="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-sm transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          <span>Register Vehicle</span>
        </button>
      </div>

      <!-- Quick Metrics Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center space-x-4 transition-colors">
          <div class="p-3 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h8m-8 5h8m-8 5h8M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z"></path>
            </svg>
          </div>
          <div>
            <div class="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Total Vehicles</div>
            <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ vehicleService.totalVehicles() }}</div>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center space-x-4 transition-colors">
          <div class="p-3 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <div>
            <div class="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Total Fleet Distance</div>
            <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ vehicleService.totalFleetMileage() | number }} <span class="text-sm font-normal text-gray-500 dark:text-slate-400">km</span></div>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center space-x-4 transition-colors">
          <div class="p-3 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-xl">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <div>
            <div class="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Service Alerts</div>
            <div class="text-2xl font-bold text-amber-600 dark:text-amber-400">{{ serviceAlertsCount() }}</div>
          </div>
        </div>
      </div>

      <!-- Loading and Error States -->
      <div *ngIf="vehicleService.loading()" class="py-16 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <p class="text-sm text-gray-500 dark:text-slate-400 mt-2">Loading vehicle database...</p>
      </div>

      <div *ngIf="vehicleService.error() as err" class="p-4 bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 rounded-xl text-sm border border-red-200 dark:border-red-900">
        {{ err }}
      </div>

      <!-- Empty State -->
      <div *ngIf="!vehicleService.loading() && vehicleService.vehicles().length === 0"
        class="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-gray-300 dark:border-slate-700 p-12 text-center transition-colors">
        <div class="w-16 h-16 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path>
          </svg>
        </div>
        <h3 class="text-lg font-bold text-gray-800 dark:text-white">No vehicles registered yet</h3>
        <p class="text-sm text-gray-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">Get started by tracking your first vehicle, maintenance history and legal expiration dates.</p>
        <button (click)="openAddModal()"
          class="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl shadow-sm text-sm">
          Register First Vehicle
        </button>
      </div>

      <!-- Vehicles Grid -->
      <div *ngIf="!vehicleService.loading() && vehicleService.vehicles().length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let vehicle of vehicleService.vehicles()"
          class="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition flex flex-col overflow-hidden">
          
          <!-- Image or Header Banner -->
          <div class="h-44 bg-gradient-to-r from-slate-700 to-slate-900 relative overflow-hidden flex items-center justify-center">
            <img *ngIf="vehicle.pictureUrl" [src]="vehicle.pictureUrl" [alt]="vehicle.modelType"
              class="w-full h-full object-cover" (error)="onImgError($event)" />
            <div *ngIf="!vehicle.pictureUrl" class="text-slate-400 flex flex-col items-center">
              <svg class="w-14 h-14 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path>
              </svg>
            </div>
            <!-- License Plate Badge -->
            <div class="absolute bottom-3 left-4 bg-amber-400 text-gray-900 font-mono font-black text-xs px-2.5 py-1 rounded shadow border-2 border-gray-900 tracking-wider">
              {{ vehicle.plate }}
            </div>
            <div class="absolute top-3 right-4 bg-black/60 backdrop-blur text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              {{ vehicle.year }}
            </div>
          </div>

          <!-- Card Content -->
          <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
            <div>
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="font-bold text-gray-900 dark:text-white text-lg leading-tight">{{ vehicle.modelType }}</h3>
                  <p class="text-xs text-gray-500 dark:text-slate-400 capitalize mt-0.5">Color: {{ vehicle.color }}</p>
                </div>
                <div class="text-right">
                  <div class="text-xs text-gray-400 dark:text-slate-500 font-semibold uppercase">Odometer</div>
                  <div class="font-bold text-gray-900 dark:text-white text-sm">{{ vehicle.currentMileage | number }} km</div>
                </div>
              </div>

              <!-- Indicators Section -->
              <div class="mt-4 space-y-3 pt-3 border-t border-gray-100 dark:border-slate-800">
                <!-- Oil Change Countdown -->
                <ng-container *ngIf="vehicleService.calculateOilChangeCountdown(vehicle) as oil">
                  <div class="space-y-1">
                    <div class="flex justify-between items-center text-xs">
                      <span class="font-medium text-gray-600 dark:text-slate-400">Next Service / Oil Change</span>
                      <span [ngClass]="{
                        'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800': oil.status === 'ok',
                        'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800': oil.status === 'due-soon',
                        'text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800': oil.status === 'overdue'
                      }" class="font-bold px-2 py-0.5 rounded-full border text-[11px]">
                        {{ oil.status === 'overdue' ? 'Overdue by ' + (-oil.remainingKm | number) + ' km' : oil.remainingKm + ' km left' }}
                      </span>
                    </div>
                  </div>
                </ng-container>

                <!-- Legal Compliance Badges -->
                <div class="grid grid-cols-2 gap-2 text-xs pt-1">
                  <!-- SOAT -->
                  <div class="p-2 rounded-lg border flex flex-col"
                    [ngClass]="{
                      'bg-emerald-50/60 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800/80 dark:text-emerald-300': vehicleService.checkSoatStatus(vehicle).isValid,
                      'bg-rose-50/60 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800/80 dark:text-rose-300': !vehicleService.checkSoatStatus(vehicle).isValid
                    }">
                    <span class="text-[10px] uppercase font-semibold text-gray-500 dark:text-slate-400">SOAT Insurance</span>
                    <span class="font-bold mt-0.5 truncate">{{ vehicleService.checkSoatStatus(vehicle).label }}</span>
                  </div>

                  <!-- Revision -->
                  <div class="p-2 rounded-lg border flex flex-col"
                    [ngClass]="{
                      'bg-emerald-50/60 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800/80 dark:text-emerald-300': vehicleService.checkRevisionStatus(vehicle).isValid,
                      'bg-rose-50/60 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800/80 dark:text-rose-300': !vehicleService.checkRevisionStatus(vehicle).isValid
                    }">
                    <span class="text-[10px] uppercase font-semibold text-gray-500 dark:text-slate-400">Annual Revision</span>
                    <span class="font-bold mt-0.5 truncate">{{ vehicleService.checkRevisionStatus(vehicle).label }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action buttons -->
            <div class="pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <a [routerLink]="['/vehicle', vehicle._id]"
                class="inline-flex items-center space-x-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold text-sm">
                <span>View Details & History</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </a>
              <button (click)="onDelete(vehicle)" title="Remove vehicle"
                class="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Register Modal -->
    <app-vehicle-form *ngIf="showAddModal"
      (formSubmit)="onVehicleCreated($event)"
      (cancel)="showAddModal = false">
    </app-vehicle-form>
  `
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
