var express = require('express');
var app = express();

//port
var port = 3000;

//view Engine
var hbs = require('hbs');
app.set('view engine', 'hbs');

//session object setup
var session = require('express-session');
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
var url = 'mongodb://localhost:27017';
var DbName = 'musify';
var db;

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
ObjectId = require('mongodb').ObjectID

//starting Server
app.listen(port);
console.log('play it on port : ' + port)

//static Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/home.html');
})
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
})
app.get('/signup', (req, res) => {
    res.sendFile(__dirname + '/public/signup.html');
})
app.get('/credits', (req, res) => {
    res.sendFile(__dirname + '/public/credits.html');
})
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/')
})

////////////////////////////////////////////////////
//////////////////   Signup  ///////////////////////
////////////////////////////////////////////////////
app.post('/signup', (req, res) => {
    var obj = {
        "firstname": req.body.firstname,
        "lastname": req.body.lastname,
        "gender": req.body.gender,
        "email": req.body.email,
        "username": req.body.username,
        "password": req.body.password
    }
    db.collection('users').insertOne(obj),
        function (err, data) {
            if (err) throw err
        }
    res.redirect('/login')
})

////////////////////////////////////////////////////
//////////////////   login  ////////////////////////
////////////////////////////////////////////////////

app.post('/login', (req, res) => {
    var flag = false;
    db.collection('users').find({
        username: req.body.username
    }).toArray(function (err, data) {
        if (err) throw err;
        if (req.body.username == data[0].username && req.body.password == data[0].password) {
            flag = true;
        }
        if (flag) {
            req.session.loggedIn = true;
            req.session.username = req.body.username;
            res.redirect("/dashboard");
        } else
            res.redirect("/login");
    })
})

////////////////////////////////////////////////////
//////////////  Secured Routes  ////////////////////
////////////////////////////////////////////////////

//get route for creation
app.get('/dashboard', (req, res) => {
    if (req.session.loggedIn == true) {
        console.log(req.session.username)
        db.collection('creations').find({
            username: req.session.username
        }).toArray(function (err, data) {
            if (err) throw err;
            res.render('dashboard.hbs', {
                title: "MusiFy | Dashboard",
                style: '/css/dashboard.css',
                script: '/js/dashboard.js',
                data: data,
            })
        })
    } else {
        res.redirect('/login')
    }
})

//get route to explore all creations set as public

app.get('/dashboard/explore', (req, res) => {
    if (req.session.loggedIn == true) {
        db.collection('creations').find({
            privacy: true
        }).toArray(function (err, data) {
            if (err) throw err;
            res.render('dashboard.hbs', {
                title: "MusiFy | Dashboard",
                style: '/css/dashboard.css',
                script: '/js/dashboard.js',
                data: data,
            })
        })
    } else {
        res.redirect('/login')
    }
})

////////////////////////////////////////////////
///////////// composer routes //////////////////
////////////////////////////////////////////////

//delete route
app.delete('/creations/delete/:id', (req, res) => {
    if (req.session.loggedIn == true) {
        db.collection('creations').deleteOne({
            _id: ObjectId(req.params.id)
        }, function (err, data) {
            if (err) throw err
        })
    } else {
        res.redirect('/login')
    }
})

////username is assigned as req.session.username use that accordingly