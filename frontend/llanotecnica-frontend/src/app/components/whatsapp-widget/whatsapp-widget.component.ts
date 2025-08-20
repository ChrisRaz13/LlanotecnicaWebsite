import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-whatsapp-widget',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './whatsapp-widget.component.html',
  styleUrls: ['./whatsapp-widget.component.css']
})
export class WhatsappWidgetComponent implements OnInit, OnDestroy {
  private langChangeSubscription?: Subscription;
  private readonly phoneNumber = '50765664942'; // Your WhatsApp business number

  constructor(private translate: TranslateService) {}

  ngOnInit(): void {
    // Listen for language changes to update the widget
    this.langChangeSubscription = this.translate.onLangChange.subscribe(() => {
      // Component will automatically update when language changes
    });
  }

  ngOnDestroy(): void {
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }

  openWhatsApp(): void {
    // Get the translated message
    this.translate.get('WHATSAPP.MESSAGE').subscribe((message: string) => {
      const encodedMessage = encodeURIComponent(message);

      // Always try to open WhatsApp app directly first
      const whatsappAppUrl = `whatsapp://send?phone=${this.phoneNumber}&text=${encodedMessage}`;

      // Use window.location.href to avoid popups and go directly to app
      window.location.href = whatsappAppUrl;
    });
  }
}
