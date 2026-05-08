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
  recaptcha: {
    siteKey: "6LdRYeYqAAAAANM-PRPuJGsG8gOzCLPsa2e2naiO"
  },
  contactFormEndpoint: "https://submitcontactform-5xabx4u37q-uc.a.run.app",
  logLevel: 'debug',
  reCaptchaThreshold: 0.3,
  maxRetries: 5,
  api: {
    contact: {
      submitForm: "https://submitcontactform-5xabx4u37q-uc.a.run.app",
      timeout: 60000
    }
  },
  features: {
    enableGoogleMaps: true,
    enableRecaptcha: true,
    enableContactForm: true
  }
};
