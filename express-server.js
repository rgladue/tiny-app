const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

//
// APP DEPENDENCIES
//

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));
const bcrypt = require('bcryptjs');

//
// HELPER FUNCTIONS
//

function generateRandomString() {
  let randomArr = [];
  for (let i = 0; i < 1; i++) {
    randomArr.push(Math.random().toString(24).slice(8));
  }
  return randomArr[0];
}

const getUserByEmail = (userObj, id) => {
  for (let idKey in userObj) {
    if (userObj[idKey].id === id) {
      
      return userObj[idKey]
    }
  }
};

const checkRegisteredUsers = (usersObj, email) => {
for (let Key in usersObj) {
  if (usersObj[Key].email === email) {
    return true;
  }
}

};

const URLGrabber = (URLDB, user_id) => {
for (const key in URLDB) {
  if (URLDB[key].userID === user_id) {
    return URLDB[key].longURL;
  }
}

};


const urlsForUser = function(id, UDB) {
  const userUrls = {};
  for (const shortURL in UDB) {
    if (UDB[shortURL].userID === id) {
      userUrls[shortURL] = UDB[shortURL];
    }
  }
  return userUrls;
};


//
// APP DATA
//
const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
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
  }
}


//
// APP ROUTING
//

app.get("/", (req, res) => {
  res.send("Hello! This is the Home Page!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies.user_id) {
    res.redirect("/login")
  } else {
  const account = getUserByEmail(users,req.cookies.user_id )
  const templateVars = {user: account}
  res.render("urls_new", templateVars);
  }
});

//main listing page for all short and long urls
app.get("/urls", (req, res) => {
  if (!req.cookies.user_id) {
    res.render("urls_logged_out")
  } else {
  const userUrls = urlsForUser(req.cookies.user_id, urlDatabase);
  
  const account = getUserByEmail(users,req.cookies.user_id )
  const templateVars = { user: account, urls: userUrls };
  
  

  res.render("urls_index", templateVars);
  }
});

//rerouting the edit request to the urls_show page
app.get("/urls/:shortURL/edit", (req, res) => {
  
  const account = getUserByEmail(users,req.cookies.user_id )
  const longOne = URLGrabber(urlDatabase, req.cookies.user_id)
  const templateVars = {
    user: account,
    shortURL: req.params.shortURL,
    longURL: longOne
  };
  
  
  res.render("urls_show", templateVars);
});

//redirects to /u/:shortURL which in turn will redirect to longURL homepage
app.get("/urls/:shortURL", (req, res) => { 
 
  const account = getUserByEmail(users,req.cookies.user_id )
  const longOne = URLGrabber(urlDatabase, req.cookies.user_id)
  const templateVars = {
    user: account,
    shortURL: req.params.shortURL,
    longURL: longOne
  };
  
  res.render("urls_show", templateVars);
  
});

app.post("/urls", (req, res) => {
  const shortUrl = generateRandomString();
  urlDatabase[shortUrl] = {longURL: req.body.longURL, userID: req.cookies.user_id}
  
  
  res.redirect(`/urls/${shortUrl}`);
});

app.get("/u/:shortURL", (req, res) => {
  const link = URLGrabber(urlDatabase, req.cookies.user_id)
  res.redirect(link);
});

//deleting specific URL and redirecting to main URL listing page
app.post("/urls/:shortURL/delete", (req, res) => {
 
  if(req.cookies.user_id) {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
  } else res.redirect("/urls")
});

app.post("/urls/update", (req, res) => {
  const longNew = req.body.longURL;
  urlDatabase["9sm5xK"] = longNew
  
  res.redirect("/urls");
});

// REGISTRATION
app.get("/register", (req, res) => {

res.render("register")
});

app.post("/register", (req, res) => {

const userEmail = req.body.email;
const userPassword = req.body.password;
const newUserID = generateRandomString();
const hashed = bcrypt.hashSync(userPassword, 10)

if (!userEmail || !userPassword) {
  res.status(400).send();
} else if (checkRegisteredUsers(users, req.body.email)) {
  res.status(400).send();
} else {
users[newUserID] = {id: newUserID, email: userEmail, password: hashed};
res.cookie("user_id",newUserID)
console.log(users)

res.redirect("/urls");
}
});


// LOGIN AND LOGOUT
app.get("/login", (req, res) => {
  res.render("login");
});
app.post("/login", (req, res) => {
  const password = req.body.password;
  if(checkRegisteredUsers(users, req.body.email)) {
    for(const user in users) {
      
      if(users[user].email === req.body.email && bcrypt.compareSync(password, users[user].password)) {
        res.cookie("user_id",users[user].id);
        res.redirect("/urls");
      }
    } 
  }else res.status(403).send()
      
  
  
});

app.post("/logout", (req, res) => {
 
res.clearCookie("user_id");
res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
