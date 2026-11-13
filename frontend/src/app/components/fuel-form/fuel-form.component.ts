import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FuelRecord } from '../../models/vehicle.model';

@Component({
  selector: 'app-fuel-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './fuel-form.component.html'
})
export class FuelFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  @Input() currentVehicleMileage = 0;
  @Input() recordToEdit?: FuelRecord;
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

    this.form = this.fb.group({
      date: [dateVal, Validators.required],
      mileageAtRefuel: [r?.mileageAtRefuel ?? this.currentVehicleMileage, [Validators.required, Validators.min(0)]],
      volume: [r?.volume ?? 0, [Validators.required, Validators.min(0.01)]],
      unitCost: [r?.unitCost ?? 0, [Validators.min(0)]],
      totalCost: [r?.totalCost ?? 0, [Validators.required, Validators.min(0)]],
      fuelType: [r?.fuelType || 'Regular', Validators.required],
      station: [r?.station || ''],
      notes: [r?.notes || '']
    });
  }

  onVolumeOrUnitCostChange(): void {
    const vol = Number(this.form.get('volume')?.value || 0);
    const unit = Number(this.form.get('unitCost')?.value || 0);
    if (vol > 0 && unit > 0) {
      const calcTotal = Math.round(vol * unit * 100) / 100;
      this.form.patchValue({ totalCost: calcTotal });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const val = this.form.value;
    this.formSubmit.emit({
      _id: this.recordToEdit?._id,
      date: val.date,
      mileageAtRefuel: Number(val.mileageAtRefuel),
      volume: Number(val.volume),
      unitCost: Number(val.unitCost || 0),
      totalCost: Number(val.totalCost),
      fuelType: val.fuelType,
      station: val.station,
      notes: val.notes
    });
  }
}
