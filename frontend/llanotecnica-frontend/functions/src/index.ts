/* eslint-disable max-len */
import {onRequest} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import {fetch} from "undici";

admin.initializeApp();

interface RecaptchaResponse {
  success: boolean;
  score: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
}

export const submitContactForm = onRequest({
  memory: "256MiB",
  region: "us-central1",
  maxInstances: 10,
}, async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({error: "Method Not Allowed"});
    return;
  }

  try {
    const {name, email, phone, inquiryType, message, recaptchaToken} = req.body as {
      name: string;
      email: string;
      phone?: string;
      inquiryType: string;
      message: string;
      recaptchaToken: string;
    };

    if (!name || !email || !inquiryType || !message || !recaptchaToken) {
      res.status(400).json({error: "Missing required fields"});
      return;
    }

    const recaptchaSecret = process.env.RECAPTCHA_SECRET || "6LdIxNAqAAAAAEuN6hwbagNQi4H8AcQo2-Wcy-SW";

    // Verify reCAPTCHA Token
    const recaptchaResponse = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${recaptchaToken}`,
      {method: "POST"}
    );
    const recaptchaData = await recaptchaResponse.json() as RecaptchaResponse;

    if (!recaptchaData.success) {
      res.status(403).json({error: "Invalid reCAPTCHA"});
      return;
    }

    // Optional: Add score threshold check
    if (recaptchaData.score < 0.5) {
      res.status(403).json({error: "Suspicious activity detected"});
      return;
    }

    // Save to Firestore with reCAPTCHA data
    await admin.firestore().collection("contactMessages").add({
      name,
      email,
      phone: phone || null,
      inquiryType,
      message,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      recaptchaData: {
        score: recaptchaData.score,
        timestamp: recaptchaData.challenge_ts,
        action: recaptchaData.action,
      },
    });

    res.status(200).json({
      message: "Form submitted successfully!",
      recaptchaScore: recaptchaData.score,
    });
  } catch (error) {
    console.error("🔥 Error submitting contact form:", error);
    res.status(500).json({error: "Internal Server Error"});
  }
});
