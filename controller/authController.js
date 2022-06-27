const crypto = require('crypto')
const User = require("../model/userModel");
const catchAsync = require("../utils/catchAsyncError");
const GlobalError = require("../utils/globalError");
const sharp = require("sharp");
const multer = require("multer");
const {generateToken, verifyToken} = require('../utils/jwtTokenHandler');
const sendResetEmail = require('../utils/passwordResetMail');

const filterObj =(obj, ...fields)=>{
const newObj = {};
    Object.keys(obj).forEach(el=>{
        if(fields.includes(el)) newObj[el] = obj[el]
    })

    return newObj;
        
}

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
        cb(null, true);
    } else {
        cb(
            new GlobalError("Invalid file type. Please upload image only", 400),
            false
        );
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});

exports.uploadUserImage = upload.single("userImage");

exports.resizeUserImage = (req, res, next) => {
    if (!req.file) return next();
    req.file.filename = `NewUser-${Date.now()}-user.jpeg`;

    sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/${req.file.filename}`);
    next();
};

exports.signUpUser = catchAsync(async (req, res) => {
    if (req.body.password.match(/^[a-zA-Z][0-9]$/)) {
        return next(
            new GlobalError("Password must contain both number and letter", 401)
        );
    }
    const newUser = await User.create({
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        userImage: req.file.filename,
        role: req.body.role,
    });

    const token = generateToken(newUser)
    res.status(201).json({
        success: "true",
        token,
        data: {
            user: newUser,
        },
    });
});

//!Login function

exports.logInUser = catchAsync(async (req, res, next) => {
    //!first to provide login function we need email and password from request body
    const { email, password } = req.body;

    //!check we have both emil and password
    if (!email || !password) {
        return next(new GlobalError("Email and Password is required field", 401));
    }
    //!then we need to check if email is registered or not
    const user = await User.findOne({ email }).select("+password");

    //!function to compre user input pwd with encrypted password in database
    if (!user || !(await user.checkPwdEncryption(password, user.password))) {
        return next(
            new GlobalError(
                "Either email or password didnt match user credentials",
                401
            )
        );
    }
    const token = generateToken(user)
    if (user) {
        res.status(200).json({
            success: true,
            token,
        });
    }
});

exports.protectRoute = catchAsync(async (req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }
    //!checking if the signature is valid
    const decoded = await verifyToken(token);

    //!check if user exist
    const existUser = await User.findById(decoded.id);

    if (!existUser) {
        return next(new GlobalError('User doesnt exist for the generated token. Please check credentials', 401))
    }

    //!check if user has changed password after token was generated
    if (existUser.checkIfPswdChanged(decoded.iat)) {
        return next(new GlobalError('User has changed password recently.', 401))
    }

    req.user = existUser;
    next();
});

exports.authorizationRoutes = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {

            return next(new GlobalError(' You do not have access to complete this action', 403));
        }

        next();
    }
}

exports.forgetPassword = catchAsync(async(req,res,next)=>{

    if(!req.body.email){
        return next(new GlobalError('Please provide email address', 400 ))
    }
    const user = await User.findOne({email:req.body.email});

    if(!user){
        return next (new GlobalError('No user is registered with provided email', 404))
    }

    const resetToken = user.generatePasswordResetToken();
    await user.save({validateBeforeSave:false});

    //!defining url to password reset and sending email

    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? If yes then use this link to reset your password using PATCH request on ${resetURL} URL
    \n If this is not what you have requested please kindly ignore this email. \n Thank You `;
    
try{

    await sendResetEmail({
        email:user.email,
        subject:'Your password reset link (This token will expire in 10 minutes)',
        message
    })
    res.status(200).json({
        success:'success',
        message:'Token sent to email'
    })
}
 catch(err){

    user.passwordResetToken = undefined;
    user.passwordTokenExpire= undefined;
    await user.save({validateBeforeSave:false});

    return next(new GlobalError('Something went wrong while sending email to user'), 500);
}

})
  
exports.resetPassword = catchAsync(async(req,res,next)=>{

    if(req.params.token.length<64){
        return next (new GlobalError('Please provide valid token'), 400)
    }

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({passwordResetToken: hashedToken,
         passwordResetToken:{
            $gt:Date.now()
         }}).select('+password')

         if(!user){
            return next(new GlobalError('Invalid reset token or token has expired'), 400)
         }
    
     const newPassHash = await user.checkPwdEncryption(req.body.password, user.password)
if (newPassHash){
    return next(new GlobalError('Thats your current password. Either login or provide new password'))
}
         user.password = req.body.password;
         user.confirmPassword = req.body.confirmPassword;
         user.passwordResetToken=undefined;
         user.passwordTokenExpire=undefined;
         await user.save();

         const token = generateToken(user);
         res.status(200).json({
            success:'true',
            token
         })


})

exports.updatePassword = catchAsync(async(req,res,next)=>{
    const user = await User.findById(req.user.id).select('+password');
    if(!user){
        return next(new GlobalError('This is protected route, so must log in.'),403)
    }
   if(!req.body.currentPassword){
    return next(new GlobalError('Please provide your current password'), 400)
   }
   const comparePassword = await user.checkPwdEncryption(req.body.currentPassword, user.password)

   if(!comparePassword){
    return next(new GlobalError('Password wrong, please provide correct password'),400)
   }

   if(!req.body.password || !req.body.confirmPassword){
    return next (new GlobalError('Password and password confirm field is required'),400)
   }

   user.password=req.body.password;
   user.confirmPassword =req.body.confirmPassword
   await user.save()
   const token = generateToken(user)
   res.status(200).json({
    success:'true',
    token
   })
})

exports.updateMe = catchAsync(async (req,res,next)=>{

    

    if(req.body.password|| req.body.confirmPassword){
        return next(new GlobalError('To update your password follow "/updatePassword" '))
    }

    const filteredBody = filterObj(req.body, 'email'  ) 
    const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new:true,
        runValidators:true
    });
    if(!user){
        return next (new GlobalError('No user found for email'),404)
    }

})