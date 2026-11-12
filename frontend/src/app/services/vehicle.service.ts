import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Vehicle, MaintenanceRecord, TaxRecord } from '../models/vehicle.model';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/vehicles';

  // Signals
  readonly vehicles = signal<Vehicle[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly totalVehicles = computed(() => this.vehicles().length);
  readonly totalFleetMileage = computed(() =>
    this.vehicles().reduce((acc, v) => acc + (v.currentMileage || 0), 0)
  );

  loadAll(): Observable<Vehicle[]> {
    this.loading.set(true);
    this.error.set(null);
    return this.http.get<Vehicle[]>(this.apiUrl).pipe(
      tap((data) => {
        this.vehicles.set(data);
        this.loading.set(false);
      }),
      catchError((err) => {
        this.error.set(err.message || 'Failed to load vehicles');
        this.loading.set(false);
        return throwError(() => err);
      })
    );
  }

  getVehicleById(id: string): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.apiUrl}/${id}`);
  }

  createVehicle(vehicle: Partial<Vehicle>): Observable<Vehicle> {
    return this.http.post<Vehicle>(this.apiUrl, vehicle).pipe(
      tap((newVehicle) => {
        this.vehicles.update((list) => [newVehicle, ...list]);
      })
    );
  }

  updateVehicle(id: string, vehicle: Partial<Vehicle>): Observable<Vehicle> {
    return this.http.put<Vehicle>(`${this.apiUrl}/${id}`, vehicle).pipe(
      tap((updated) => {
        this.vehicles.update((list) =>
          list.map((v) => (v._id === id ? updated : v))
        );
      })
    );
  }

  deleteVehicle(id: string): Observable<{ message: string; id: string }> {
    return this.http.delete<{ message: string; id: string }>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.vehicles.update((list) => list.filter((v) => v._id !== id));
      })
    );
  }

  addMaintenance(vehicleId: string, maintenance: Partial<MaintenanceRecord>): Observable<Vehicle> {
    return this.http
      .post<Vehicle>(`${this.apiUrl}/${vehicleId}/maintenance`, maintenance)
      .pipe(
        tap((updated) => {
          this.vehicles.update((list) =>
            list.map((v) => (v._id === vehicleId ? updated : v))
          );
        })
      );
  }

  addTax(vehicleId: string, tax: Partial<TaxRecord>): Observable<Vehicle> {
    return this.http
      .post<Vehicle>(`${this.apiUrl}/${vehicleId}/taxes`, tax)
      .pipe(
        tap((updated) => {
          this.vehicles.update((list) =>
            list.map((v) => (v._id === vehicleId ? updated : v))
          );
        })
      );
  }

  // Helper calculation for oil change countdown
  calculateOilChangeCountdown(vehicle: Vehicle): { remainingKm: number; status: 'ok' | 'due-soon' | 'overdue' } {
    const history = vehicle.maintenanceHistory || [];
    let lastMileage = 0;
    if (history.length > 0) {
      // Find highest mileage at service
      lastMileage = Math.max(...history.map((m) => m.mileageAtService || 0));
    }
    const targetMileage = lastMileage + (vehicle.kilometerInterval || 5000);
    const remainingKm = targetMileage - (vehicle.currentMileage || 0);

    let status: 'ok' | 'due-soon' | 'overdue' = 'ok';
    if (remainingKm <= 0) {
      status = 'overdue';
    } else if (remainingKm <= (vehicle.kilometerInterval * 0.15 || 500)) {
      status = 'due-soon';
    }
    return { remainingKm, status };
  }

  // Helper check for SOAT validity
  checkSoatStatus(vehicle: Vehicle): { isValid: boolean; label: string; daysRemaining?: number } {
    if (!vehicle.hasSoat || !vehicle.soatExpiryDate) {
      return { isValid: false, label: 'No SOAT' };
    }
    const expiry = new Date(vehicle.soatExpiryDate).getTime();
    const now = new Date().getTime();
    const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return { isValid: false, label: 'Expired', daysRemaining: diffDays };
    }
    if (diffDays <= 30) {
      return { isValid: true, label: `Expires in ${diffDays}d`, daysRemaining: diffDays };
    }
    return { isValid: true, label: `Valid (${diffDays}d)`, daysRemaining: diffDays };
  }

  // Helper check for Annual Revision status
  checkRevisionStatus(vehicle: Vehicle): { isValid: boolean; label: string } {
    if (!vehicle.hasAnnualRevision || !vehicle.annualRevisionDate) {
      return { isValid: false, label: 'Pending' };
    }
    const revDate = new Date(vehicle.annualRevisionDate);
    const oneYearLater = new Date(revDate);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

    const now = new Date();
    if (now > oneYearLater) {
      return { isValid: false, label: 'Expired' };
    }
    return { isValid: true, label: 'Up to Date' };
  }
}

