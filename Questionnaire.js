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


console.log(`Web server started and running at http://localhost:${portNumber}`);

process.stdin.setEncoding("utf8");

if (process.argv.length != 3) {
    process.stdout.write(`Usage Questionnaire.js jsonFile`);
    process.exit(1);
}

const listName = process.argv[2];

const prompt = "Type formTemplate or stop to shutdown the server: ";

const jsonList = fs.readFileSync(listName, "utf-8");
const arrList = JSON.parse(jsonList);

process.stdout.write(prompt);
process.stdin.on("readable", function () {
    const dataInput = process.stdin.read();
    if (dataInput !== null) {
        const command = dataInput.trim();
        if (command === "itemsList") {
            console.log(realItemList);
        } else if (command === "stop") {
            process.stdout.write("Shutting down the server\n");
            process.exit(0);
        } else {
            process.stdout.write("Invalid command: " + command + "\n");
        }
        process.stdout.write(prompt);
        process.stdin.resume();
    }
});

app.get("/", (req, res) => {
    const variables = {title: arrList.title}
    res.render("index", variables);
});

// const items = arrList.item;

// items.forEach(curr => {
//     console.log(curr)
// });

