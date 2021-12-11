const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const {
  generateRandomString,
  getUserByEmail,
  checkRegisteredUsers,
  urlsForUser,
} = require("./helpers");
//
// APP DEPENDENCIES
//

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(
  cookieSession({
    name: "session",
    keys: [
      "b10783d2-24ed-4a30-9b84-9c10ea429bfd",
      "f56a87b1-5588-4f8a-beb0-3e1b06aa40e2",
    ],
  })
);

//
// APP DATA
//
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//
// APP ROUTING
//

app.get("/", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  } else res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    const account = getUserByEmail(users, req.session.user_id);
    const templateVars = { user: account };
    res.render("urls_new", templateVars);
  }
});

//main listing page for all short and long urls
app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.render("urls_logged_out");
  } else {
    const userUrls = urlsForUser(req.session.user_id, urlDatabase);

    const account = getUserByEmail(users, req.session.user_id);
    const templateVars = { user: account, urls: userUrls };

    res.render("urls_index", templateVars);
  }
});

//rerouting the edit request to the urls_show page
app.get("/urls/:shortURL/edit", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/urls");
  } else {
  const account = getUserByEmail(users, req.session.user_id);

  const templateVars = {
    user: account,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
  }
  };

  res.render("urls_show", templateVars);
});

//redirects to /u/:shortURL which in turn will redirect to longURL homepage
app.get("/urls/:shortURL", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/urls");
  }
  const account = getUserByEmail(users, req.session.user_id);

  const templateVars = {
    user: account,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
  };

  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const shortUrl = generateRandomString();

  urlDatabase[shortUrl] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };

  res.redirect(`/urls/${shortUrl}`);
});

app.get("/u/:shortURL", (req, res) => {
  const link = urlDatabase[req.params.shortURL].longURL;
  res.redirect(link);
});

//deleting specific URL and redirecting to main URL listing page
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else res.redirect("/urls");
});

app.post("/urls/:shortURL/update", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/urls");
  }
  const shortURL = req.params.shortURL;

  for (const url in urlDatabase) {
    for (const user in users) {
      if (urlDatabase[url].userID === user && url === shortURL) {
        urlDatabase[url].longURL = req.body.longURL;
        res.redirect("/urls");
      }
    }
  }
});

// REGISTRATION
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  }
  res.render("register");
});

app.post("/register", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const newUserID = generateRandomString();
  const hashed = bcrypt.hashSync(userPassword, 10);

  if (!userEmail || !userPassword) {
    res.redirect("/errorpg");
  } else if (checkRegisteredUsers(users, req.body.email)) {
    res.redirect("/errorpg");
  } else {
    users[newUserID] = { id: newUserID, email: userEmail, password: hashed };
    req.session.user_id = newUserID;

    res.redirect("/urls");
  }
});

// LOGIN AND LOGOUT
app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  }
  res.render("login");
});
app.post("/login", (req, res) => {
  const password = req.body.password;
  if (checkRegisteredUsers(users, req.body.email)) {
    for (const user in users) {
      if (
        users[user].email === req.body.email &&
        bcrypt.compareSync(password, users[user].password)
      ) {
        req.session.user_id = users[user].id;
        res.redirect("/urls");
      }
    }
  } else res.redirect("/errorpg");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.get("/errorpg", (req, res) => {

  res.render("error")
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
