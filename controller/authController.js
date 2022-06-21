const { promisify } = require('util')
const User = require("../model/userModel");
const catchAsync = require("../utils/catchAsyncError");
const GlobalError = require("../utils/globalError");
const sharp = require("sharp");
const multer = require("multer");
const jwtTokenHandler = require('../utils/jwtTokenHandler');


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

    const token = jwtTokenHandler(newUser)
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
    const token = jwtTokenHandler(user)
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
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

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
