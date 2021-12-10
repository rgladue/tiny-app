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


module.exports = { generateRandomString, getUserByEmail, checkRegisteredUsers, urlsForUser, URLGrabber };