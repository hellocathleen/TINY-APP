var express = require('express');
var app = express();
var PORT = 8080; //default port 8080
var cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

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
    res.render("urls_index", { username: req.cookies["username"], urls: urlDatabase })
});

app.get('/urls/new', (req, res) => {
    res.render("urls_new", { username: req.cookies["username"] });
});

app.get("/urls/:id", (req, res) => {
    let templateVars = { shortURL: req.params.id, fullURL: urlDatabase[req.params.id], username: req.cookies["username"] };
    res.render("urls_show", templateVars);
});
//Update a URL in the database
app.post("/urls/:id", (req, res) => {
    console.log(req.body); //debug statement to see POST parameters
    let newlongURL = req.body['newlongURL']
    urlDatabase[req.params.id] = newlongURL;
    console.log(urlDatabase);//view updated database
    res.redirect("/urls");
})

function generateRandomString () {
    let randomStr = Math.random().toString(36).substr(2, 6);
    return randomStr;
}
//Add new URL to database
app.post("/urls", (req, res) => {
    console.log(req.body); //debug statement to see POST parameters
    let longURL = req.body['longURL']
    let randoURL = generateRandomString();
    urlDatabase[randoURL] = longURL;
    console.log(urlDatabase);  
    res.redirect(`/urls/${randoURL}`);
});

app.get("/u/:randoURL", (req, res) => {
    let randoURL = req.params.randoURL;
    let longURL = urlDatabase[randoURL];
    res.redirect(longURL);
})

app.get("/urls/:id/delete", (req, res) => {
    res.render("urls_index", { username: req.cookies["username"], urls: urlDatabase })
})
//Delete a URL from database
app.post("/urls/:id/delete", (req, res) => {
    let id = req.params.id;
    delete urlDatabase[id];
    res.redirect("/urls");
})

app.post("/login", (req, res) => {
    console.log("Body:", req.body);
    res.cookie('username', req.body['username']);
    console.log("Cookies:", req.cookies);
    res.redirect("/urls");
});

app.post("/logout", (req, res) => {
    res.clearCookie('username');
    console.log("Cookies:", req.cookies);
    res.redirect("/urls");
})

//keep at the bottom
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`)
})