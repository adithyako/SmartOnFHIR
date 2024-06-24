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
    redirectUri: "/app",
    scope: "launch openid fhirUser patient/*.read Questionnaire.Read Questionnaire.Search QuestionnaireResponse.Read QuestionnaireResponse.Search",
    iss: "https://launch.smarthealthit.org/v/r2/sim/eyJrIjoiMSIsImIiOiJzbWFydC03Nzc3NzA1In0/fhir"
};

/* Module for file reading */
const fs = require("fs");

app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");

/* Initializes request.body with post information */
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static('public'));


app.listen(portNumber);


console.log(`Web server started and running at http://localhost:${portNumber}/index`);

process.stdin.setEncoding("utf8");

if (process.argv.length != 3) {
    process.stdout.write(`Usage Questionnaire.js jsonFile`);
    process.exit(1);
}

const listName = process.argv[2];

const prompt = "Type stop to shutdown the server: ";

const jsonList = fs.readFileSync(listName, "utf-8");
const arrList = JSON.parse(jsonList);

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

const items = arrList.item;

let ret = "";
items.forEach(curr => {

    curr.code.forEach(curr2 => {

        ret += `<div class="question" id="Q${curr2.code}">` // open div
        ret += `<span>` + curr2.display + `</span><hr><br>`; // display question

        ret += `<label><select name = "A${curr2.code}">`; // open answer dropdown menu
        ret += `<option value="" disabled selected>Please select</option>`; // please select option 


        curr.answerOption.forEach(curr3 => {

            // console.log(curr3.valueCoding.display);

            /* adds the answer to the dropdown menu for each answer */
            ret += `<option value="${curr3.valueCoding.display}">${curr3.valueCoding.display}</option>`;
        })

        ret += `</select></label></div>`
    });
    // console.log(curr)
});



app.get('/launch', function (req, res, next) {
    smart(req, res).authorize(smartSettings).catch(next);
});

app.get('/index', function (req, res) {
    res.render('index');
});

// app.get("/app", (req, res) => {
//     smart(req, res).ready().then(client => handler(client, res));
//     const variables = { title: arrList.title, questions: ret }
//     res.render("app", variables);
// });

app.get('/home', function (req, res) {
    res.render('home');
});

app.get("/app", (req, res) => {
    smart(req, res).ready().then(client => handler(client, res));
    const variables = { formToAdd: jsonList };
    res.render("form", variables);
});

app.get('/tos', function (req, res) {
    res.render('tos');
});

app.post("/submit-questionnaire", (req, res) => {
    const questionnaireResponse = req.body;
    console.log("Received QuestionnaireResponse:", questionnaireResponse);
    // You can add logic here to process and store the QuestionnaireResponse
    res.json({ message: "QuestionnaireResponse received successfully" });
});

