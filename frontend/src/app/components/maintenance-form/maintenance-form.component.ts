import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaintenanceRecord } from '../../models/vehicle.model';

@Component({
  selector: 'app-maintenance-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './maintenance-form.component.html'
})
export class MaintenanceFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  @Input() currentVehicleMileage = 0;
  @Input() recordToEdit?: MaintenanceRecord;
  @Output() formSubmit = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  submitting = false;
  isEditMode = false;

  ngOnInit(): void {
    this.isEditMode = !!this.recordToEdit;
    const r = this.recordToEdit;

    let dateVal = new Date().toISOString().split('T')[0];
    if (r?.date) {
      dateVal = new Date(r.date).toISOString().split('T')[0];
    }

    const partsStr = r?.partsReplaced ? r.partsReplaced.join(', ') : '';

    this.form = this.fb.group({
      date: [dateVal, Validators.required],
      mileageAtService: [r?.mileageAtService ?? this.currentVehicleMileage, [Validators.required, Validators.min(0)]],
      laborCost: [r?.laborCost ?? 0, [Validators.min(0)]],
      partsCost: [r?.partsCost ?? 0, [Validators.min(0)]],
      totalCost: [r?.totalCost ?? 0, [Validators.required, Validators.min(0)]],
      partsReplacedString: [partsStr],
      mechanicOrShop: [r?.mechanicOrShop || ''],
      notes: [r?.notes || '']
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
      _id: this.recordToEdit?._id,
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
