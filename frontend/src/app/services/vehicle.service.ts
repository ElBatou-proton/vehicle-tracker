import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Vehicle, MaintenanceRecord, TaxRecord, FuelRecord } from '../models/vehicle.model';

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

  // Maintenance
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

  updateMaintenance(
    vehicleId: string,
    maintenanceId: string,
    maintenance: Partial<MaintenanceRecord>
  ): Observable<Vehicle> {
    return this.http
      .put<Vehicle>(`${this.apiUrl}/${vehicleId}/maintenance/${maintenanceId}`, maintenance)
      .pipe(
        tap((updated) => {
          this.vehicles.update((list) =>
            list.map((v) => (v._id === vehicleId ? updated : v))
          );
        })
      );
  }

  deleteMaintenance(vehicleId: string, maintenanceId: string): Observable<Vehicle> {
    return this.http
      .delete<Vehicle>(`${this.apiUrl}/${vehicleId}/maintenance/${maintenanceId}`)
      .pipe(
        tap((updated) => {
          this.vehicles.update((list) =>
            list.map((v) => (v._id === vehicleId ? updated : v))
          );
        })
      );
  }

  // Taxes
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

  updateTax(vehicleId: string, taxId: string, tax: Partial<TaxRecord>): Observable<Vehicle> {
    return this.http
      .put<Vehicle>(`${this.apiUrl}/${vehicleId}/taxes/${taxId}`, tax)
      .pipe(
        tap((updated) => {
          this.vehicles.update((list) =>
            list.map((v) => (v._id === vehicleId ? updated : v))
          );
        })
      );
  }

  deleteTax(vehicleId: string, taxId: string): Observable<Vehicle> {
    return this.http
      .delete<Vehicle>(`${this.apiUrl}/${vehicleId}/taxes/${taxId}`)
      .pipe(
        tap((updated) => {
          this.vehicles.update((list) =>
            list.map((v) => (v._id === vehicleId ? updated : v))
          );
        })
      );
  }

  // Fuel
  addFuel(vehicleId: string, fuel: Partial<FuelRecord>): Observable<Vehicle> {
    return this.http
      .post<Vehicle>(`${this.apiUrl}/${vehicleId}/fuel`, fuel)
      .pipe(
        tap((updated) => {
          this.vehicles.update((list) =>
            list.map((v) => (v._id === vehicleId ? updated : v))
          );
        })
      );
  }

  updateFuel(vehicleId: string, fuelId: string, fuel: Partial<FuelRecord>): Observable<Vehicle> {
    return this.http
      .put<Vehicle>(`${this.apiUrl}/${vehicleId}/fuel/${fuelId}`, fuel)
      .pipe(
        tap((updated) => {
          this.vehicles.update((list) =>
            list.map((v) => (v._id === vehicleId ? updated : v))
          );
        })
      );
  }

  deleteFuel(vehicleId: string, fuelId: string): Observable<Vehicle> {
    return this.http
      .delete<Vehicle>(`${this.apiUrl}/${vehicleId}/fuel/${fuelId}`)
      .pipe(
        tap((updated) => {
          this.vehicles.update((list) =>
            list.map((v) => (v._id === vehicleId ? updated : v))
          );
        })
      );
  }

  getFuelSummary(
    vehicleId: string,
    startDate?: string,
    endDate?: string
  ): Observable<{ records: FuelRecord[]; totalCost: number; totalVolume: number; count: number }> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<{
      records: FuelRecord[];
      totalCost: number;
      totalVolume: number;
      count: number;
    }>(`${this.apiUrl}/${vehicleId}/fuel`, { params });
  }

  uploadPicture(file: File): Observable<{ pictureUrl: string; filename: string }> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<{ pictureUrl: string; filename: string }>(
      `${this.apiUrl}/upload-image`,
      formData
    );
  }

  // Helper calculation for oil change countdown
  calculateOilChangeCountdown(vehicle: Vehicle): { remainingKm: number; status: 'ok' | 'due-soon' | 'overdue' } {
    const history = vehicle.maintenanceHistory || [];
    let lastMileage = 0;
    if (history.length > 0) {
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
