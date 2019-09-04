var express = require('express');
var app = express();

//port
var port = 3000;

//view Engine
var hbs = require('hbs');
app.set('view engine', 'hbs');


//Static Asset Declaration
app.use(express.static(__dirname + '/public'));

//bodyParser Setup
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//Database
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017';
var DbName = 'musify';
var db;

//connecting to DataBase
MongoClient.connect(url, { useUnifiedTopology: true, useNewUrlParser: true }, function (err, client) {
    if (err) throw err
    console.log('DB connected')
    db = client.db(DbName);
})


//importing ObjectId
ObjectId = require('mongodb').ObjectID

//starting Server
app.listen(port);
console.log('play it on port : ' + port)

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/home.html');
})
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
})
app.get('/signup', (req, res) => {
    res.sendFile(__dirname + '/public/signup.html');
})

