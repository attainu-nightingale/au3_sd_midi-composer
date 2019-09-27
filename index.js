const express = require('express');
const app = express();
const session = require('express-session');
let hbs = require('hbs');
let signup = require('./routes/signup');
let login = require('./routes/login');
let dashboard = require('./routes/dashboard');
let profile = require('./routes/profile');
let composer = require('./routes/composer');

// dotenv
require('dotenv').config()

//cloudinary setup
var cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

//view Engine
app.set('view engine', 'hbs');

//session object setup
app.use(session({
    secret: 'encryption',
    resave: true,
    saveUninitialized: true
}));

//Static Asset Declaration
app.use(express.static(__dirname + '/public'));

//bodyParser Setup
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

//Database
var MongoClient = require('mongodb').MongoClient;
var url = process.env.MONGODB_STRING || 'mongodb://127.0.0.1:27017';
var DbName = 'musify';

app.locals.db;

//connecting to DataBase
MongoClient.connect(url, {
    useUnifiedTopology: true,
    useNewUrlParser: true
}, function (err, client) {
    if (err) throw err
    console.log('DB connected')
    db = client.db(DbName);
})

//importing ObjectId
app.locals.ObjectId 
ObjectId = require('mongodb').ObjectID;

//port
var port = process.env.PORT || 3000;

//starting Server
app.listen(port);
console.log('play it on port : ' + port)

//static Routes
app.get('/', (req, res) => {
    if(req.session.loggedIn)
        res.redirect('/dashboard');
    else
        res.sendFile(__dirname + '/public/home.html');
});

//////////////////   Signup route  ///////////////////////
app.use('/signup',signup);

//////////////////   Login route  ////////////////////////
app.use('/login',login);

//////////////  Dashboard routes  //////////////////
app.use('/dashboard', dashboard);

////////////////// Profile routes /////////////////////
app.use('/profile', profile);

///////////// Composer routes //////////////////
app.use('/composer',composer);

///////////// Logout route //////////////////
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/')
});