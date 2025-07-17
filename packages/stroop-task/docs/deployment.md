# Deployment Guide

## Overview

This guide covers various deployment options for the Stroop task timeline, including local development, web hosting, and specialized platforms like Pavlovia. Each deployment method has specific requirements and considerations.

## Local Development

### Setup Requirements

#### Prerequisites
- Node.js (v14 or later)
- npm or yarn package manager
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Code editor (VS Code, WebStorm, etc.)

#### Basic Setup
```bash
# Initialize project
npm init -y

# Install dependencies
npm install jspsych @jspsych/stroop-task

# Install additional jsPsych plugins if needed
npm install @jspsych/plugin-html-keyboard-response
npm install @jspsych/plugin-html-button-response
npm install @jspsych/plugin-instructions
```

### Local Development Server

#### Using Node.js HTTP Server
```bash
# Install global server
npm install -g http-server

# Start server in project directory
http-server -p 8080

# Access at http://localhost:8080
```

#### Using Python Server
```bash
# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

#### Using VS Code Live Server
1. Install Live Server extension
2. Right-click HTML file
3. Select "Open with Live Server"

### Project Structure
```
stroop-experiment/
├── index.html
├── experiment.js
├── style.css
├── package.json
└── data/
    └── (experiment data files)
```

### Basic HTML Template
```html
<!DOCTYPE html>
<html>
<head>
    <title>Stroop Task</title>
    <script src="https://unpkg.com/jspsych@8.0.0"></script>
    <script src="https://unpkg.com/@jspsych/stroop-task@latest"></script>
    <link href="https://unpkg.com/jspsych@8.0.0/css/jspsych.css" rel="stylesheet">
    <link href="style.css" rel="stylesheet">
</head>
<body>
    <script src="experiment.js"></script>
</body>
</html>
```

## Web Hosting

### Static Site Hosting

#### GitHub Pages
1. **Create Repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/username/stroop-experiment.git
   git push -u origin main
   ```

2. **Enable GitHub Pages:**
   - Go to repository Settings
   - Scroll to Pages section
   - Select source branch (main)
   - Access at `https://username.github.io/stroop-experiment`

3. **Custom Domain (Optional):**
   - Add CNAME file with domain name
   - Configure DNS settings
   - Enable HTTPS in settings

### Content Delivery Networks (CDN)

#### Using CDN for jsPsych
```html
<!-- jsPsych core -->
<script src="https://unpkg.com/jspsych@8.0.0/dist/index.browser.min.js"></script>

<!-- Stroop task timeline -->
<script src="https://unpkg.com/@jspsych/stroop-task@latest/dist/index.browser.min.js"></script>

<!-- CSS -->
<link href="https://unpkg.com/jspsych@8.0.0/css/jspsych.css" rel="stylesheet">
```

#### Benefits of CDN
- Faster loading times
- Reduced server load
- Automatic caching
- Global distribution

## Pavlovia Deployment

### Platform Overview
Pavlovia is a specialized platform for psychological experiments, offering:
- GitLab-based version control
- Participant recruitment
- Data collection and storage
- Credit-based pricing system

### Setup Process

#### 1. Account Creation
- Register at pavlovia.org
- Purchase credits for data collection
- Set up GitLab integration

#### 2. Project Structure
```
pavlovia-project/
├── index.html
├── experiment.js
├── style.css
├── lib/
│   ├── jspsych/
│   └── stroop-task/
└── data/
```

#### 3. Configuration File
```javascript
// pavlovia-config.js
const pavlovia = new core.ServerManager({
    psychoJS: psychoJS,
    debug: false
});

// Initialize experiment
psychoJS.start({
    expName: 'stroop-task',
    expInfo: {'participant': '', 'session': '001'},
    resources: []
});
```

#### 4. Data Handling
```javascript
// Configure data saving
psychoJS.experiment.addData('stroop_data', jsPsych.data.get().csv());

// Finish experiment
psychoJS.quit({
    message: 'Thank you for your participation!',
    isCompleted: true
});
```

## Server-Based Deployment

### Node.js/Express Server

#### Basic Server Setup
```javascript
// server.js
const express = require('express');
const path = require('path');
const app = express();

// Serve static files
app.use(express.static('public'));

// Handle data submission
app.post('/submit-data', (req, res) => {
    // Process experiment data
    const data = req.body;
    
    // Save to database or file
    saveData(data);
    
    res.json({ success: true });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
```

#### Database Integration
```javascript
// MongoDB example
const mongoose = require('mongoose');

const ExperimentSchema = new mongoose.Schema({
    participant_id: String,
    trial_data: Object,
    timestamp: { type: Date, default: Date.now }
});

const ExperimentData = mongoose.model('ExperimentData', ExperimentSchema);

// Save data function
function saveData(data) {
    const experiment = new ExperimentData(data);
    experiment.save();
}
```

## Mobile Deployment

### Responsive Design Considerations

#### CSS Modifications
```css
/* Mobile-friendly styles */
@media (max-width: 768px) {
    .jspsych-btn {
        min-height: 60px;
        min-width: 120px;
        font-size: 18px;
        margin: 10px;
    }
    
    .jspsych-display-element {
        padding: 20px;
    }
    
    .stimulus {
        font-size: 36px;
    }
}
```

#### Touch Event Handling
```javascript
// Ensure touch events work properly
createTimeline(jsPsych, {
    number_of_rows: 4,
    number_of_columns: 1, // Vertical layout for mobile
    button_html: (choice) => `
        <button class="mobile-btn" ontouchstart="">
            ${choice}
        </button>
    `
});
```

## Security Considerations

### Data Protection

#### HTTPS Deployment
- Always use HTTPS for data collection
- Obtain SSL certificate
- Configure proper headers

#### Data Encryption
```javascript
// Client-side encryption (basic example)
function encryptData(data) {
    return btoa(JSON.stringify(data));
}

// Server-side decryption
function decryptData(encryptedData) {
    return JSON.parse(atob(encryptedData));
}
```

## Performance Optimization

### Loading Optimization

#### Lazy Loading
```javascript
// Load components only when needed
async function loadStroopTask() {
    const { createTimeline } = await import('@jspsych/stroop-task');
    return createTimeline;
}
```

#### Resource Preloading
```html
<!-- Preload critical resources -->
<link rel="preload" href="jspsych.css" as="style">
<link rel="preload" href="experiment.js" as="script">
```

### Caching Strategies

#### Cache Headers
```javascript
// Express.js caching
app.use(express.static('public', {
    maxAge: '1d',
    etag: true
}));
```

#### Browser Caching
```html
<!-- Cache control meta tags -->
<meta http-equiv="Cache-Control" content="max-age=86400">
<meta http-equiv="Expires" content="Thu, 01 Jan 2025 00:00:00 GMT">
```

This comprehensive deployment guide covers all major deployment scenarios for the Stroop task timeline, from local development to production deployment across various platforms and environments.