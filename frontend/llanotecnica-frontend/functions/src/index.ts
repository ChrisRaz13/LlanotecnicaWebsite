/* eslint-disable valid-jsdoc */
/* eslint-disable max-len */
import {onRequest} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as corsLib from "cors";
import {promisify} from "util";
import {RecaptchaEnterpriseServiceClient} from "@google-cloud/recaptcha-enterprise";
import * as nodemailer from "nodemailer";

// Initialize admin SDK only if it hasn't been initialized yet
if (!admin.apps.length) {
  admin.initializeApp();
}

const corsHandler = promisify(corsLib({origin: true}));

// Initialize Gmail transporter for sending emails
let emailTransporter: nodemailer.Transporter | null = null;

/**
 * Initialize email transporter with Gmail SMTP configuration
 */
function initializeEmailTransporter() {
  try {
    // Use environment variables directly (Firebase Functions v2 approach)
    const gmailUser = process.env.GMAIL_USER || "chrisraz228@gmail.com";
    const gmailPassword = process.env.GMAIL_PASSWORD;

    console.log("🔧 Checking email configuration...");
    console.log("Gmail user:", gmailUser);
    console.log("Gmail user exists:", !!gmailUser);
    console.log("Gmail password exists:", !!gmailPassword);

    if (gmailUser && gmailPassword) {
      console.log("🚀 Initializing Gmail transporter with credentials");
      emailTransporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: gmailUser,
          pass: gmailPassword,
        },
        // Add additional configuration for better reliability
        pool: true,
        maxConnections: 1,
        rateDelta: 20000,
        rateLimit: 5,
        debug: true, // Enable debug logging
        logger: true, // Enable logger
      });

      console.log("✅ Gmail transporter initialized successfully");
    } else {
      console.error("❌ Gmail configuration missing");
      console.error("Gmail user:", gmailUser);
      console.error("Gmail password exists:", !!gmailPassword);
      emailTransporter = null;
    }
  } catch (error) {
    console.error("❌ Error initializing Gmail transporter:", error);
    emailTransporter = null;
  }
}

// Initialize email transporter
initializeEmailTransporter();

