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

      // Detect if we're on mobile or desktop
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      if (isMobile) {
        // For mobile devices, try to open the WhatsApp app directly
        const whatsappAppUrl = `whatsapp://send?phone=${this.phoneNumber}&text=${encodedMessage}`;
        window.location.href = whatsappAppUrl;
      } else {
        // For desktop, use web WhatsApp which works in all browsers
        const whatsappWebUrl = `https://wa.me/${this.phoneNumber}?text=${encodedMessage}`;
        window.open(whatsappWebUrl, '_blank');
      }
    });
  }
}
