import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  constructor(private firestore: Firestore) {}

  submitContactForm(formData: any) {
    const contactCollection = collection(this.firestore, 'contacts');
    return addDoc(contactCollection, formData);
  }
}
