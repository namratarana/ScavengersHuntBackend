const Express = require('express');
const User = require('./models/user.model');
const JWT = require('jsonwebtoken')
const userController = require('./controllers/user.controller');
const userRouter = Express.Router();
const Passport = require('passport');

userRouter.post('/', userController.create);
userRouter.post('/login', userController.login);
userRouter.put('/getOTP',userController.loginOTP)
userRouter.post('/verifyOTP', userController.verifyOTP);
userRouter.put('/resetPass', userController.resetPW);

userRouter.get('/data',verify,(req,res)=>
{
    try 
    {
         User.findById({_id:decodedData._id},(error,data)=>
         {
            return res.status(200).json({name:data});
        });
    } 
    catch (error)
    {
        console.log("error");
    
    }
    
})
    
let decodedData ="";
    
//verify token

function verify(req,res,next)
{
    const token = 
    req.query.token;
    
    if (!token)
    return res.status(400).json({message:'Access Denied'});

    try 
    {
        const verified = JWT.verify(token,process.env.PRIVATE_KEY);
        decodedData = verified;
        console.log(verified);
        next();
    } 
    catch (error)
    {
        console.log(error);
        return res.status(400).json({message:'Token Expired'});
    
    }
}
const routes = (app)=>{
    app.use('/user',userRouter);
}

module.exports = routes;