const User = require('../model/userModel');
exports.signUpUser = async (req, res)=>{

    if (req.body.password.match(/^[a-zA-Z][0-9]$/ )){
        return res.status(400).json({
            success:false, 
            message:'Password must contain both number and alphabet'
        })
     }

    const newUser = await User.create({
        username:req.body.username,
        email:req.body.email,
        password:req.body.password,
        confirmPassword:req.body.confirmPassword,
        userImage:req.body.userImage
    })

    
 
    res.status(201).json({
        success:'true',
        data:{
            user:newUser
        }
    })
}

//!Login function

exports.logInUser = async(req, res)=>{
//!first to provide login function we need email and password from request body
const {email, password}= req.body;
//!check we have both emil and password
if(!email || !password){
    return res.status(400).json({
        success:false,
        message:'Both email and Password is required to login'
    })
}
//!then we need to check if email is registered or not
const user = await User.findOne({email}).select('+password');
//!as our saved pwd is encrypted we need to compare it using same algorithm, we need to define compare functionality in user model

if(!user || ! await user.checkPwdEncryption(password, user.password)){
    return res.status(400).json({
        success:'fail',
        message:' Either email or password is wrong'
    })
}

if(user){
    res.status(200).json({
        success:true,
        message:'User login successful'
    })
}

    
}