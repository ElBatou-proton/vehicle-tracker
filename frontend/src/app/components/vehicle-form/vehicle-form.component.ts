import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Vehicle } from '../../models/vehicle.model';

@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vehicle-form.component.html'
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
