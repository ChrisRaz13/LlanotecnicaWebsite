/* eslint-disable valid-jsdoc */
/* eslint-disable max-len */
import {onRequest} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as corsLib from "cors";
import {promisify} from "util";
import {RecaptchaEnterpriseServiceClient} from "@google-cloud/recaptcha-enterprise";

// Initialize admin SDK only if it hasn't been initialized yet
if (!admin.apps.length) {
  admin.initializeApp();
}

const corsHandler = promisify(corsLib({origin: true}));
const recaptchaClient = new RecaptchaEnterpriseServiceClient();


interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  country: string;
  countryCode: string;
  inquiryType: string;
  message: string;
  recaptchaToken: string;
}

interface MessageData {
  name: string;
  email: string;
  phone: string | null;
  country: string;
  countryCode: string;
  inquiryType: string;
  message: string;
  timestamp: admin.firestore.FieldValue;
  recaptchaData: {
    score: number;
    timestamp?: string;
    action?: string;
  };
  metadata: {
    userAgent: string;
    ipAddress: string;
    submittedAt: string;
    source: string;
  };
}

/**
 * Verifies a reCAPTCHA Enterprise token using Google Cloud reCAPTCHA Enterprise API
 *
 * @param {string} token - The reCAPTCHA Enterprise token to verify
 * @param {string} action - The expected action associated with the token
 * @return {Promise<{success: boolean, score: number, action?: string, timestamp?: string, error?: string}>} Object containing verification results
 */
