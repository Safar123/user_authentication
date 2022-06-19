const User = require("../model/userModel");
const catchAsync = require('../utils/catchAsyncError');
const GlobalError = require('../utils/globalError');
const sharp = require('sharp')
const multer = require('multer');

//!Storing image on file on some folder structure using option like (destination)
// const multerStorage = multer.diskStorage({

//     destination:(req, file, cb)=>{
//         cb(null, 'public/img')
//     },

//     filename:(req, file, cb)=>{
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${Date.now()}.${ext}`)
//     }
// })

const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true)
    } else {
        cb(new GlobalError('Invalid file type. Please upload image only', 400), false)
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})

exports.resizeUserPhoto = async (req, res, next)=>{
    if (!req.file) return next();

    req.file.filename= `user-${Date.now()}.jpeg`
    sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/${req.file.filename}`)

    next();
}



exports.signUpUser = catchAsync(async (req, res) => {

    if (req.body.password.match(/^[a-zA-Z][0-9]$/)) {
        return res.status(400).json({
            success: false,
            message: "Password must contain both number and alphabet",
        });
    }

    const newUser = await User.create({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        userImage: req.file.filename,
        role: req.body.role
    });

    res.status(201).json({
        success: "true",
        data: {
            user: newUser,
        },
    });
});

exports.uploadUserPhoto = upload.single('userImage');

//!Login function

exports.logInUser = catchAsync(async (req, res, next) => {
    //!first to provide login function we need email and password from request body
    const { email, password } = req.body;

    //!check we have both emil and password
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Both email and Password is required to login",
        });
    }
    //!then we need to check if email is registered or not
    const user = await User.findOne({ email }).select("+password");

    //!function to compre user input pwd with encrypted password in database
    if (!user || !(await user.checkPwdEncryption(password, user.password))) {
        return res.status(400).json({
            success: "fail",
            message: " Either email or password is wrong",
        });
    }

    if (user) {
        res.status(200).json({
            success: true,
            message: "User login successful",
        });
    }
});
