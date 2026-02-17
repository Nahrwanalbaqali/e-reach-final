require('dotenv').config(); // 1. Load secrets from .env file
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

// 2. Use a dynamic PORT provided by the hosting service
const PORT = process.env.PORT || 5000;

// ===========================
//  GODADDY EMAIL CONFIGURATION
// ===========================
const transporter = nodemailer.createTransport({
    host: "smtpout.secureserver.net",
    port: 465,
    secure: true,
    auth: {
        // 3. Use secrets instead of typing your password here
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ===========================
//       PAGE ROUTES
// ===========================
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.get("/index.html", (req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.get("/contact.html", (req, res) => res.sendFile(path.join(__dirname, "contact.html")));
app.get("/services.html", (req, res) => res.sendFile(path.join(__dirname, "services.html")));
app.get("/privacy.html", (req, res) => res.sendFile(path.join(__dirname, "privacy.html")));

// ===========================
//    CONTACT FORM ROUTE
// ===========================
app.post("/contact", (req, res) => {
    const { name, email, phone, subject, message, consent } = req.body;

    const mailOptions = {
        from: `"Website Booking" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        replyTo: email,
        subject: `New Consultation: ${name} - ${subject}`,
        text: `
        🚀 NEW BOOKING RECEIVED!
        ------------------------
        Name: ${name}
        Phone: ${phone}
        Email: ${email}
        Subject: ${subject}
        Consent Given: ${consent ? "Yes" : "No"}
        
        Message:
        ${message}
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log("Error sending email:", error);
            return res.status(500).json({ success: false, error: "Email failed" });
        } else {
            console.log("Email sent: " + info.response);
            res.json({ success: true });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});