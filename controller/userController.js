const res = require('express/lib/response');
const User = require('../model/userModel');

exports.getAllUser = async (req, res) => {
    const allUser = await User.find();

    if (!allUser || allUser.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'No user registered yet'
        })
    }

    res.status(200).json({
        success: true,
        numberOfUser: allUser.length,
        data: {

            users: allUser
        }
    })
}

exports.getSingleUser = async (req, res) => {

    const findUser = await User.findById(req.params.id);
    if (!findUser) {
        return res.status(400).json({
            success: false,
            message: 'User doesnt exist'
        })
    }

    res.status(200).json({
        success: true,
        data: {
            user: findUser
        }
    })
}

exports.updateUserSelf = async (req, res) => {
    let userDetail = await User.findById(req.params.id);

    if (!userDetail) return res.status(400).json({
        success: false,
        message: 'User does not exist'
    })

    userDetail = await User.findByIdAndUpdate(userDetail.id, req.body, { new: true, runValidators: true })

    res.status(200).json({
        success: true,
        data: {
            user: userDetail
        }
    })
}

exports.deleteUser = async (req, res) => {

    let removeUser = await User.findById(req.params.id);
    if (!removeUser) return res.status(400).json({
        success: false,
        message: 'User does not exist'
    })
    removeUser = await User.findByIdAndRemove(removeUser.id);

    res.status(203).json({
        success: true,
        message: 'User has been removed'
    })
}

