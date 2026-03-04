const path = require("path");
const express = require("express");

const app = express();


// DATABASE STARTS HERE 
require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));
// DATABASE ENDS HERE 

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const auth = require("./routes/auth");
const movie = require("./routes/movie");
const review = require("./routes/review");
const user = require("./routes/user")
const watchlist = require("./routes/watchlist");
app.use("/", auth);
app.use("/", movie);
app.use("/", review);
app.use("/users", user);
app.use("/", watchlist);

app.get("/", (req, res) => {
  res.send(`
    <h1>Movies Watchlist</h1>
    <a href="signup">Sign Up</a>
    <a href="login">Login</a>
  `);
});

const hostname = "127.0.0.1";
const port = 8000;

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});