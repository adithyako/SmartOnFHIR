const express = require("express"); /* Accessing express module */
const app = express(); /* app is a request handler function */
const bodyParser = require("body-parser"); /* To handle post parameters */
const portNumber = 3000;
const path = require("path");

/* Module for file reading */
const fs = require("fs");

app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");

/* Initializes request.body with post information */
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static('public'));

app.listen(portNumber);


console.log(`Web server started and running at http://localhost:${portNumber}/launch`);

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

app.get('/launch', function (req, res) {
    res.render('launch');
});

app.get("/index", (req, res) => {
    const variables = { title: arrList.title, questions: ret }
    res.render("index", variables);
});



