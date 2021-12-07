const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));

function generateRandomString() {
let randomArr = [];
for (let i = 0; i < 1; i++) {
  randomArr.push(Math.random().toString(24).slice(8))
}return randomArr[0];
}


app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello! This is the Home Page!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  
  
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
  res.redirect("/u/:shortURL");
});

app.post("/urls", (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
  const shortUrl = generateRandomString();
  urlDatabase[shortUrl] = req.body.longURL;
  
  res.redirect(`/urls/${shortUrl}`);         
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});

app.post("/urls/:shortURL/delete", (req, res) => {
const shortURL = req.params.shortURL
delete urlDatabase[shortURL];

res.redirect("/urls")
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});