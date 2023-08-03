require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const bodyParser= require("body-parser");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");





// const bcrypt = require('bcrypt');
// const saltRounds = 10;


//const md5 = require("md5");

//const encrypt = require("mongoose-encryption");


const app = express();
const port = 3000;

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended : true }));
app.use(bodyParser.json());


app.use(session({
    secret : "Ancient stone hedge.",
    resave : false,
    saveUninitialized : false
}));

app.use(passport.initialize());
app.use(passport.session());


// Connect to mongoDB 
mongoose.connect('mongodb://127.0.0.1:27017/userDB');

//Schema Creation

const userSchema = new mongoose.Schema({
    email : String,
    password : String
});

userSchema.plugin(passportLocalMongoose);

//userSchema.plugin( encrypt, { secret : process.env.SECRET , encryptedFields: ['password']});

// Model Creation

const User = mongoose.model("User", userSchema);



passport.use(User.createStrategy());


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// Get Requests Start

app.get("/", function(req, res){
    res.render("home");
});

app.get("/register", function(req, res){
    res.render("register");
});

app.get("/login", function(req, res){
    res.render("login");
});


app.get("/secrets", function(req, res){
    if(req.isAuthenticated()){
        res.render("secrets");
    }
    else{
        res.redirect("/login");
    }
});


app.get("/logout", function(req, res){
    req.logout(function(err){
        if(!err){
            res.redirect("/");
        }
    });

})

// Post Request for Register

app.post("/register", function(req, res){

    User.register({username : req.body.username, active : false}, req.body.password, function( err, user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }
        else{
            passport.authenticate("local")(req, res , function(){
                res.redirect("/secrets");
            });
        }
    });

});

// Post request for login

app.post("/login", function( req, res){
  
    const user = new User({
        username : req.body.username,
        password : req.body.password
    });

    req.login(user, function (err) {
        if (err) {
          console.log(err);
        } else {
          passport.authenticate("local")(req, res, function () {
            res.redirect("/secrets");
          });
        }
      });

});



// Port listen
app.listen( port, function(){
    console.log("Server successfully started on port 3000");
});