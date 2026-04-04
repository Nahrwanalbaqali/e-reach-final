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

// Safely expose the Apple Pay verification folder to the internet
app.use('/.well-known', express.static(path.join(__dirname, '.well-known')));

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the other pages explicitly
app.get('/contact.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'contact.html')));
app.get('/services.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'services.html')));
app.get('/privacy.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'privacy.html')));
app.get('/terms.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'terms.html')));
app.get('/founders.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'founders.html')));
app.get('/refund.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'refund.html'))); // Added refund!

// Handle the Contact Form
app.post('/contact', async (req, res) => {
    console.log("Form received! Processing...");
    try {
        const response = await fetch('https://formsubmit.co/ajax/team@ereach.education', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                _subject: `New Website Lead: ${req.body.name}`,
                _replyto: req.body.email,
                Name: req.body.name,
                Email: req.body.email,
                Phone: req.body.phone,
                Service: req.body.service || 'N/A',
                Message: req.body.message || req.body.notes
            })
        });

        const data = await response.json();

        if (data.success === "true" || data.success === true) {
            res.status(200).json({ message: 'Message sent successfully!' });
        } else {
            res.status(500).json({ message: 'Failed to send' });
        }
    } catch (error) {
        console.error("Fetch error:", error);
        res.status(500).json({ message: 'Failed to send due to network error' });
    }
});

// --- NEW: TAP PAYMENTS CHECKOUT ROUTE ---
app.post('/create-payment', async (req, res) => {
    console.log("Creating Tap Checkout Session...");

    try {
        // We ping Tap's official Charges API
        const response = await fetch('https://api.tap.company/v2/charges', {
            method: 'POST',
            headers: {
                // This grabs your secret key from Render's Environment Variables
                'Authorization': `Bearer ${process.env.TAP_SECRET_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                "amount": req.body.amount || 20, // Default to 20 BHD
                "currency": "BHD",
                "customer": {
                    "first_name": req.body.name || "Student",
                    "email": req.body.email || "student@ereach.education"
                },
                "source": { "id": "src_all" }, // Gives them BenefitPay, Apple Pay, & Cards!
                "redirect": { "url": "https://ereach.education/services.html" } // Where they go after paying
            })
        });

        const data = await response.json();

        // If Tap gives us the URL, send it to the frontend!
        if (data && data.transaction && data.transaction.url) {
            res.status(200).json({ checkoutUrl: data.transaction.url });
        } else {
            console.error("Tap API Error:", data);
            res.status(500).json({ message: 'Failed to generate payment link' });
        }
    } catch (error) {
        console.error("Payment error:", error);
        res.status(500).json({ message: 'Network error communicating with bank' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});