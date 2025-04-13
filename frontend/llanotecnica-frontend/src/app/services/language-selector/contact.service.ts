import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, serverTimestamp } from '@angular/fire/firestore';
import { catchError, from, Observable, throwError } from 'rxjs';

export interface ContactFormData {
  name: string;
  email: string;
  subject?: string;
  message: string;
  createdAt?: any;
}

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  constructor(private firestore: Firestore) {}

  submitContactForm(formData: ContactFormData): Observable<any> {
    // Prepare the data with timestamp
    const data = {
      ...formData,
      createdAt: serverTimestamp()
    };

    // Get a reference to the contacts collection
    const contactCollection = collection(this.firestore, 'contacts');

    // Convert the Promise to an Observable for better Angular integration
    return from(addDoc(contactCollection, data)).pipe(
      catchError(error => {
        console.error('Error submitting contact form:', error);
        return throwError(() => new Error('Failed to submit contact form. Please try again later.'));
      })
    );
  }
}
