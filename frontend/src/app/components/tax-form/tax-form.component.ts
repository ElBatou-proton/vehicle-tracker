import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaxRecord } from '../../models/vehicle.model';

@Component({
  selector: 'app-tax-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tax-form.component.html'
})
export class TaxFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  @Input() recordToEdit?: TaxRecord;
  @Output() formSubmit = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  submitting = false;
  isEditMode = false;

  ngOnInit(): void {
    this.isEditMode = !!this.recordToEdit;
    const r = this.recordToEdit;

    let dateVal = new Date().toISOString().split('T')[0];
    if (r?.paidDate) {
      dateVal = new Date(r.paidDate).toISOString().split('T')[0];
    }

    this.form = this.fb.group({
      year: [r?.year ?? new Date().getFullYear(), [Validators.required, Validators.min(1950)]],
      amount: [r?.amount ?? 0, [Validators.required, Validators.min(0)]],
      paidDate: [dateVal, Validators.required],
      receiptNumber: [r?.receiptNumber || '']
    });
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
      year: Number(val.year),
      amount: Number(val.amount),
      paidDate: val.paidDate,
      receiptNumber: val.receiptNumber
    });
  }
}
