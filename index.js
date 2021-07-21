const Express = require('express');
const Mongoose  = require('mongoose');
const JWT = require('jsonwebtoken');
const Dotenv  = require('dotenv');
const routes = require('./route');
const cors = require('cors');
const Passport = require('passport');
const Github = require('passport-github').Strategy;
const Twitter = require('passport-twitter').Strategy;
const Session = require('express-session');
let user = {};

Dotenv.config();

const app = Express();
app.set('trust proxy', 1);
app.use(Session({
  cookie: {
    sameSite:'none',
    secure: true,
    maxAge: 86400000
  },
  secret: "secretKey", 
  resave: true,
  saveUninitialized: true
}));

Passport.serializeUser((user,cb)=>{cb(null,user.id)}); 
Passport.deserializeUser((id,cb)=>{cb(null,id)});
app.use(Passport.initialize());

Passport.use(new Github(
  {
    clientID : process.env.PGITHUB_CLIENT_ID,
    clientSecret : process.env.PGITHUB_CLIENT_SECRET,
    callbackURL : "/auth/github/callback"
  },async(accessToken, refreshToken, profile, cb) =>
  {
    console.log(profile);
    const token = await JWT.sign({_id:profile.id},process.env.PRIVATE_KEY, {expiresIn:'24h'});
    user = {token: token};
    return cb(null, profile) 
  }));

// Passport.use(new Twitter(
//   {
//     consumerKey : process.env.TWITTER_CLIENT_ID,
//     consumerSecret : process.env.TWITTER_CLIENT_SECRET,
//     callbackURL : "/auth/twitter/callback"
//   },async(accessToken, refreshToken, profile, cb) =>
//   {
//     console.log(profile);
//     const token = await JWT.sign({_id:profile.id},process.env.PRIVATE_KEY, {expiresIn:'24h'});
//     user = {token: token};
//     return cb(null, profile) 
//   }));

app.use(cors());
app.use(Express.json());

app.get('/auth/github', Passport.authenticate("github") )
app.get('/auth/github/callback', Passport.authenticate("github"),(req,res)=>
{
  res.redirect(`${process.env.FRONTEND_URL}/verifyLocations`)
})

app.get('/auth/twitter', Passport.authenticate("twitter") )
app.get('/auth/twitter/callback', Passport.authenticate("twitter"),(req,res)=>
{
  res.redirect(`${process.env.FRONTEND_URL}/verifyLocations`)
})

app.get('/',(req,res)=>{res.send('Welcome')})
app.get('/getToken', (req,res)=>{res.send(user)})
app.get('/logout',(req,res)=>{user = {}; res.send(user)})

// Mongoose.connect(process.env.MONGO_DB_URL, 
//     {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       useCreateIndex: true,
//       useFindAndModify: false
//      }
// )
app.listen(process.env.PORT|| 5000, ()=>{console.log(" server is listening at 5000")});

//app.post("/user/",(req,res)=>{console.log(req.body)})
routes(app);
