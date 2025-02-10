/* eslint-disable max-len */
import {onRequest} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import {fetch} from "undici";
import * as corsLib from "cors";
import {promisify} from "util";

admin.initializeApp();

const corsHandler = promisify(corsLib({origin: true}));

interface RecaptchaResponse {
  success: boolean;
  score: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
}

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  inquiryType: string;
  message: string;
  recaptchaToken: string;
}

export const submitContactForm = onRequest({
  memory: "256MiB",
  region: "us-central1",
  maxInstances: 10,
  secrets: ["RECAPTCHA_SECRET"],
}, async (req, res) => {
  try {
    // Handle CORS
    await corsHandler(req, res);

    // Validate HTTP method
    if (req.method !== "POST") {
      res.status(405).json({error: "Method Not Allowed"});
      return;
    }

    // Extract and validate request body
    const {
      name,
      email,
      phone,
      inquiryType,
      message,
      recaptchaToken,
    } = req.body as ContactFormData;

    // Validate required fields
    if (!name?.trim() || !email?.trim() || !inquiryType?.trim() || !message?.trim() || !recaptchaToken) {
      res.status(400).json({error: "Missing or invalid required fields"});
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({error: "Invalid email format"});
      return;
    }

    // Check for reCAPTCHA secret
    const recaptchaSecret = process.env.RECAPTCHA_SECRET;
    if (!recaptchaSecret) {
      console.error("❌ Missing RECAPTCHA_SECRET in environment variables");
      res.status(500).json({error: "Server configuration error"});
      return;
    }

    // Verify reCAPTCHA token
    const recaptchaResponse = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${recaptchaToken}`,
      {method: "POST"},
    );

    if (!recaptchaResponse.ok) {
      console.error("❌ reCAPTCHA verification request failed:", await recaptchaResponse.text());
      res.status(500).json({error: "reCAPTCHA verification failed"});
      return;
    }

    const recaptchaData = await recaptchaResponse.json() as RecaptchaResponse;

    // Validate reCAPTCHA response
    if (!recaptchaData.success) {
      console.warn("⚠️ Invalid reCAPTCHA attempt:", recaptchaData);
      res.status(403).json({error: "Invalid reCAPTCHA"});
      return;
    }

    // Check reCAPTCHA score
    if (recaptchaData.score < 0.5) {
      console.warn("⚠️ Suspicious activity detected:", recaptchaData);
      res.status(403).json({error: "Suspicious activity detected"});
      return;
    }

    // Prepare message data
    const messageData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : null,
      inquiryType: inquiryType.trim(),
      message: message.trim(),
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      recaptchaData: {
        score: recaptchaData.score,
        timestamp: recaptchaData.challenge_ts,
        action: recaptchaData.action,
      },
      metadata: {
        userAgent: req.headers["user-agent"] || "Unknown",
        ipAddress: req.ip || "Unknown",
        submittedAt: new Date().toISOString(),
        source: req.headers["origin"] || "Unknown",
      },
    };

    // Save to Firestore
    await admin.firestore()
      .collection("contactMessages")
      .add(messageData);

    // Send success response
    res.status(200).json({
      message: "Form submitted successfully!",
      recaptchaScore: recaptchaData.score,
    });
  } catch (err) {
    // Error handling
    const error = err as Error;
    console.error("🔥 Error submitting contact form:", error.message, error.stack);
    res.status(500).json({error: "Internal Server Error"});
  }
});
