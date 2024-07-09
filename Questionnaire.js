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
    secret: "v9f2tXGC/fcqMFfIdzMOWY1656C//q6LXG++3Z/e4PiQMbqn4kMN27XoJY+ZOdedD0U2R2XXM+ejJ6GT7f4EVg==",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // use secure: true in production
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

app.post("/save-response", (req, res) => {
    // Assume you have a method to save to a database or session
    const response = req.body; // This should be extended to include more details
    savedResponses.push(response); // Example saving mechanism
    res.json({ status: 'success', message: "Response saved successfully" });
});