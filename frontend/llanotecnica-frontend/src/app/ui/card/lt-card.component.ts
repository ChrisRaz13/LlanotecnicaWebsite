import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type LtCardVariant = 'default' | 'spec' | 'feature' | 'outline';
export type LtCardElevation = 'flat' | 'raised' | 'floating';

@Component({
  selector: 'lt-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styleUrl: './lt-card.component.css',
  host: {
    class: 'lt-card',
    '[attr.data-variant]': 'variant()',
    '[attr.data-elevation]': 'elevation()',
    '[attr.data-interactive]': 'interactive() ? "" : null',
  },
})
export class LtCardComponent {
  variant = input<LtCardVariant>('default');
  elevation = input<LtCardElevation>('raised');
  interactive = input(false);
}
