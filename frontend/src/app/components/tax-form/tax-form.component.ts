import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-tax-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div class="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h2 class="text-xl font-bold text-gray-900">Log Tax Payment</h2>
            <p class="text-xs text-gray-500">Record annual road taxes or vehicular municipal levies</p>
          </div>
          <button (click)="cancel.emit()" class="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="mt-4 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Tax Year *</label>
            <input type="number" formControlName="year"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Amount Paid ($) *</label>
            <input type="number" step="0.01" formControlName="amount"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Payment Date *</label>
            <input type="date" formControlName="paidDate"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Receipt / Transaction #</label>
            <input type="text" formControlName="receiptNumber" placeholder="e.g. REC-2024-98432"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div class="flex justify-end space-x-3 pt-3 border-t border-gray-100">
            <button type="button" (click)="cancel.emit()"
              class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" [disabled]="form.invalid || submitting"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {{ submitting ? 'Saving...' : 'Save Tax Record' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
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

