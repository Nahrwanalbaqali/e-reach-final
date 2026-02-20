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

    // Setup the email sender (Explicit Gmail Settings)
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // true for port 465
        auth: {
            user: process.env.EMAIL_USER, // Your dummy @gmail.com address
            pass: process.env.EMAIL_PASS  // The 16-letter App Password (no spaces)
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER, // Sent by Dummy Gmail
        to: 'Team@ereach.education',  // RECEIVED by Client (They see this!)
        replyTo: req.body.email,      // Hitting "Reply" goes to the Student
        subject: `New Request: ${req.body.subject || 'Consultation Booking'}`,
        text: `...` // (Your existing text code)
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