const User = require('../models/user.model');
const JWT = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

// User signup
const create = async(req,res) =>
{
    console.log("Create user");
    console.log(req.body);
    let status;
    let message;
    let myToken;

    try
    {
        const salt =  await bcrypt.genSalt(10);
        const hashPW = await bcrypt.hash(req.body.password, salt);

        const user = new User({
            emailID : req.body.email,
            userID : req.body.user,
            password : hashPW
        })

        await user.save();
        status = 200;
        const token = await JWT.sign({_id:user._id},process.env.PRIVATE_KEY,{expiresIn:'24h'});
        let transporter = nodemailer.createTransport({
            service:"gmail",
             // true for 465, false for other ports
            auth: {
              user: process.env.emailID, // generated ethereal user
              pass: process.env.password, // generated ethereal password
            },
          });
        let mailOption={
          from: process.env.emailID, // sender address
          to: req.body.email, // list of receivers
          subject: "Welcome mailer", // Subject line
        text:"UserName:"+ req.body.user+ "Password: "+ req.body.password
        }
          // send mail with defined transport object
            await transporter.sendMail(mailOption)
            .then((data)=>{console.log("Emai Sent")})
            .catch((error)=>{console.log(error)})
             
         
          // from: "Prateek Jain", // sender address
          // to: email, // list of receivers
          // subject: "Welcome", // Subject line
          // html: "<b>Hello world?</b>", // html body
           
        message = 'User created successfully';
        myToken = token;
    }
    catch(err)
    {
        console.log(err);
        status = 400;
        message = 'Error occured';
    }
    res.status(status).json({message, myToken});

}

// user login
const login = async(req,res) =>
{
    let status;
    let message;
    let myToken;
    try
    {
        const user = await User.findOne({userID: req.body.user });
       
        if(!user)
        {
            status = 400;
            message = "User does not exist"
        }
        else
        {
            const validPW = await bcrypt.compare(req.body.password, user.password);
            if(validPW)
            {
                const token = await JWT.sign({_id:user._id},process.env.PRIVATE_KEY, {expiresIn:'24h'});
                status = 200;
                message = "User signed in successfully";
                myToken = token;
            }
            else
            {
                status = 400;
                message = "Password is not correct";
            }   
            
        }
        
    }
    catch(err)
    {
        status = 400;
        message = " Error occured"
        console.log(err);
    }
    res.status(status).json({message, myToken});
}

const verifyOTP = async(req,res) =>
{
    let status;
    let message;
    let myToken;
    try
    {
        const user = await User.findOne({emailID: req.body.email});
       
        if(!user)
        {
            status = 400;
            message = "User does not exist"
        }
        else
        {
            const [otp,time] = user.OTP.split('?'); 
            const validPW = await bcrypt.compare(req.body.otp, otp);
            const validTime = new Date().getTime() < time 
            if(validPW && validTime)
            {
                const token = await JWT.sign({_id:user._id},process.env.PRIVATE_KEY,{expiresIn:'24h'});
                status = 200;
                message = "User signed in successfully";
                myToken = token;
            }
            else
            {
                status = 400;
                message = "Password is not correct";
            }   
            
        }
        
    }
    catch(err)
    {
        status = 400;
        message = " Error occured"
        console.log(err);
    }
    res.status(status).json({message, myToken});
}

const loginOTP = async(req,res)=>
{
    const _OTP = Math.floor(1000 + Math.random() * 9000);
    try
    {
        console.log(req.body.email);
        const salt =  await bcrypt.genSalt(10);
        const hashOTP = await bcrypt.hash(_OTP.toString(), salt);
        const dt = new Date();
        dt.setMinutes(dt.getMinutes()+ 1);
        const dataOTP= `${hashOTP}?${dt.getTime()}`;

        const user = await User.findOneAndUpdate({emailID:req.body.email},{$set:{OTP:dataOTP}});

        if(!user)
        {
            return res.status(400).json({message:"User does not exist"});
        }
        let transporter = nodemailer.createTransport({
        service:"gmail",
         // true for 465, false for other ports
        auth: {
          user: process.env.emailID, // generated ethereal user
          pass: process.env.password// generated ethereal password
        },
      });
    let mailOption={
      from: process.env.emailID, // sender address
      to: req.body.email, // list of receivers
      subject: "Welcome mailer", // Subject line
        text:"otp is :"+ _OTP
    }
      // send mail with defined transport object
        await transporter.sendMail(mailOption)
        .then((data)=>
        {
            console.log("Email Sent");
            res.status(200).json({message:_OTP})
        })
        .catch((error)=>{console.log(error);
            res.status(400).json({message:"error occured"})})
        
    }
    catch(err)
    {
        console.log(err);
        res.status(400).json({message:"error occured"});
    }
}
const resetPW = async(req,res)=>
{
    try
    {
        const salt =  await bcrypt.genSalt(10);
        const newHashPW = await bcrypt.hash(req.body.newPass, salt);   
        const user = await User.findOneAndUpdate({emailID:req.body.email},{$set:{password:newHashPW}});
        if(!user)
        {
            res.status(400).json({message:"Please try again"});
        }
        else
        {
            res.status(200).json({message:"Reset successful"});
        }
    }
    catch(err)
    {
        console.log(err);
        res.status(400).json({message:"Some error occured"});
    }
}

module.exports = {create, login, loginOTP, verifyOTP, resetPW};