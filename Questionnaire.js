require('dotenv').config();
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
    // iss: "https://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImIiOiJzbWFydC03Nzc3NzA1In0/fhir"
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
    const token = req.cookies['accessToken'];
    if (!token) {
        return res.status(401).redirect('/launch');
    }
    next();
}


/*
function ensureAuthenticated(req, res, next) {
    if (req.session.smartToken) {
        return next();
    }
    res.redirect('/launch');
}
*/
app.get('/launch', (req, res) => {
    // let str = `<script>FHIR.oauth2.authorize({${smartSettings}});</script>`;
    // const variables = {settings: str}
    res.render('launch');
});

app.get('/index', (req, res) => {
    res.render('index');
});

app.get("/app", (req, res) => {
    smart(req, res).ready().then(client => handler(client, res));
    const variables = { formToAdd: jsonList };
    res.render("form", variables);
});
/*
app.post("/submit-questionnaire", ensureAuthenticated, (req, res) => {
    const questionnaireResponse = req.body;
    req.session.lastQuestionnaireResponse = questionnaireResponse;
    res.json({ message: "QuestionnaireResponse received successfully" });
});
*/
/*
app.post("/submit-questionnaire", ensureAuthenticated, (req, res) => {
    const questionnaireResponse = req.body; // Make sure this data structure matches what you send
    req.session.lastQuestionnaireResponse = questionnaireResponse;
    res.json({ message: "QuestionnaireResponse received successfully" });
});
*/

app.post("/token", (req, res) => {
    // Simulate token exchange logic here
    const { authCode } = req.body;
    fetch('https://oauthprovider.com/token', require('dotenv').config();
    const express = require("express");
    const app = express();
    const bodyParser = require("body-parser");
    const portNumber = 3000;
    const path = require("path");
    const smart = require("fhirclient");
    const session = require("express-session");
    
    app.use(session({
        secret: "my secret",
        resave: false,
        saveUninitialized: false
    }));
    
    const smartSettings = {
        clientId: "eec22f7e-5014-4b7c-98a1-178c505da56c",
        redirectUri: "https://smartonfhir.onrender.com/app",
        scope: "launch/patient openid fhirUser patient/*.read Questionnaire.Read Questionnaire.Search QuestionnaireResponse.Read QuestionnaireResponse.Search Patient.Read Patient.Search"
    };
    
    const fs = require("fs");
    
    app.set("views", path.resolve(__dirname, "templates"));
    app.set("view engine", "ejs");
    
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
        const token = req.cookies['accessToken'];
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
        smart(req, res).ready().then(client => handler(client, res));
        const variables = { formToAdd: jsonList };
        res.render("form", variables);
    });
    
    app.post("/submit-questionnaire", ensureAuthenticated, (req, res) => {
        const questionnaireResponse = req.body;
        req.session.lastQuestionnaireResponse = questionnaireResponse;
        res.json(questionnaireResponse);
    });
    
    app.post("/token", (req, res) => {
        const { authCode } = req.body;
        fetch('https://oauthprovider.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                code: authCode,
                redirect_uri: process.env.REDIRECT_URI,
                grant_type: 'authorization_code'
            })
        })
        .then(response => response.json())
        .then(data => {
            res.cookie('accessToken', data.access_token, { httpOnly: true, secure: true });
            res.redirect('/');
        })
        .catch(error => {
            console.error('Error:', error);
            res.status(500).send('Authentication failed');
        });
    });
    
    app.get('/formselector', (req, res) => {
        res.render("formselection");
    });
    
    app.get('/response-data', (req, res) => {
        res.render('responsedata');
    });
    {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            client_id: process.env.CLIENT_ID,  // Use environment variables
            client_secret: process.env.CLIENT_SECRET,
            code: authCode,
            redirect_uri: process.env.REDIRECT_URI,
            grant_type: 'authorization_code'
        })
    })
    .then(response => response.json())
    .then(data => {
        // Store the access token in an httpOnly cookie
        res.cookie('accessToken', data.access_token, { httpOnly: true, secure: true });
        res.redirect('/');  // Redirect to the home page or dashboard
    })
    .catch(error => {
        console.error('Error:', error);
        res.status(500).send('Authentication failed');
    });
});




app.get('/formselector',(req, res) => {
    res.render("formselection");
});


app.get('/response-data', (req, res) => {
    res.render('responsedata');
});
