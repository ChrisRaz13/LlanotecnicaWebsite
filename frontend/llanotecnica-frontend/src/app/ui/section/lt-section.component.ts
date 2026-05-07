import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type LtSectionTone = 'canvas' | 'subtle' | 'inverse' | 'brand';
export type LtSectionPadding = 'default' | 'large' | 'none';
export type LtSectionWidth = 'narrow' | 'base' | 'wide' | 'bleed';

@Component({
  selector: 'lt-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="lt-section__inner" [attr.data-width]="width()">
      <ng-content />
    </div>
  `,
  styleUrl: './lt-section.component.css',
  host: {
    class: 'lt-section',
    '[attr.data-tone]': 'tone()',
    '[attr.data-padding]': 'padding()',
  },
})
export class LtSectionComponent {
  tone = input<LtSectionTone>('canvas');
  padding = input<LtSectionPadding>('default');
  width = input<LtSectionWidth>('base');
}
