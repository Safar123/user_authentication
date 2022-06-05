const User = require('../model/userModel');

exports.signUpUser = async (req, res)=>{

    const newUser = await User.create({
        username:req.body.username,
        email:req.body.email,
        password:req.body.password,
        confirmPassword:req.body.confirmPassword,
        userImage:req.body.userImage
    })

    if(!newUser) return res.status(500).json({
        success:'fail',
        message:'Something went wrong'
    })

    res.status(201).json({
        success:'true',
        data:{
            user:newUser
        }
    })
}