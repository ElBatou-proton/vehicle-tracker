import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-tax-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tax-form.component.html'
})
export class TaxFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  @Output() formSubmit = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  submitting = false;

  ngOnInit(): void {
    const today = new Date().toISOString().split('T')[0];
    this.form = this.fb.group({
      year: [new Date().getFullYear(), [Validators.required, Validators.min(1950)]],
      amount: [0, [Validators.required, Validators.min(0)]],
      paidDate: [today, Validators.required],
      receiptNumber: ['']
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
      year: Number(val.year),
      amount: Number(val.amount),
      paidDate: val.paidDate,
      receiptNumber: val.receiptNumber
    });
  }
}
