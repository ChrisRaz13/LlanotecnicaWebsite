/**
 * Production environment config.
 *
 * INTENTIONALLY COMMITTED to git. Every value below is a client-side identifier
 * that's already publicly exposed in the deployed JavaScript bundle — anyone
 * loading https://www.llanotecnica.com can read them in DevTools or curl the
 * main-*.js chunk. They are not "secrets" in the cryptographic sense:
 *
 *   - firebaseConfig.apiKey: Firebase web SDK identifier. Per Firebase docs,
 *     "this is not a security risk... your project's data security is enforced
 *     by Firebase Security Rules, not by hiding the key."
 *   - googleMapsApiKey: Should be HTTP-referer-restricted to llanotecnica.com
 *     in the GCP console (verify in https://console.cloud.google.com/apis/
 *     credentials). Domain restriction is the actual access control.
 *   - recaptcha.siteKey: Public by design — reCAPTCHA's threat model assumes
 *     the site key is visible in the page; security comes from the SECRET key
 *     held by the verifying server.
 *   - contactFormEndpoint: Public Cloud Function URL; rate-limited + reCAPTCHA-
 *     verified server-side.
 *
 * Committing means CI can build without per-build secret injection. If any of
 * these ever needs to be rotated, replace it here, redeploy, and update any
 * GCP/Firebase restrictions accordingly.
 */
export const environment = {
  production: true,
  firebaseConfig: {
    apiKey: "AIzaSyD52IZwee6hLaGJrgsY4vxuJHrmVOnGykY",
    authDomain: "llanotecnica-59a31.firebaseapp.com",
    projectId: "llanotecnica-59a31",
    storageBucket: "llanotecnica-59a31.appspot.com",
    messagingSenderId: "1074323101950",
    appId: "1:1074323101950:web:fdb48169082d0360b02daf",
    measurementId: "G-VQPNJ37TSN"
  },
  googleMapsApiKey: "AIzaSyDCRGZ-Ra5ge911FIwBoUCXpoUcJG1VYGU",
  recaptcha: {
    siteKey: "6LdRYeYqAAAAANM-PRPuJGsG8gOzCLPsa2e2naiO"
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
