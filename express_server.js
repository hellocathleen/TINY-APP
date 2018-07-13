var express = require('express');
var app = express();
var PORT = 8080; //default port 8080
var cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

const users = {
    "userRandomID": {
        id: "userRandomID",
        email: "user@example.com",
        password: "purple-monkey-dinosaur"
    },
    "user2RandomID": {
        id: "user2RandomID",
        email: "user2@example.com",
        password: "dishwasher-funk"
    },
    "Derpy": {
        id: "Derpy",
        email: "derpy@example.com",
        password: "yeetyeetyeet"
    },
    "Cathleen": {
        id: "Cathleen",
        email: "cathleen5140@gmail.com",
        password: "password123"
    }
}

for (const id in users) {
    userID = users[id];
}

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
    res.render("urls_index", { user_id: req.cookies["user_id"], user: users, urls: urlDatabase })
});

app.get('/urls/new', (req, res) => {
    res.render("urls_new", { user_id: req.cookies["user_id"], user: users, urls: urlDatabase });
});

app.get("/urls/:id", (req, res) => {
    let templateVars = { user_id: req.cookies["user_id"], user: users, urls: urlDatabase, shortURL: req.params.id, fullURL: urlDatabase[req.params.id] };
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
    res.render("urls_index", { user_id: req.cookies["user_id"], user: users, urls: urlDatabase })
})
//Delete a URL from database
app.post("/urls/:id/delete", (req, res) => {
    let id = req.params.id;
    delete urlDatabase[id];
    res.redirect("/urls");
})

app.get("/login", (req, res) => {
    res.render("login"), { user: users, urls: urlDatabase };
})

app.post("/login", (req, res) => {
    console.log("Body:", req.body);
    const email = req.body.email;
    const password = req.body.password;
    for (var id in users) {
        const user = users[id];
        console.log(email, user.email);
        if (user.email === email) {
            //currentUser = user;
            if (user.password === password) {
                res.cookie('user_id', user.id);
                res.redirect("/urls");
                return;
            }
        }
    }
    return res.sendStatus(403);  
});

app.post("/logout", (req, res) => {
    res.clearCookie('user_id');
    console.log("Cookies:", req.cookies);
    res.redirect("/urls");
})

app.get("/register", (req, res) => {
    res.render("registration", { user_id: req.cookies["user_id"], user: users, urls: urlDatabase });
})

app.post("/register", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    //add new user IF the entered email doesn't match an existing email in the database
    //and if email and password are filled out
    for (const id in users) {
        const user = users[id];
        if (email === user.email){
            res.sendStatus(400);
            return;
        }
    }
    if (email && password) {
        let randoID = generateRandomString();
        const newID = randoID;
        users[newID] = { id: newID, email: email, password: password };
        res.cookie('user_id', users[newID].id);
        res.redirect('/urls');
        return;
    }
    //return res.sendStatus(400);
})
    // bcrypt.hash(req.body.password, saltRounds, (error, hashed) => {
    //     database.save(username, hashed);
    // })


//keep at the bottom
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`)
})