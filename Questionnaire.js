require('dotenv').config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Allowing requests from your React development server, adjust as necessary for production
app.use(cors({
    origin: 'https://localhost:3000'   // Add your production URL here
}));

// Configure session management
app.use(session({
    secret: process.env.SESSION_SECRET, // Use the session secret from environment variable
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true } // Ensure secure cookies in production, adjust as necessary
}));

// Serve static files from the React app build directory
app.use(express.static(path.join(/Users/sooryarajendran/smart-on-fhir, 'build')));

// Parse JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes for handling OAuth with Epic on FHIR
app.get("/app", async (req, res) => {
    const { code } = req.query;
    if (!code) {
        return res.status(400).send('Authorization code is missing');
    }
    try {
        const tokenResponse = await axios.post('https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token', null, {
            params: {
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: `${req.protocol}://${req.get('host')}/app`
            },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        req.session.accessToken = tokenResponse.data.access_token;
        res.json({ accessToken: tokenResponse.data.access_token }); // Respond with the access token
    } catch (error) {
        console.error('Error handling /app route:', error.message);
        res.status(500).send('Server error');
    }
});

app.post("/save-response", (req, res) => {
    console.log('Response saved:', req.body);
    res.json({ status: 'success', message: "Response saved successfully" });
});

// Serve the index.html for all other routes to support SPA
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Example API endpoint
app.get("/api/data", (req, res) => {
    res.json({ message: "This is your data." });
});

// Command line interface to interact with the server
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});
readline.setPrompt("Type 'stop' to shutdown the server: ");
readline.prompt();
readline.on("line", function(line) {
    if (line.trim() === "stop") {
        console.log("Shutting down the server");
        process.exit(0);
    } else {
        console.log(`Invalid command: ${line}`);
        readline.prompt();
    }
});


/*require('dotenv').config();
const express = require("express");
const app = express();
const path = require("path");
const smart = require("fhirclient");
const session = require("express-session");
const fetch = require('node-fetch');
const fs = require("fs");
const axios = require('axios');

const PORT = process.env.PORT || 3000;

app.use(session({
    secret: "Vhnbr3ABsCfjyVOLPclpXKd9ZvI47ylERFOht5kfZ8sdn0uBiXL2G3sGYd+M5tT98x/ECUabKnKBFXRpKxKp2Q==",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true } // use secure: true in production
}));


// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handles any requests that don't match the ones above
app.get('/*', function(req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});





process.stdin.setEncoding("utf8");

if (process.argv.length != 3) {
    process.stdout.write(`Usage: questionnaire.js jsonFile\n`);
    process.exit(1);
}

const listName = process.argv[2];
const prompt = "Type stop to shutdown the server: ";
const jsonList = fs.readFileSync(listName, "utf-8");

process.stdout.write(prompt);
process.stdin.on("readable", function () {
    const dataInput = process.stdin.read();
    if (dataInput !== null) {
        const command = dataInput.trim();
        if (command === "stop") {
            process.stdout.write("Shutting down the server\n");
            process.exit(0);
        } else {
            process.stdout.write("Invalid command: " + command + "\n");
        }
        process.stdout.write(prompt);
        process.stdin.resume();
    }
});

app.get('/launch', (req, res) => {
    res.render('launch');
});

app.get('/index', (req, res) => {
    res.render('index');
});

app.get("/app", async (req, res) => {
    const code = req.query.code;
    const redirectUri = 'https://smartonfhir.onrender.com/app';

    if (!code) {
        return res.status(400).send('Authorization code is missing');
    }

    try {
        const tokenResponse = await axios.post('https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token', null, {
            params: {
                client_id: 'a3ca143a-635b-463a-9371-176c16f4e966',
                client_secret: 'v9f2tXGC/fcqMFfIdzMOWY1656C//q6LXG++3Z/e4PiQMbqn4kMN27XoJY+ZOdedD0U2R2XXM+ejJ6GT7f4EVg==',
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectUri
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        // Store the access token in the session
        req.session.accessToken = tokenResponse.data.access_token;

        // Proceed with your existing logic
        // const client = smart(req, res).ready(); // Ensure this function returns the necessary client
        // const handlerResponse = await handler(client, res);
        const variables = { formToAdd: jsonList, accessToken: tokenResponse.data.access_token };

        res.render("form", variables);

    } catch (error) {
        const variables = { formToAdd: jsonList};
        res.render("form", variables);
    }
});

app.post("/save-response", (req, res) => {
    // Assume you have a method to save to a database or session
    const response = req.body; // This should be extended to include more details
    savedResponses.push(response); // Example saving mechanism
    res.json({ status: 'success', message: "Response saved successfully" });
});
*/



