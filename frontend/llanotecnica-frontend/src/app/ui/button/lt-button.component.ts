import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';

export type LtButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'catalog';
export type LtButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'lt-button, a[lt-button], button[lt-button]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // None: required so styles apply when used as `[lt-button]` directive on a host
  // <button> / <a> in another component's template (Emulated would scope-lock them).
  // All selectors are namespaced under `.lt-btn` so there's no leakage risk.
  encapsulation: ViewEncapsulation.None,
  template: `<ng-content />`,
  styleUrl: './lt-button.component.css',
  host: {
    '[class]': 'classList()',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
  },
})
export class LtButtonComponent {
  variant = input<LtButtonVariant>('primary');
  size = input<LtButtonSize>('md');
  block = input(false);

  protected readonly classList = computed(() => {
    const classes = ['lt-btn'];
    if (this.block()) classes.push('lt-btn--block');
    return classes.join(' ');
  });
}
