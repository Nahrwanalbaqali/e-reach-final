const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the other pages explicitly (fixes 404s)
app.get('/contact.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'contact.html')));
app.get('/services.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'services.html')));
app.get('/privacy.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'privacy.html')));
app.get('/terms.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'terms.html')));

// Handle the Contact Form
app.post('/contact', (req, res) => {
    console.log("Form received! Processing...");

    // Setup the email sender (Using Brevo Relay to bypass Microsoft Block)
    const transporter = nodemailer.createTransport({
        host: "smtp-relay.brevo.com",  // The new "Door"
        port: 2525,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        // These settings help ensure delivery
        tls: {
            rejectUnauthorized: false
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER, // The Brevo login
        to: 'Team@ereach.education', // Where YOU receive the alerts
        replyTo: req.body.email, // <--- ADD THIS LINE! (Lets you hit "Reply" to the student)
        subject: `New Request: ${req.body.subject || 'Consultation Booking'}`,
        text: `
            Name: ${req.body.name}
            Email: ${req.body.email}
            Phone: ${req.body.phone}
            Service: ${req.body.service || 'N/A'}
            Message: ${req.body.message || req.body.notes}
        `
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Email Failed:", error); // Shows the real error in Render logs
            // Reply with JSON so the frontend doesn't crash
            res.status(500).json({ success: false, error: error.message });
        } else {
            console.log('Email sent successfully!');
            res.json({ success: true });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});