// Initialize reCAPTCHA client with default credentials (Firebase Functions v2)
let recaptchaClient: RecaptchaEnterpriseServiceClient;
try {
  console.log("Initializing RecaptchaEnterpriseServiceClient with default credentials");
  recaptchaClient = new RecaptchaEnterpriseServiceClient();
  console.log("✅ Successfully initialized RecaptchaEnterpriseServiceClient");
} catch (error) {
  console.error("❌ Error initializing RecaptchaEnterpriseServiceClient:", error);
  // Fallback to default credentials
  console.log("Falling back to default credentials");
  recaptchaClient = new RecaptchaEnterpriseServiceClient();
}

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
    console.log(`Starting reCAPTCHA verification for action: ${action}`);
    console.log(`Token length: ${token ? token.length : "token is undefined or null"}`);

    // Get the project ID from the environment
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || "llanotecnica-59a31";
    const siteKey = process.env.RECAPTCHA_SITE_KEY || "6LdRYeYqAAAAANM-PRPuJGsG8gOzCLPsa2e2naiO";

    console.log(`Using project ID: ${projectId}`);
    console.log(`Using site key: ${siteKey}`);

    if (!token) {
      console.error("❌ Token is undefined or null");
      return {
        success: false,
        score: 0,
        error: "Missing token",
      };
    }

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

    console.log("Sending assessment request to reCAPTCHA Enterprise API");

    // Call the reCAPTCHA Enterprise API
    const [assessment] = await recaptchaClient.createAssessment(request);

    console.log("Received assessment response from reCAPTCHA Enterprise API");
    console.log("Token valid:", assessment.tokenProperties?.valid);
    console.log("Risk score:", assessment.riskAnalysis?.score);

    // Check if the token is valid
    if (!assessment.tokenProperties?.valid) {
      // Convert the invalidReason to a string to fix the type error
      const reason = assessment.tokenProperties?.invalidReason ?
        String(assessment.tokenProperties.invalidReason) :
        "Invalid token";

      console.error(`❌ Invalid token: ${reason}`);

      return {
        success: false,
        score: 0,
        error: reason,
      };
    }

    // Handle potential null values and convert types
    const actionValue = assessment.tokenProperties?.action || undefined;
    const score = assessment.riskAnalysis?.score || 0;

    console.log(`✅ Valid token with score: ${score}, action: ${actionValue}`);

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
      score: score,
      action: actionValue,
      timestamp: timestampValue,
    };
  } catch (error) {
    console.error("Error verifying reCAPTCHA token:", error);
    // Log more detailed error information
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return {
      success: false,
      score: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Export sitemap function
export {serveSitemap} from "./sitemap";

export const submitContactForm = onRequest({
  memory: "256MiB",
  region: "us-central1",
  maxInstances: 10,
  secrets: ["GMAIL_USER", "GMAIL_PASSWORD"],
}, async (req, res) => {
  try {
    console.log("Function triggered: submitContactForm");

    // Handle CORS
    await corsHandler(req, res);
    console.log("CORS handled");

    if (req.method === "OPTIONS") {
      console.log("Handling OPTIONS preflight request");
      res.status(204).send("");
      return;
    }

    // Validate HTTP method
    if (req.method !== "POST") {
      console.log(`Invalid method: ${req.method}`);
      res.status(405).json({error: "Method Not Allowed"});
      return;
    }

    console.log("Method validated: POST");

    // Extract and validate request body
    console.log("📥 Extracting request body...");

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

    console.log("📋 Request body extracted successfully");

    console.log("Form data received", {
      name: name ? "provided" : "missing",
      email: email ? "provided" : "missing",
      country: country ? "provided" : "missing",
      inquiryType: inquiryType ? "provided" : "missing",
      recaptchaToken: recaptchaToken ? `provided (length: ${recaptchaToken.length})` : "missing",
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
    console.log("Token first 20 chars:", recaptchaToken.substring(0, 20) + "...");

    // Verify reCAPTCHA Enterprise token
    const recaptchaResult = await verifyRecaptchaToken(recaptchaToken, "contact_form_submit");
    console.log("reCAPTCHA verification result:", {
      success: recaptchaResult.success,
      score: recaptchaResult.score,
      action: recaptchaResult.action,
      error: recaptchaResult.error,
    });

    // Validate reCAPTCHA response
    if (!recaptchaResult.success) {
      console.warn("⚠️ Invalid reCAPTCHA attempt:", recaptchaResult.error);
      res.status(403).json({
        error: "reCAPTCHA verification failed",
        details: recaptchaResult.error || "Unknown reCAPTCHA error",
      });
      return;
    }

    // Check reCAPTCHA score - use a more lenient threshold for better user experience
    const scoreThreshold = 0.3; // Lowered from 0.5 to match environment config
    if (recaptchaResult.score < scoreThreshold) {
      console.warn(`⚠️ Low reCAPTCHA score: ${recaptchaResult.score} (threshold: ${scoreThreshold}):`, recaptchaResult);
      res.status(403).json({
        error: "Security verification failed",
        details: `Score: ${recaptchaResult.score}, Required: ${scoreThreshold}`,
      });
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

    // Send email notification
    if (emailTransporter) {
      try {
        console.log("Sending email notification");

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #333; margin: 0;">New Contact Form Submission</h2>
              <p style="color: #666; margin: 5px 0 0 0;">Llanotecnica Website</p>
            </div>

            <div style="background-color: white; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
              <h3 style="color: #495057; border-bottom: 2px solid #007bff; padding-bottom: 10px;">Contact Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #495057; width: 120px;">Name:</td>
                  <td style="padding: 8px 0; color: #333;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #495057;">Email:</td>
                  <td style="padding: 8px 0; color: #333;">${email}</td>
                </tr>
                ${phone ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #495057;">Phone:</td>
                  <td style="padding: 8px 0; color: #333;">${phone}</td>
                </tr>
                ` : ""}
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #495057;">Country:</td>
                  <td style="padding: 8px 0; color: #333;">${country} (${countryCode})</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #495057;">Inquiry Type:</td>
                  <td style="padding: 8px 0; color: #333;">${inquiryType}</td>
                </tr>
              </table>

              <h3 style="color: #495057; border-bottom: 2px solid #007bff; padding-bottom: 10px; margin-top: 30px;">Message</h3>
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #007bff;">
                <p style="margin: 0; color: #333; line-height: 1.6;">${message.replace(/\n/g, "<br>")}</p>
              </div>

              <h3 style="color: #495057; border-bottom: 2px solid #007bff; padding-bottom: 10px; margin-top: 30px;">Security & Metadata</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #495057; width: 150px;">reCAPTCHA Score:</td>
                  <td style="padding: 8px 0; color: #333;">${recaptchaResult.score.toFixed(2)} (${recaptchaResult.score >= 0.7 ? "High Trust" : recaptchaResult.score >= 0.5 ? "Medium Trust" : "Low Trust"})</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #495057;">Submitted:</td>
                  <td style="padding: 8px 0; color: #333;">${new Date().toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #495057;">IP Address:</td>
                  <td style="padding: 8px 0; color: #333;">${req.ip || "Unknown"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #495057;">User Agent:</td>
                  <td style="padding: 8px 0; color: #333; font-size: 12px;">${req.headers["user-agent"] || "Unknown"}</td>
                </tr>
              </table>
            </div>

            <div style="text-align: center; margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 8px;">
              <p style="margin: 0; color: #666; font-size: 14px;">
                This email was automatically generated from the Llanotecnica website contact form.
              </p>
            </div>
          </div>
        `;

        const mailOptions = {
          from: `"Llanotecnica Website" <${process.env.GMAIL_USER || "chrisraz228@gmail.com"}>`,
          to: ["chrisraz228@gmail.com", "ventas@llanotecnica.com"],
          subject: `New ${inquiryType} Inquiry from ${name} (${country})`,
          html: emailHtml,
          replyTo: email,
        };

        await emailTransporter.sendMail(mailOptions);
        console.log("✅ Email sent successfully to chrisraz228@gmail.com and ventas@llanotecnica.com");
      } catch (emailError) {
        console.error("❌ Failed to send email:", emailError);
        // Don't fail the entire request if email fails
        // The form submission was successful, email is just a notification
      }
    } else {
      console.warn("⚠️ Email transporter not initialized, skipping email notification");
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
