const express = require('express')
const router = express.Router();
const md5 = require('md5');

router.get('/', (req, res) => {
    if(req.session.loggedIn)
        res.redirect('/dashboard');
    else{
        res.render('login.hbs',{
            layout:false
        });
    }
});

router.post('/', (req, res) => {
    let pwd = md5(req.body.password); 
    db.collection('users').findOne({'username':req.body.username, 'password':pwd}, function(error, result){
        if(error)
            throw error;
        if(result==null){
            res.render('login.hbs',{
                layout:false,
                error:"Invalid username or password"
            });
        }
        else{
            req.session.userid = result._id;
            req.session.username = result.username;
            req.session.public_id = result.public_id;
            req.session.loggedIn = true; 
            res.redirect('/dashboard');
        }
    });
});

module.exports = router