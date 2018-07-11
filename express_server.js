var express = require('express');
var app = express();
var PORT = 8080; //default port 8080
const bodyParser = require('body-parser');
app.set("view engine", "ejs");

var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
    res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
    res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
    res.render("urls_index", { urls: urlDatabase })
});

app.get('/urls/new', (req, res) => {
    res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
    let templateVars = { shortURL: req.params.id, fullURL: urlDatabase[req.params.id] };
    res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`)
});

app.use(bodyParser.urlencoded({extended: true}));

app.post("/urls", (req, res) => {
    console.log(req.body); //debug statement to see POST parameters
    res.send("Ok"); //Respond 
})

function generateRandomString () {
    let randomStr = Math.random().toString(36).substr(2, 6);
    return randomStr;
}
generateRandomString();

// console.log(generateRandomString());