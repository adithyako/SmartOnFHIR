const express = require("express"); /* Accessing express module */
const app = express(); /* app is a request handler function */
const bodyParser = require("body-parser"); /* To handle post parameters */
const portNumber = 3000;
const path = require("path");

const smart = require("fhirclient");
const session = require("express-session");

// The SMART state is stored in a session. If you want to clear your session
// and start over, you will have to delete your "connect.sid" cookie!
app.use(session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false
}));

// The settings that we use to connect to our SMART on FHIR server
const smartSettings = {
    clientId: "eec22f7e-5014-4b7c-98a1-178c505da56c",
    redirectUri: "https://smartonfhir.onrender.com/app",
    scope: "launch/patient openid fhirUser patient/*.read Questionnaire.Read Questionnaire.Search QuestionnaireResponse.Read QuestionnaireResponse.Search Patient.Read Patient.Search",
    iss: "https://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImIiOiJzbWFydC03Nzc3NzA1In0/fhir"
};

/* Module for file reading */
const fs = require("fs");

app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");

/* Initializes request.body with post information */
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/public', express.static('public'));

app.listen(portNumber);
console.log(`Web server started and running at https://smartonfhir.onrender.com/index`);

process.stdin.setEncoding("utf8");

if (process.argv.length != 3) {
    process.stdout.write(`Usage Questionnaire.js jsonFile`);
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
    if (req.session.smartToken) {
        return next();
    }
    res.redirect('/launch');
}

app.get('/launch', (req, res) => {

    let str = `<script>FHIR.oauth2.authorize({${smartSettings}});</script>`;
    const variables = {settings: str}
    res.render('launch', variables);
});

app.get('/index', (req, res) => {
    res.render('index');
});

app.get("/app", (req, res) => {
    smart(req, res).ready().then(client => handler(client, res));
    const variables = { formToAdd: jsonList };
    res.render("form", variables);
});

app.post("/submit-questionnaire", ensureAuthenticated, (req, res) => {
    const questionnaireResponse = req.body;
    req.session.lastQuestionnaireResponse = questionnaireResponse;
    res.json({ message: "QuestionnaireResponse received successfully" });
});

app.get('/view-response', ensureAuthenticated, (req, res) => {
    const lastQuestionnaireResponse = req.session.lastQuestionnaireResponse || {};
    res.render('view-response', { lastQuestionnaireResponse });
});