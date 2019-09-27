const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    if (req.session.loggedIn == true) {
        db.collection('creations').find({
            userid: req.session.userid
        }).toArray(function (err, data) {
            if (err) throw err;
            const linkData = {
                'link':'/dashboard/explore',
                'linkTitle':'Explore > ',
            }
            res.render('dashboard.hbs', {
                title: "MusiFy | Dashboard",
                script: '/js/dashboard.js',
                data: data,
                linkData: linkData,
                username: req.session.username,
                avatar: 'http://res.cloudinary.com/jayshah/image/upload/w_300,h_300,c_thumb,g_face/' + req.session.public_id + '.jpg',
            });
        });
    } 
    else
        res.redirect('/login');
})

//get route to explore all creations set as public

router.get('/explore', (req, res) => {
    if (req.session.loggedIn == true) {
        db.collection('creations').find({privacy: true}).toArray(function (err, data) {
            if (err) 
                throw err;
            else if(data.length==0){
                const linkData = {
                    'link':'/dashboard',
                    'linkTitle':'< Back ',
                }
                res.render('dashboard.hbs', {
                    title: "MusiFy | Dashboard",
                    script: '/js/dashboard.js',
                    data: data,
                    linkData:linkData,
                    avatar: 'http://res.cloudinary.com/jayshah/image/upload/w_300,h_300,c_thumb,g_face/' + req.session.public_id + '.jpg',
                });
            }            
           else{
                let counter=0;
                let userIdArray = [];
                let obj = {};

                for(let i=0;i<data.length;i++){
                    if(userIdArray.includes(data[i].userid))
                        continue;
                    else
                        userIdArray.push(data[i].userid);
                }   

                for(let i=0;i<userIdArray.length;i++){
                    db.collection('users').findOne({_id:ObjectId(userIdArray[i])},{projection:{username:1}},function(err, result){
                        if(err)
                            throw err;
                        obj[userIdArray[i]] = result.username;
                        count();
                    });
                }

                function count(){
                    counter++;
                    if(counter==userIdArray.length){
                        for(let i=0;i<data.length;i++){
                            data[i]["username"] = obj[data[i].userid];
                        }
                        const linkData = {
                            'link':'/dashboard',
                            'linkTitle':'< Back ',
                        }
                        res.render('dashboard.hbs', {
                            title: "MusiFy | Dashboard",
                            script: '/js/dashboard.js',
                            data: data,
                            linkData:linkData,
                            avatar: 'http://res.cloudinary.com/jayshah/image/upload/w_300,h_300,c_thumb,g_face/' + req.session.public_id + '.jpg',
                        });    
                    }
                }
            }
        });
    } 
    else
        res.redirect('/login')
});

module.exports = router;