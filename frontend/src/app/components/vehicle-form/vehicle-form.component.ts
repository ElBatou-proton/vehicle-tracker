import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Vehicle } from '../../models/vehicle.model';

@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-100 dark:border-slate-800 transition-colors">
        <div class="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">
            {{ isEditMode ? 'Edit Vehicle' : 'Register New Vehicle' }}
          </h2>
          <button (click)="cancel.emit()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none">&times;</button>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="mt-4 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300">Model Type *</label>
            <input type="text" formControlName="modelType" placeholder="e.g. Toyota Hilux 2022"
              class="mt-1 w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <p *ngIf="form.get('modelType')?.invalid && form.get('modelType')?.touched" class="text-xs text-red-500 mt-1">
              Model Type is required.
            </p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-slate-300">Plate Number *</label>
              <input type="text" formControlName="plate" placeholder="e.g. ABC-123"
                class="mt-1 w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm uppercase text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <p *ngIf="form.get('plate')?.invalid && form.get('plate')?.touched" class="text-xs text-red-500 mt-1">
                Plate is required.
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-slate-300">Year *</label>
              <input type="number" formControlName="year" placeholder="2022"
                class="mt-1 w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-slate-300">Color *</label>
              <input type="text" formControlName="color" placeholder="e.g. Silver Metallic"
                class="mt-1 w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-slate-300">Current Mileage (km) *</label>
              <input type="number" formControlName="currentMileage" placeholder="45000"
                class="mt-1 w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300">Service Interval (km) *</label>
            <input type="number" formControlName="kilometerInterval" placeholder="5000"
              class="mt-1 w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <span class="text-xs text-gray-500 dark:text-slate-400">Target distance between oil changes and maintenance</span>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300">Picture URL (optional)</label>
            <input type="text" formControlName="pictureUrl" placeholder="https://..."
              class="mt-1 w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <!-- Legal & Compliance section -->
          <div class="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-lg space-y-3 border border-gray-200 dark:border-slate-700">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-300">Compliance & Legal</h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="flex items-center space-x-2 text-sm text-gray-700 dark:text-slate-300">
                  <input type="checkbox" formControlName="hasSoat" class="rounded text-blue-600 focus:ring-blue-500" />
                  <span>Has SOAT</span>
                </label>
                <div *ngIf="form.get('hasSoat')?.value">
                  <label class="block text-xs text-gray-500 dark:text-slate-400">SOAT Expiry</label>
                  <input type="date" formControlName="soatExpiryDate"
                    class="mt-1 w-full rounded border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 text-xs text-gray-900 dark:text-white" />
                </div>
              </div>

              <div class="space-y-2">
                <label class="flex items-center space-x-2 text-sm text-gray-700 dark:text-slate-300">
                  <input type="checkbox" formControlName="hasAnnualRevision" class="rounded text-blue-600 focus:ring-blue-500" />
                  <span>Annual Revision</span>
                </label>
                <div *ngIf="form.get('hasAnnualRevision')?.value">
                  <label class="block text-xs text-gray-500 dark:text-slate-400">Revision Date</label>
                  <input type="date" formControlName="annualRevisionDate"
                    class="mt-1 w-full rounded border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 text-xs text-gray-900 dark:text-white" />
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-3 pt-3 border-t border-gray-100 dark:border-slate-800">
            <button type="button" (click)="cancel.emit()"
              class="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800">
              Cancel
            </button>
            <button type="submit" [disabled]="form.invalid || submitting"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {{ submitting ? 'Saving...' : (isEditMode ? 'Update Vehicle' : 'Register Vehicle') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class VehicleFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  @Input() vehicleToEdit?: Vehicle;
  @Output() formSubmit = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  isEditMode = false;
  submitting = false;

  ngOnInit(): void {
    this.isEditMode = !!this.vehicleToEdit;
    const v = this.vehicleToEdit;

    this.form = this.fb.group({
      modelType: [v?.modelType || '', Validators.required],
      plate: [v?.plate || '', Validators.required],
      year: [v?.year || new Date().getFullYear(), [Validators.required, Validators.min(1900)]],
      color: [v?.color || '', Validators.required],
      pictureUrl: [v?.pictureUrl || ''],
      currentMileage: [v?.currentMileage ?? 0, [Validators.required, Validators.min(0)]],
      kilometerInterval: [v?.kilometerInterval ?? 5000, [Validators.required, Validators.min(500)]],
      hasSoat: [v?.hasSoat ?? false],
      soatExpiryDate: [v?.soatExpiryDate ? this.formatDate(v.soatExpiryDate) : ''],
      hasAnnualRevision: [v?.hasAnnualRevision ?? false],
      annualRevisionDate: [v?.annualRevisionDate ? this.formatDate(v.annualRevisionDate) : ''],
    });
  }

  private formatDate(dateVal: any): string {
    if (!dateVal) return '';
    const d = new Date(dateVal);
    return d.toISOString().split('T')[0];
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const value = { ...this.form.value };
    if (!value.hasSoat) value.soatExpiryDate = null;
    if (!value.hasAnnualRevision) value.annualRevisionDate = null;
    this.formSubmit.emit(value);
  }
}
