// Importing imported package
const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcrypt');
const saltRounds = 10; 
const { UserModel } = require('../DB/DBmodel.js')


passport.use(new LocalStrategy(async function verify(username, password, cb) {
    try {
        const user = await UserModel.findOne({username: username.trim()}).exec()
        
        if(user){
            bcrypt.compare(password, user.password, function(err, result) {
                if(result){
                    return cb(null, user)
                }else{
                    return cb(null, false, { message: 'Incorrect username or password.' });
                }
            });
        }else{
            return cb(null, false, { message: 'Incorrect username or password.' });
        } 
    } catch (error) {
        console.log(error.message);
        throw new Error("Something went wrong")
        
    }
    
    
}));

const signup = async (req, res, next) => {
    try {
        const user = await UserModel.findOne({username: req.body.username}).exec()
        if(!user){
            bcrypt.hash(req.body.password, saltRounds, async function(err, hash) {
                if(err){throw new Error("Can't encrypt the password")}
                // Store hash in your password DB.
                const user = await UserModel.create({
                    "username": req.body.username.trim(),
                    "password": hash,
                    "image": req.body.image
                })
                user.save()
                req.logIn(user, (err) =>{
                if(err) { throw new Error('Something wrong happened, try again.') }
                res.redirect('/')
                })
            });
          
          
        }else{
          throw new Error('Username already exist')
        }
      } catch (error) {  
        res.status(500).send(error.message)
      }
}

passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      cb(null, { id: user.id, username: user.username, image: user.image });
    });
});

passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
        return cb(null, user);
    });
});  


module.exports = {passport, signup};