async function verifyRecaptchaToken(token: string, action: string): Promise<{
  success: boolean;
  score: number;
  action?: string;
  timestamp?: string;
  error?: string;
}> {
  try {
    // Get the project ID from the environment
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || "llanotecnica-59a31";
    const siteKey = process.env.RECAPTCHA_SITE_KEY || "6LdRYeYqAAAAANM-PRPuJGsG8gOzCLPsa2e2naiO";

    const projectName = `projects/${projectId}`;

    // Create assessment request
    const request = {
      parent: projectName,
      assessment: {
        event: {
          token: token,
          siteKey: siteKey,
          expectedAction: action,
        },
      },
    };

    // Call the reCAPTCHA Enterprise API
    const [assessment] = await recaptchaClient.createAssessment(request);

    // Check if the token is valid
    if (!assessment.tokenProperties?.valid) {
      // Convert the invalidReason to a string to fix the type error
      const reason = assessment.tokenProperties?.invalidReason ?
        String(assessment.tokenProperties.invalidReason) :
        "Invalid token";

      return {
        success: false,
        score: 0,
        error: reason,
      };
    }

    // Handle potential null values and convert types
    const actionValue = assessment.tokenProperties?.action || undefined;

    // Convert the timestamp to a string if it exists
    let timestampValue: string | undefined = undefined;
    if (assessment.tokenProperties?.createTime) {
      // Handle different timestamp formats
      if (typeof assessment.tokenProperties.createTime === "string") {
        timestampValue = assessment.tokenProperties.createTime;
      } else if (assessment.tokenProperties.createTime.seconds) {
        // If it's an object with seconds property, convert to ISO string
        const seconds = Number(assessment.tokenProperties.createTime.seconds);
        const nanos = Number(assessment.tokenProperties.createTime.nanos || 0);
        const date = new Date(seconds * 1000 + nanos / 1000000);
        timestampValue = date.toISOString();
      }
    }

    // Return the assessment results
    return {
      success: true,
      score: assessment.riskAnalysis?.score || 0,
      action: actionValue,
      timestamp: timestampValue,
    };
  } catch (error) {
    console.error("Error verifying reCAPTCHA token:", error);
    return {
      success: false,
      score: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export const submitContactForm = onRequest({
  memory: "256MiB",
  region: "us-central1",
  maxInstances: 10,
  // Only use secrets if they are properly configured
  // Comment this out for initial deployment test
  // secrets: ["RECAPTCHA_SECRET"],
}, async (req, res) => {
  try {
    console.log("Function triggered: submitContactForm");

    // Handle CORS
    await corsHandler(req, res);
    console.log("CORS handled");

    // Validate HTTP method
    if (req.method !== "POST") {
      console.log(`Invalid method: ${req.method}`);
      res.status(405).json({error: "Method Not Allowed"});
      return;
    }

    console.log("Method validated: POST");

    // Extract and validate request body
    const {
      name,
      email,
      phone,
      country,
      countryCode,
      inquiryType,
      message,
      recaptchaToken,
    } = req.body as ContactFormData;

    console.log("Form data received", {
      name: name ? "provided" : "missing",
      email: email ? "provided" : "missing",
      country: country ? "provided" : "missing",
      inquiryType: inquiryType ? "provided" : "missing",
    });

    // Validate required fields
    if (!name?.trim() ||
        !email?.trim() ||
        !country?.trim() ||
        !countryCode?.trim() ||
        !inquiryType?.trim() ||
        !message?.trim() ||
        !recaptchaToken) {
      console.warn("Missing required fields in form submission");
      res.status(400).json({error: "Missing or invalid required fields"});
      return;
    }

    console.log("Required fields validated");

    // Validate country code format (ISO 3166-1 alpha-2)
    const countryCodeRegex = /^[A-Z]{2}$/;
    if (!countryCodeRegex.test(countryCode)) {
      console.log(`Invalid country code: ${countryCode}`);
      res.status(400).json({error: "Invalid country code format"});
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log(`Invalid email: ${email}`);
      res.status(400).json({error: "Invalid email format"});
      return;
    }

    // Validate phone format if provided
    if (phone) {
      const phoneRegex = /^\+?[\d\s-]{10,}$/;
      if (!phoneRegex.test(phone)) {
        console.log(`Invalid phone: ${phone}`);
        res.status(400).json({error: "Invalid phone number format"});
        return;
      }
    }

    console.log("Form validation complete, verifying reCAPTCHA");

    // Verify reCAPTCHA Enterprise token
    const recaptchaResult = await verifyRecaptchaToken(recaptchaToken, "contact_form_submit");
    console.log("reCAPTCHA verification result:", recaptchaResult);

    // Validate reCAPTCHA response
    if (!recaptchaResult.success) {
      console.warn("⚠️ Invalid reCAPTCHA attempt:", recaptchaResult.error);
      res.status(403).json({error: "Invalid reCAPTCHA"});
      return;
    }

    // Check reCAPTCHA score
    if (recaptchaResult.score < 0.5) {
      console.warn("⚠️ Suspicious activity detected:", recaptchaResult);
      res.status(403).json({error: "Suspicious activity detected"});
      return;
    }

    console.log("reCAPTCHA verification passed with score:", recaptchaResult.score);

    // Prepare message data
    const messageData: MessageData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : null,
      country: country.trim(),
      countryCode: countryCode.trim(),
      inquiryType: inquiryType.trim(),
      message: message.trim(),
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      recaptchaData: {
        score: recaptchaResult.score,
        timestamp: recaptchaResult.timestamp,
        action: recaptchaResult.action,
      },
      metadata: {
        userAgent: req.headers["user-agent"] || "Unknown",
        ipAddress: req.ip || "Unknown",
        submittedAt: new Date().toISOString(),
        source: req.headers["origin"] || "Unknown",
      },
    };

    // Save to Firestore with error handling
    try {
      console.log("Saving message to Firestore");
      await admin.firestore()
        .collection("contactMessages")
        .add(messageData);
      console.log("Message saved successfully to Firestore");
    } catch (firestoreError) {
      console.error("❌ Firestore save failed:", firestoreError);
      res.status(500).json({error: "Failed to save message"});
      return;
    }

    // Send success response
    console.log("Form submission complete, sending success response");
    res.status(200).json({
      message: "Form submitted successfully!",
      recaptchaScore: recaptchaResult.score,
    });
  } catch (err) {
    // Error handling
    const error = err as Error;
    console.error("🔥 Error submitting contact form:", error.message, error.stack);
    res.status(500).json({error: "Internal Server Error"});
  }
});
