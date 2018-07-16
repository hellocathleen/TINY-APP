const express = require('express');
const app = express();
const PORT = 8080; //default port 8080
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const methodOverride = require('method-override');
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['secret-string', 'key2'],
}));
app.use(methodOverride('_method'));

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

//global function for returning urls that were created by the user
function urlsForUser(id) {
    const userUrls = {};
    for (let shortURL in urlDatabase) {
        if (urlDatabase[shortURL]['userID'] === id) {
            userUrls[shortURL] = urlDatabase[shortURL].url
        }
    }
    return userUrls;
}
//global function for generating random 6-character alpha-numeric string
function generateRandomString () {
    let randomStr = Math.random().toString(36).substr(2, 6);
    return randomStr;
}

app.get("/", (req, res) => {
    if (req.session.user_id) {
        res.redirect("/urls");
    } else {
        res.redirect("/login");
    }
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
    let id = req.params.id;
    let templateVars = { 
        user_id: users[req.session.user_id],
        user: users,
        urls: urlsForUser(req.session.user_id) 
    };
    if (!req.session.user_id) {
        res.send("<b>You must log in or register.</b>");
    } else {
        res.render("urls_index", templateVars)
    }
});

app.get('/urls/new', (req, res) => {
    let templateVars = { 
        user_id: users[req.session.user_id],
        user: users,
        urls: urlDatabase, 
    };
    if (req.session.user_id) {
        res.render("urls_new", templateVars);
    } else {
        res.redirect("/login");
    }
});

app.get("/urls/:id", (req, res) => {
    let id = req.params.id;
    let templateVars = { 
        user_id: users[req.session.user_id], 
        user: users, 
        urls: urlDatabase, 
        shortURL: req.params.id, 
        fullURL: urlDatabase[req.params.id] };
    if (!urlDatabase[id]) {
        res.send("<html>This URL ID does not exist</html>")
    } else if (!req.session.user_id) {
        res.end("<html><body>You must log in.</body></html>\n");
    } else if (urlDatabase[id]['userID'] === req.session.user_id) {
        res.render("urls_show", templateVars);  
    } else {
        res.end("<html><body>You do not own this URL.</body></html>\n")
    }
});

//Update a URL in the database
app.put("/urls/:id", (req, res) => {
    let id = req.params.id;
    if (urlDatabase[id]['userID'] === req.session.user_id) {
        let newlongURL = req.body['newlongURL']
        urlDatabase[req.params.id].url = newlongURL;
        res.redirect("/urls");
    } else {
        res.end("<html><body>You are not authorized to edit this URL.</body></html>\n");
    }
})

//Add new URL to database
app.post("/urls", (req, res) => {
    let longURL = req.body['longURL']
    let randoURL = generateRandomString();
    urlDatabase[randoURL] = { url: longURL, userID: req.session.user_id };
    res.redirect(`/urls/${randoURL}`);
});
//shortURL redirection to longURL
app.get("/u/:shortURL", (req, res) => {
    let shortURL = req.params.shortURL;
    let longURL = urlDatabase[shortURL];
    if (!urlDatabase[shortURL]) {
        res.send("<html>This URL ID does not exist</html>")
    } else {
        res.redirect(longURL.url); 
    }
})

app.get("/urls/:id/delete", (req, res) => {
    let templateVars = { 
        user_id: users[req.session.user_id], 
        user: users, 
        urls: urlsForUser(req.session.user_id), 
    };
    let id = req.params.id;
    let urlDatabaseId = urlDatabase[id];
    if (!req.session.user_id) {
        res.end("<html><body>You must log in.</body></html>\n");
    } else if (urlDatabaseId.userID === req.session.user_id) {
       res.render("urls_index", templateVars) 
    } else {
        res.end("<html><body>You are not authorized to delete this URL.</body></html>\n");
    }
})
//Delete a URL from database
app.delete("/urls/:id/delete", (req, res) => {
    let id = req.params.id;
    if (!req.session.user_id) {
        res.end("<html><body>You must log in.</body></html>\n");
    } else if (urlDatabase[id]['userID'] === req.session.user_id) {
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
    if (!req.session.user_id) {
        res.render("login"), templateVars;  
    } else {
        res.redirect("/urls");
    }
})

app.post("/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    for (let id in users) {
        const user = users[id];
        if (user.email === email) {
            //currentUser = user;
            if (bcrypt.compareSync(password, user['password'])) {
                req.session.user_id = user.id;
                res.redirect("/urls");
                return;
            }
        }
    }
    return res.sendStatus(403);  
});

app.post("/logout", (req, res) => {
    req.session.user_id = null;
    res.redirect("/urls");
})

app.get("/register", (req, res) => {
    let templateVars = { 
        user_id: users[req.session.user_id], 
        user: users, 
        urls: urlDatabase, 
    };
    if (!req.session.user_id) {
        res.render("registration", templateVars);
    } else {
        res.redirect("/urls");
    }
})

app.post("/register", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);
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
        users[newID] = { id: newID, email: email, password: hashedPassword };
        req.session.user_id = newID;
        res.redirect('/urls');
        return;
    } else if (!email || !password) {
        res.send("You must enter both an email and a password.");
    }
})

//keep at the bottom
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`)
})