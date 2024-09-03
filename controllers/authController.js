const { ethers } = require("ethers");
const bcrypt = require("bcryptjs")
const UserModel = require("../models/UserModel");

exports.postSignup = async (req, res) => {
    //const walletData = await createWallet();
    const existedUser = await UserModel.findOne({ username: req.body.username });
    if (existedUser) {
        return res.status(409).send(JSON.stringify({
            status: 409,
            message: "conflicting usernames"
        }))
    }
    const hash = bcrypt.hashSync(req.body.password);
    const user = await UserModel.create({
        username: req.body.username,
        password: hash,
        stepsCount: 0,
    })
    await user.save();
    res.status(201).send(JSON.stringify({
        status: 201,
        username: user.username,
        steps: user.stepsCount
    }));
}

exports.postLogin = async (req, res) => {
    //fetch user data,
    //fetch wallet data
}

async function createWallet(password) {
    const wallet = ethers.Wallet.createRandom();
    const str = await wallet.encrypt(password);
    return str;
}
