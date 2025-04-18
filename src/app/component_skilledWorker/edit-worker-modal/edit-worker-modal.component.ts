import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-edit-worker-modal',
  standalone: true,
  imports: [MatIconModule, MatCardModule, MatInputModule, MatDialogModule, MatButtonModule,FormsModule,CommonModule,MatFormFieldModule ],
  templateUrl: './edit-worker-modal.component.html',
  styleUrl: './edit-worker-modal.component.css'
})
export class EditWorkerModalComponent {
  imagePreview: string | null = null; 
  constructor(
    public dialogRef: MatDialogRef<EditWorkerModalComponent>,
    @Inject(MAT_DIALOG_DATA) public worker: any
  ) {}

  closeDialog(): void {
    this.dialogRef.close();
  }

  saveChanges(): void {
    this.dialogRef.close(this.worker); 
  }


  
onImageSelected(event: any): void {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
    this.worker.image = file;
  }
}

onWorkImageSelected(event: any, index: number): void {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      this.worker.works[index].imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
    this.worker.works[index].image = file;
  }
}

}