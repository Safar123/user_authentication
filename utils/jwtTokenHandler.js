const GlobalError = require("./globalError");
const jwt =require('jsonwebtoken');
const { promisify } = require('util')

exports.generateToken = (user)=>{

    const token = user.webToken(user._id);
    if(!token){
        return next (new GlobalError('Generating token failed', 400))
    }
    return token
}

exports.verifyToken = async (vToken)=>{

   const verified= await promisify(jwt.verify)(vToken, process.env.JWT_SECRET);
   if(!verified){
    return next(new GlobalError ('JWT token verification failed', 403))
   }

   return verified
}