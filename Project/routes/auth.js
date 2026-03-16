const express = require("express");
const bcrypt = require("bcrypt"); 
const router = express.Router();
const User = require("../models/User"); 

/* OLD CODE 
// ADD YOUR CODE BELOW
const USERS = [
  { username: "test", password: "asd123", watchlist: []},
  { username: "asd", password: "password", watchlist: []}
];


router.get("/signup", (req, res) =>{
  res.send(`
     <form method="post" action="/signup">
        <label>Username</label></br>
        <input type="text" name="username"></br>
        <label>Password</label></br>
        <input type="password" name="password"></br>
        <label>Confirm Password</label></br>
        <input type="password" name="cpassword"></br>
        </br>
        <button type="submit">Sign Up</button>
    </form>
    `);
});

router.get("/login", (req, res) =>{
  res.send(`
     <form method="post" action="/login">
        <label>Username</label></br>
        <input type="text" name="username"></br>
        <label>Password</label></br>
        <input type="password" name="password"></br>
        </br>
        <button type="submit">Login</button>
    </form>
    `);
});

router.post("/signup", (req, res) =>{
  const username = req.body.username;
  const password = req.body.password;
  const cpassword = req.body.cpassword;
  let msg = "";

  if (password != cpassword){
    msg = "Password do not match";
    res.send(`<p>${msg}</p>
      <form method="post" action="/signup">
      <label>Username</label></br>
      <input type="text" name="username"></br>
      <label>Password</label></br>
      <input type="password" name="password"></br>
      <label>Confirm Password</label></br>
      <input type="password" name="cpassword"></br>
      </br>
      <button type="submit">Sign Up</button>
  </form>
      `)
  }
  
  for (i in USERS){
    if (username === USERS[i].username){
      msg = "Username already existed";
      res.send(`<p>${msg}</p>
        <form method="post" action="/signup">
        <label>Username</label></br>
        <input type="text" name="username"></br>
        <label>Password</label></br>
        <input type="password" name="password"></br>
        <label>Confirm Password</label></br>
        <input type="password" name="cpassword"></br>
        </br>
        <button type="submit">Sign Up</button>
    </form>
        `);
    }
  }
  const user = {username: username, password: password}
  USERS.push(user);
  res.render("user",{user});
});

router.post("/login", (req, res) =>{
  const username = req.body.username;
  const password = req.body.password;
  let msg = "";
  
  for (i in USERS){
    if (username === USERS[i].username && password === USERS[i].password){
      const user = {username: username, password: password}
      res.render("user",{user});
    }

    msg = "Username or Password Invalid";
    res.send(`<p>${msg}</p>
      <form method="post" action="/login">
      <label>Username</label></br>
      <input type="text" name="username"></br>
      <label>Password</label></br>
      <input type="password" name="password"></br>
      </br>
      <button type="submit">Login</button>
  </form>
      `);
  }
});

// END OF ADDING YOUR CODE
*/ 
function alreadyLoggedIn(req, res, next) {
  if (req.session.userId) {
    return res.redirect("/home");
  }
  next();
}

router.get("/signup", alreadyLoggedIn, (req, res) => { 
  res.render("signup", {error: null}); 
}); 

router.post("/signup", async(req, res) => { 
  try { 
    const {username, email, password, confirmPassword} = req.body; 

    if (!username || !email || !password || !confirmPassword) {
      return res.render("signup", { error: "Please fill in all fields." });
    }

    if (password !== confirmPassword) {
      return res.render("signup", { error: "Passwords do not match." });
    }

    if (password.length < 6) {
      return res.render("signup", { error: "Password must be at least 6 characters." });
    }

    const existingUser = await User.findOne({ email }); 

    if(existingUser){ 
      return res.render("signup", {error: "Email is already registered."}); 
    }

    const hashedPassword = await bcrypt.hash(password, 10); 

    const newUser = new User({ 
      username, email, password: hashedPassword, role:"user"
    })

    await newUser.save(); 
    req.session.userId = newUser._id;
    req.session.username = newUser.username;
    req.session.role = newUser.role;
    res.redirect("/profile"); 

  } catch(err){ 
    console.error(err);
    res.render("signup", { error: "Something went wrong during signup." });
  }
})

router.get("/login", alreadyLoggedIn, (req, res) => { 
  res.render("login", {error: null}); 
}); 

router.post("/login", async(req, res) => { 
  try { 
    const {email , password} = req.body; 

    if(!email || !password){ 
      return res.render("login", {error: "Please enter both email and password."})
    }

    const user = await User.findOne({email}); 

    if(!user){ 
      return res.render("login", {error: "Invalid email or password."})
    }

    const isMatch = await bcrypt.compare(password, user.password); 

    if(!isMatch) { 
      return res.render("login", {error: "Invalid email or password"}); 
    }

    req.session.userId = user._id; 
    req.session.username = user.username; 
    req.session.role = user.role; 

    res.redirect('/profile'); 
  }
  catch(err) { 
    console.error(err); 
    res.render("login", {error: "Something went wrong during login."})
  }
})

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.send("Error logging out.");
    }

    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
});

module.exports = router;
