const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const res = require('express/lib/response');

const userSchema = new mongoose.Schema({

    username:{
        type:String,
        required:[true, 'Please provide valid username'],
        unique:[true, 'User name already exist try something new'],
        lowercase:true,
        trim:true
    },

    email:{
        type:String,
        required:[true, 'Please provide valid email address'],
        unique:[true, 'Email already exist provide new email or Login'],
        validate:[validator.isEmail, 'Please provide valid email format'],
        lowercase:true,
        trim:true
    },

    password:{
        type:String,
        required:[true, 'Please provid valid password'],
        minlength:[8, 'Password must be atleast 8 character long'],
        select:false,
    },

    confirmPassword:{
        type:String,
        required:[true, 'Confirm password must match the initial password'],
        validate:{
            //*compare confirmpassword with password. Function allow us to validate and pass message
        validator: function(el){
            return el === this.password
        }
        },

        message: 'Password did not match'
    },

    userImage:{
        type:String,
        default:'user.jpg'
    },

    role:{
        type:String,
        enum:[ 'user', 'admin', 'superadmin'],
        default:'user'
    },

    createdAt:{
        type:Date,
        default:Date.now
    }
})

userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next;
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword= undefined;
})

//*in schema we have an access to method properties to create function

userSchema.methods.checkPwdEncryption = async function(userPwd, encryptedPwd){

    return await bcrypt.compare(userPwd, encryptedPwd)

    //*this function hs 2 parameter one will be plain pwd and one encrypted which is the compared using bcrypt.compare

}

const User = mongoose.model('User', userSchema);
module.exports = User;