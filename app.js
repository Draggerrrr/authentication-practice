require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const bodyParser= require("body-parser");
const mongoose = require("mongoose");

const bcrypt = require('bcrypt');
const saltRounds = 10;


//const md5 = require("md5");

//const encrypt = require("mongoose-encryption");


const app = express();
const port = 3000;

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended : true }));
app.use(bodyParser.json());




// Connect to mongoDB 
mongoose.connect('mongodb://127.0.0.1:27017/userDB');

//Schema Creation

const userSchema = new mongoose.Schema({
    email : String,
    password : String
});


//userSchema.plugin( encrypt, { secret : process.env.SECRET , encryptedFields: ['password']});

// Model Creation

const User = mongoose.model("User", userSchema);


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


// Post Request for Register

app.post("/register", function(req, res){


    bcrypt.hash( req.body.password, saltRounds, function(err, hash) {
       
           // Creation of new user 
        const newUser = new User({
            email : req.body.username,
            password : hash
        });

        // New User saved in Database
        newUser.save()
        .then(()=>{
            res.render("secrets");
        })
        .catch((error)=>{
            res.send(error);
        })

    });

});

// Post request for login

app.post("/login", function( req, res){
    const username = req.body.username;
    const password = req.body.password;



    User.findOne({email : username})
        .then((foundUser)=>{
           
        bcrypt.compare(password, foundUser.password , function(err, result) {
             if( result === true ){
                res.render("secrets");
             }
             else{
                console.log(err);
             }
            })
       
        })
        .catch((error)=>{
            res.send(error);
        })
});



// Port listen
app.listen( port, function(){
    console.log("Server successfully started on port 3000");
});