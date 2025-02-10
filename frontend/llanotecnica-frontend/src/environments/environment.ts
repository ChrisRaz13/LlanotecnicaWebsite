export const environment = {
  production: false,
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
  recaptchaSiteKey: "6LdIxNAqAAAAABJ1qk8u28KgSy86pJcl-mvlkAzo",
  contactFormEndpoint: "https://us-central1-llanotecnica-59a31.cloudfunctions.net/submitContactForm",

  // Development-specific configuration
  logLevel: 'debug', // More verbose logging for development
  reCaptchaThreshold: 0.3, // Lower threshold for testing
  maxRetries: 5, // More retries for testing

  // API endpoints
  api: {
    contact: {
      submitForm: "https://us-central1-llanotecnica-59a31.cloudfunctions.net/submitContactForm",
      timeout: 60000 // Longer timeout for development
    }
  },

  // Feature flags
  features: {
    enableGoogleMaps: true,
    enableRecaptcha: true,
    enableContactForm: true
  }
};
