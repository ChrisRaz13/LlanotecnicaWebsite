import { Directive, ElementRef, inject, output } from '@angular/core';

@Directive({
  selector: '[clickOutside]',
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:touchstart)': 'onDocumentClick($event)',
  },
})
export class ClickOutsideDirective {
  readonly clickOutside = output<Event>();

  private readonly elementRef = inject(ElementRef);

  onDocumentClick(event: Event): void {
    const targetElement = event.target as HTMLElement;
    if (targetElement && !this.elementRef.nativeElement.contains(targetElement)) {
      this.clickOutside.emit(event);
    }
  }
}
