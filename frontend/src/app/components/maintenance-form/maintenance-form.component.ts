import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-maintenance-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './maintenance-form.component.html'
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
