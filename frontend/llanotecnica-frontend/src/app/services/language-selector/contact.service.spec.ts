import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import { ContactService } from './contact.service';

describe('ContactService', () => {
  let service: ContactService;

  beforeEach(() => {
    const firestoreStub = () => ({});
    TestBed.configureTestingModule({
      providers: [
        ContactService,
        { provide: Firestore, useFactory: firestoreStub }
      ]
    });
    service = TestBed.inject(ContactService);
  });

  it('can load instance', () => {
    expect(service).toBeTruthy();
  });
});
