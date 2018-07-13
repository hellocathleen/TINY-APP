var express = require('express');
var app = express();
var PORT = 8080; //default port 8080
var cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_SECRET || 'secret-string'],
}));


const urlDatabase = {
    "b2xVn2": {
        url: "http://www.lighthouselabs.ca",
        userID: "Cathleen"
    },

    "9sm5xK": {
        url: "http://www.google.com",
        userID: "Derpy"
    }
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

function findUserEmail(userID) {
    for (var id in users) {
        const user = users[id];
        if (user.id === req.session.userId) {
            return user.email
        }
    }
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
    let templateVars = { 
        user_id: req.cookies["user_id"], 
        user: users,
        urls: urlDatabase, 
    };
    res.render("urls_index", templateVars)
});

app.get('/urls/new', (req, res) => {
    let templateVars = { 
        user_id: req.cookies["user_id"], 
        user: users,
        urls: urlDatabase, 
    };
    if (req.session.userId) {
        res.render("urls_new", { templateVars });
    } else {
        res.redirect("/login");
    }
});

app.get("/urls/:id", (req, res) => {
    let templateVars = { 
        user_id: req.cookies["user_id"], 
        user: users, 
        urls: urlDatabase, 
        shortURL: req.params.id, 
        fullURL: urlDatabase[req.params.id]['url'] };
    res.render("urls_show", templateVars);
});
//Update a URL in the database
app.post("/urls/:id", (req, res) => {
    let id = req.params.id;
    if (urlDatabase[id]['userID'] === req.session.userId) {
        console.log(req.body); //debug statement to see POST parameters
        let newlongURL = req.body['newlongURL']
        urlDatabase[req.params.id] = newlongURL;
        console.log(urlDatabase);//view updated database
        res.redirect("/urls");
    } else {
        res.end("<html><body>You are not authorized to edit this URL.</body></html>\n");
    }
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
    let templateVars = { 
        user_id: req.cookies["user_id"], 
        user: users, 
        urls: urlDatabase, 
    };
       res.render("urls_index", templateVars) 
})
//Delete a URL from database
app.post("/urls/:id/delete", (req, res) => {
    let id = req.params.id;
    if (urlDatabase[id]['userID'] === req.session.userId) {
        delete urlDatabase[id];
        res.redirect("/urls");
    } else {
        res.end("<html><body>You are not authorized to delete this URL.</body></html>\n");
    }
})

app.get("/login", (req, res) => {
    let templateVars = { 
        user: users, 
        urls: urlDatabase, 
    };
    res.render("login"), templateVars;
})

app.post("/login", (req, res) => {
    console.log("Body:", req.body);
    const email = req.body.email;
    const password = req.body.password;
    for (var id in users) {
        const user = users[id];
        if (user.email === email) {
            //currentUser = user;
            if (user.password === password) {
                res.cookie('user_id', user.id);
                req.session.userId = user.id;
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
    let templateVars = { 
        user_id: req.cookies["user_id"], 
        user: users, 
        urls: urlDatabase, 
    };
    res.render("registration", templateVars);
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
})
    // bcrypt.hash(req.body.password, saltRounds, (error, hashed) => {
    //     database.save(username, hashed);
    // })


//keep at the bottom
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`)
})