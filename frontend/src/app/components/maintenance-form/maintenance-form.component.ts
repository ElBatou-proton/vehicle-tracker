import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-maintenance-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
        <div class="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h2 class="text-xl font-bold text-gray-900">Log Maintenance Record</h2>
            <p class="text-xs text-gray-500">Record service, oil change, repairs and costs</p>
          </div>
          <button (click)="cancel.emit()" class="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="mt-4 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Service Date *</label>
              <input type="date" formControlName="date"
                class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Mileage at Service (km) *</label>
              <input type="number" formControlName="mileageAtService"
                class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Labor Cost ($)</label>
              <input type="number" step="0.01" formControlName="laborCost" (input)="recalculateTotal()"
                class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Parts Cost ($)</label>
              <input type="number" step="0.01" formControlName="partsCost" (input)="recalculateTotal()"
                class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div class="p-3 bg-blue-50 rounded-lg flex items-center justify-between">
            <span class="text-sm font-semibold text-blue-900">Total Calculated Cost:</span>
            <span class="text-lg font-bold text-blue-700">\${{ form.get('totalCost')?.value | number:'1.2-2' }}</span>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Parts Replaced (comma separated)</label>
            <input type="text" formControlName="partsReplacedString" placeholder="Oil filter, 5W-30 Oil, Brake pads"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Mechanic / Workshop</label>
            <input type="text" formControlName="mechanicOrShop" placeholder="AutoCenter Garage"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Notes / Diagnostics</label>
            <textarea rows="3" formControlName="notes" placeholder="Scheduled oil change, fluid check, tire pressure..."
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
          </div>

          <div class="flex justify-end space-x-3 pt-3 border-t border-gray-100">
            <button type="button" (click)="cancel.emit()"
              class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" [disabled]="form.invalid || submitting"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {{ submitting ? 'Logging...' : 'Save Maintenance Record' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class MaintenanceFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  @Input() currentVehicleMileage = 0;
  @Output() formSubmit = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  submitting = false;

  ngOnInit(): void {
    const today = new Date().toISOString().split('T')[0];
    this.form = this.fb.group({
      date: [today, Validators.required],
      mileageAtService: [this.currentVehicleMileage, [Validators.required, Validators.min(0)]],
      laborCost: [0, [Validators.min(0)]],
      partsCost: [0, [Validators.min(0)]],
      totalCost: [0, [Validators.required, Validators.min(0)]],
      partsReplacedString: [''],
      mechanicOrShop: [''],
      notes: ['']
    });
  }

  recalculateTotal(): void {
    const labor = Number(this.form.get('laborCost')?.value || 0);
    const parts = Number(this.form.get('partsCost')?.value || 0);
    this.form.patchValue({ totalCost: labor + parts });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const val = this.form.value;
    const partsReplaced = val.partsReplacedString
      ? val.partsReplacedString.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];

    this.formSubmit.emit({
      date: val.date,
      mileageAtService: Number(val.mileageAtService),
      laborCost: Number(val.laborCost || 0),
      partsCost: Number(val.partsCost || 0),
      totalCost: Number(val.totalCost || 0),
      partsReplaced,
      mechanicOrShop: val.mechanicOrShop,
      notes: val.notes
    });
  }
}

