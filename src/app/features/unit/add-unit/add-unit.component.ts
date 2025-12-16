import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UnitService } from '../services/unit.service';
import { CreateUnitRequest } from '../../property/models/create-unit-request.model';

@Component({
  selector: 'app-add-unit',
  templateUrl: './add-unit.component.html',
  styleUrls: ['./add-unit.component.css']
})
export class AddUnitComponent implements OnInit {

  unitForm!: FormGroup;
  propertyId!: number;
  selectedFile: File | null = null;
  isSubmitting = false;
  previewUrl: string | ArrayBuffer | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private unitService: UnitService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.propertyId = +params['propertyId'] || 0;
    });

    this.unitForm = this.fb.group({
      price: ['', [Validators.required, Validators.min(0)]],
      type: ['', Validators.required],
      bathrooms: ['', [Validators.required, Validators.min(0)]],
      size: ['', [Validators.required, Validators.min(1)]],
      floor: ['', [Validators.required, Validators.min(0)]],
      doorNumber: ['', Validators.required],
      status: ['Available', Validators.required]
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => (this.previewUrl = reader.result);
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSubmit(): void {
    if (this.unitForm.invalid) {
      this.unitForm.markAllAsTouched();
      return;
    }

    const unitData: CreateUnitRequest = {
      ...this.unitForm.value,
      propertyId: this.propertyId
    };

    const formData = new FormData();
    formData.append('units', JSON.stringify([unitData]));
    if (this.selectedFile) {
      formData.append('imageFile', this.selectedFile);
    }

    this.isSubmitting = true;
    this.unitService.createUnit(formData).subscribe({
      next: () => {
        this.isSubmitting = false;
        alert(' Unit created successfully!');
        this.router.navigate([`/manage/${this.propertyId}/units`]);
      },
      error: err => {
        console.error(' Unit creation failed:', err);
        this.isSubmitting = false;
        alert('Failed to create unit. Please try again.');
      }
    });
  }

  onCancel(): void {
    this.router.navigate([`/manage/${this.propertyId}/units`]);
  }
}
