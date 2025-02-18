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
    siteKey: "6LfTlNcqAAAAAPyLOGeMEbyvZTYwwDD23VvoRFiK"
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
