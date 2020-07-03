const express = require('express');
const path = require('path');
let controller = require('./routes/connectionController');
let profileController = require('./routes/profileController');
var session = require('express-session');
var bodyparser = require('body-parser');
var app = express();

app.set("views",path.join(__dirname,"views"));  
app.set('view engine','ejs');   
app.use(bodyparser.json());     
app.use(bodyparser.urlencoded({extended:false}));   
app.use(session({secret:'ck', saveUninitialized:false, resave:false}));  
                                                                       
app.use("/partials",express.static("partials"));  
app.use('/assets', express.static('assets'));    

   
app.use('/', profileController);   
app.use('/', controller); 
app.listen(9007);   
console.log('Success!');
module.exports = app;