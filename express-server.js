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


//
// APP DATA
//
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
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
  const account = getUserByEmail(users,req.cookies.user_id )
  const templateVars = {user: account}
  
  res.render("urls_new", templateVars);
});

//main listing page for all short and long urls
app.get("/urls", (req, res) => {
  
  const account = getUserByEmail(users,req.cookies.user_id )
  const templateVars = { user: account, urls: urlDatabase };
  
  

  res.render("urls_index", templateVars);
});

//rerouting the edit request to the urls_show page
app.get("/urls/:shortURL/edit", (req, res) => {
  console.log(req.cookies)
  const account = getUserByEmail(users,req.cookies.user_id )
  const templateVars = {
    user: account,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  // console.log(templateVars);
  
  res.render("urls_show", templateVars);
});

//redirects to /u/:shortURL which in turn will redirect to longURL homepage
app.get("/urls/:shortURL", (req, res) => {
  const account = getUserByEmail(users,req.cookies.user_id )
  const templateVars = {
    user: account,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
  
});

app.post("/urls", (req, res) => {
  const shortUrl = generateRandomString();
  urlDatabase[shortUrl] = req.body.longURL;
  res.redirect(`/urls/${shortUrl}`);
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});

//deleting specific URL and redirecting to main URL listing page
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
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

if (!userEmail || !userPassword) {
  res.status(400).send();
} else if (checkRegisteredUsers(users, req.body.email)) {
  res.status(400).send();
} else {
users[newUserID] = {id: newUserID, email: userEmail, password: userPassword};
res.cookie("user_id",newUserID)
console.log(users);

res.redirect("/urls");
}
});


// LOGIN AND LOGOUT
app.get("/login", (req, res) => {
  res.render("login");
});
app.post("/login", (req, res) => {
  if(checkRegisteredUsers(users, req.body.email)) {
    for(const user in users) {
      if(users[user].email === req.body.email && users[user].password === req.body.password) {
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
