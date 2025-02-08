/* eslint-disable max-len */
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {fetch} from "undici"; // ✅ Use Node.js fetch

admin.initializeApp();

// ✅ Define a proper interface for reCAPTCHA response
interface RecaptchaResponse{
  success:boolean;
  challenge_ts?:string;
  hostname?:string;
  "error-codes"?:string[];
}

export const submitContactForm=functions.https.onRequest(async (req, res):Promise<void>=>{
  if (req.method!=="POST") {
    res.status(405).json({error: "Method Not Allowed"});
    return;
  }

  try {
    const {name, email, phone, inquiryType, message, recaptchaToken}=req.body as{
      name:string;
      email:string;
      phone?:string;
      inquiryType:string;
      message:string;
      recaptchaToken:string;
    };

    if (!name||!email||!inquiryType||!message||!recaptchaToken) {
      res.status(400).json({error: "Missing required fields"});
      return;
    }

    // ✅ Fix: Use a direct variable if `functions.config()` doesn't work
    const recaptchaSecret=process.env.RECAPTCHA_SECRET||"6LdIxNAqAAAAAEuN6hwbagNQi4H8AcQo2-Wcy-SW";

    // ✅ Verify reCAPTCHA Token
    const recaptchaResponse=await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${recaptchaToken}`,
      {method: "POST"}
    );
    const recaptchaData=await recaptchaResponse.json() as RecaptchaResponse;

    if (!recaptchaData.success) {
      res.status(403).json({error: "Invalid reCAPTCHA"});
      return;
    }

    // ✅ Save to Firestore
    await admin.firestore().collection("contactMessages").add({
      name,
      email,
      phone: phone||null,
      inquiryType,
      message,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({message: "Form submitted successfully!"});
  } catch (error) {
    console.error("🔥 Error submitting contact form:", error);
    res.status(500).json({error: "Internal Server Error"});
  }
});
