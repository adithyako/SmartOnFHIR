require('dotenv').config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const portNumber = process.env.PORT || 3000;
const path = require("path");
const smart = require("fhirclient");
const session = require("express-session");
const fetch = require('node-fetch');
const fs = require("fs");

// Serve static files from the 'public' directory
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false
}));

app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(portNumber, () => {
    console.log(`Web server started and running at https://smartonfhir.onrender.com/index`);});

process.stdin.setEncoding("utf8");

if (process.argv.length != 3) {
    process.stdout.write(`Usage: questionnaire.js jsonFile\n`);
    process.exit(1);
}

const listName = process.argv[2];
let jsonList;

try {
    jsonList = fs.readFileSync(listName, "utf-8");
} catch (error) {
    console.error("Error reading JSON file:", error);
    process.exit(1);
}

const prompt = "Type stop to shutdown the server: ";
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

function ensureAuthenticated(req, res, next) {
    const token = req.session.accessToken;
    if (!token) {
        return res.status(401).redirect('/launch');
    }
    next();
}

app.get('/launch', (req, res) => {
    res.render('launch');
});

app.get('/index', (req, res) => {
    res.render('index');
});

app.get("/app", ensureAuthenticated, (req, res) => {
    smart(req, res).ready().then(client => {
        const variables = { formToAdd: jsonList };
        res.render("form", variables);
    }).catch(err => {
        console.error("Error initializing SMART client:", err);
        res.status(500).send("Error initializing SMART client");
    });
});

app.post("/save-response", ensureAuthenticated, (req, res) => {
    if (!req.body || !req.body.data) {
        console.error('No data received', req.body);
        return res.status(400).json({ message: "No data provided" });
    }
    try {
        const { data, format } = req.body;
        console.log(`Received data for format: ${format}`, data);
        // Assume data is saved here
        res.json({ status: 'success', message: "Response saved successfully" });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ message: "Failed to save the data", error: error.toString() });
    }
});

app.get("/get-saved-responses", ensureAuthenticated, (req, res) => {
    // Assume you retrieve from a database or session
    res.json(savedResponses);
});

app.get('/formselector', ensureAuthenticated, (req, res) => {
    res.render("formselection");
});
