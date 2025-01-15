const express = require('express');
const {UserModel} = require("../DB/DBmodel")
const {passport, signup} = require("../Controller/passport.js")

const router = express.Router();





router.get('/login', function(req, res, next) {
  res.status(500).send('Log in fails, username or password incorrect!');
});
router.get('/', function(req, res, next) {   
  if(req.user){
    res.status(200).send(req.user)
  }else{
    res.status(400).json('User not defined')
  }
});


 
router.post('/login/password', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login'
}));

// Sing up router
router.post('/signup', signup);

router.post('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); } 
    res.status(200).send("Log out success!");
  });
});

 

module.exports = router;