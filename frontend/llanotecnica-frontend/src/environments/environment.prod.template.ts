/**
 * Production environment TEMPLATE.
 *
 * This file IS committed. The real environment.prod.ts is gitignored and
 * generated in CI from this template by substituting the `__PLACEHOLDER__`
 * tokens with values from GitHub Actions Secrets. See
 * .github/workflows/firebase-hosting-merge.yml for the substitution step.
 *
 * Why both? Firebase + reCAPTCHA web identifiers below are technically
 * "public-by-design" (they ship in the deployed JS bundle anyway), but
 * keeping them out of the public repo's git history removes an entire
 * class of low-effort scraping/abuse and makes future key rotation
 * straightforward.
 *
 * Required GitHub Repository Secrets (Settings → Secrets and variables → Actions):
 *   - FIREBASE_API_KEY
 *   - GMAPS_API_KEY
 *   - RECAPTCHA_SITE_KEY
 *
 * For local development, copy this file to environment.prod.ts and fill in
 * the placeholder values from the GCP / Firebase consoles. The local copy
 * is gitignored.
 */
export const environment = {
  production: true,
  firebaseConfig: {
    apiKey: "__FIREBASE_API_KEY__",
    authDomain: "llanotecnica-59a31.firebaseapp.com",
    projectId: "llanotecnica-59a31",
    storageBucket: "llanotecnica-59a31.appspot.com",
    messagingSenderId: "1074323101950",
    appId: "1:1074323101950:web:fdb48169082d0360b02daf",
    measurementId: "G-VQPNJ37TSN"
  },
  googleMapsApiKey: "__GMAPS_API_KEY__",
  recaptcha: {
    siteKey: "__RECAPTCHA_SITE_KEY__"
  },
  contactFormEndpoint: "https://us-central1-llanotecnica-59a31.cloudfunctions.net/submitContactForm",
  logLevel: 'error',
  reCaptchaThreshold: 0.5,
  maxRetries: 3,
  api: {
    contact: {
      submitForm: "https://us-central1-llanotecnica-59a31.cloudfunctions.net/submitContactForm",
      timeout: 30000
    }
  },
  features: {
    enableGoogleMaps: true,
    enableRecaptcha: true,
    enableContactForm: true
  }
};
