const GlobalError = require("./globalError");
const jwt =require('jsonwebtoken');
const { promisify } = require('util')

exports.generateToken = (user,statusCode, res)=>{

    const token = user.webToken(user._id);

    const cookieOption ={
        expire:new Date(Date.now())+ process.env.JWT_COOKIE_EXPIRE*24*60*60*1000,
        httpOnly:true
    }

    if(process.env.DEV_MODE==='production') cookieOption.secure=true;

    user.password =undefined;

    res.cookie('jwt', token, cookieOption)


    if(!token){
        return next (new GlobalError('Generating token failed', 400))
    }
   res.status(statusCode).json({
    status:'success',
    token,
    data:{
        user
    }
   })
}

exports.verifyToken = async (vToken)=>{

   const verified= await promisify(jwt.verify)(vToken, process.env.JWT_SECRET);
   if(!verified){
    return next(new GlobalError ('JWT token verification failed', 403))
   }

   return verified
}