require('dotenv').config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const portNumber = 3000;
const path = require("path");
const smart = require("fhirclient");
const session = require("express-session");
const fetch = require('node-fetch');
const fs = require("fs");

app.use(session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false
}));

app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/public', express.static('public'));

app.listen(portNumber, () => {
    console.log(`Web server started and running at https://smartonfhir.onrender.com/index`);
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

app.get("/app", (req, res) => {
    smart(req, res).ready().then(client => {
        req.session.accessToken = client.state.tokenResponse.access_token;
        const variables = { formToAdd: jsonList };
        res.render("form", variables);
    }).catch(error => {
        console.error('Error during OAuth callback:', error);
        res.status(500).send('Authentication failed');
    });
});

app.post("/submit-questionnaire", ensureAuthenticated, (req, res) => {
    const questionnaireResponse = req.body;
    req.session.lastQuestionnaireResponse = questionnaireResponse; // Store the response in the session for now
    res.json({ message: "QuestionnaireResponse received successfully", data: questionnaireResponse });
});

app.get('/responses', ensureAuthenticated, (req, res) => {
    res.render('responseList', { responses: req.session.lastQuestionnaireResponse });
});

app.get('/formselector', ensureAuthenticated, (req, res) => {
    res.render("formselection");
});
