const GlobalError = require("./globalError");

const generateToken = (user)=>{

    const token = user.webToken(user._id);
    if(!token){
        return next (new GlobalError('Generating token failed', 400))
    }
    return token
}

module.exports = generateToken