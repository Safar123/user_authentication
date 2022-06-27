const User = require("../model/userModel");
const GlobalError = require("../utils/globalError");
const catchAsync = require("../utils/catchAsyncError");

exports.getAllUser = catchAsync(async (req, res, next) => {
    const allUser = await User.find();

    if (!allUser || allUser.length === 0) {
        return next(new GlobalError("No user listed yet", 404));
    }

    res.status(200).json({
        success: true,
        numberOfUser: allUser.length,
        data: {
            users: allUser,
        },
    });
});

exports.getSingleUser = catchAsync(async (req, res, next) => {
    const findUser = await User.findById(req.params.id);
    if (!findUser) {
        return next(
            new GlobalError(`User doesn't exist for ${findUser.id} ID`, 404)
        );
    }

    res.status(200).json({
        success: true,
        data: {
            user: findUser,
        },
    });
});

exports.updateUserSelf = catchAsync(async (req, res, next) => {
    let userDetail = await User.findById(req.params.id);

    if(req.user.id !==userDetail.id){
        return next (new GlobalError('You can not update someone else information', 403))
    }

    if (!userDetail)
        return next(
            new GlobalError(`User doesn't exist for ${userDetail.id} ID`, 404)
        );

    userDetail = await User.findByIdAndUpdate(userDetail.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        data: {
            user: userDetail,
        },
    });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
    let removeUser = await User.findById(req.params.id);
    if (!removeUser)
        return next(
            new GlobalError(`User doesn't exist for ${removeUser.id} ID`, 404)
        );

    removeUser = await User.findByIdAndRemove(removeUser.id);

    res.status(203).json({
        success: true,
        message: "User has been removed",
    });
});
