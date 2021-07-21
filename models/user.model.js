const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const User = new Schema(
    {
        emailID: {type:String, required:true, unique:true},
        userID : {type: String, required:true, unique:true},
        password: {type: String, required:true},
        OTP: {type:String}
    }
)

module.exports = Mongoose.model('userinfos',User);