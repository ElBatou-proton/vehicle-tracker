import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Vehicle } from '../../models/vehicle.model';
import { VehicleService } from '../../services/vehicle.service';

@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vehicle-form.component.html'
})
export class VehicleFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private vehicleService = inject(VehicleService);

  @Input() vehicleToEdit?: Vehicle;
  @Output() formSubmit = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  isEditMode = false;
  submitting = false;

  selectedFile: File | null = null;
  imagePreview: string | null = null;
  uploadingImage = false;

  ngOnInit(): void {
    this.isEditMode = !!this.vehicleToEdit;
    const v = this.vehicleToEdit;

    if (v?.pictureUrl) {
      this.imagePreview = v.pictureUrl;
    }

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

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removePicture(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.form.patchValue({ pictureUrl: '' });
  }

  private formatDate(dateVal: any): string {
    if (!dateVal) return '';
    const d = new Date(dateVal);
    return d.toISOString().split('T')[0];
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;

    try {
      // If a new local image file was picked, upload it first
      if (this.selectedFile) {
        this.uploadingImage = true;
        const uploadRes = await this.vehicleService.uploadPicture(this.selectedFile).toPromise();
        if (uploadRes?.pictureUrl) {
          this.form.patchValue({ pictureUrl: uploadRes.pictureUrl });
        }
        this.uploadingImage = false;
      }

      const value = { ...this.form.value };
      if (!value.hasSoat) value.soatExpiryDate = null;
      if (!value.hasAnnualRevision) value.annualRevisionDate = null;
      this.formSubmit.emit(value);
    } catch (err: any) {
      this.uploadingImage = false;
      this.submitting = false;
      alert(err.message || 'Error uploading vehicle picture');
    }
  }
}
