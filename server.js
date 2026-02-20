const express = require('express');
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

// Handle the Contact Form (Notice the 'async' keyword added here!)
app.post('/contact', async (req, res) => {
    console.log("Form received! Processing...");

    try {
        // Send email via FormSubmit HTTP API (Bypasses Render's firewall entirely)
        const response = await fetch('https://formsubmit.co/ajax/team@ereach.education', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                _subject: `New Website Lead: ${req.body.name}`, // The email subject
                _replyto: req.body.email, // Lets the client hit "Reply" to the student
                Name: req.body.name,
                Email: req.body.email,
                Phone: req.body.phone,
                Service: req.body.service || 'N/A',
                Message: req.body.message || req.body.notes
            })
        });

        const data = await response.json();

        // Tell the frontend it worked!
        if (data.success === "true" || data.success === true) {
            res.status(200).json({ message: 'Message sent successfully!' });
        } else {
            res.status(500).json({ message: 'Failed to send' });
        }
    } catch (error) {
        // This catches any weird network errors so your server doesn't crash
        console.error("Fetch error:", error);
        res.status(500).json({ message: 'Failed to send due to network error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});