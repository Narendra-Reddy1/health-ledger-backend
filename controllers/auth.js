const { ethers } = require("ethers");
const bcrypt = require("bcryptjs")
const UserModel = require("../models/User");
const { getTokenContract, getDefaultRunner } = require("../core/contracts");

exports.postSignup = async (req, res) => {
    //const walletData = await createWallet();
    try {

        const existedUser = await UserModel.findOne({ username: req.body.username });
        if (existedUser) {
            return res.status(409).send(JSON.stringify({
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
            username: user.username,
            steps: user.stepsCount
        }));
    }
    catch (e) {
        console.log(e);
        res.status(500).send(JSON.stringify(e));
    }
}

exports.postLogin = async (req, res) => {
    try {

        const user = await UserModel.findOne({ username: req.body.username });
        const isMatched = await bcrypt.compare(req.body.password, user.password);
        if (!isMatched || !user) {
            return res.status(404).send(JSON.stringify({
                message: "Invalid credentials"
            }))
        }
        let tokenBalance = 0;
        if (user.publicKey)
            tokenBalance = (Number)(await getTokenContract().connect(getDefaultRunner()).balanceOf(user.publicKey))
        res.status(200).send(JSON.stringify({
            user: {
                username: user.username,
                stepsCount: user.stepsCount,
                publicKey: user.publicKey,
                balance: tokenBalance
            }
        }))
    }
    catch (e) {
        console.log(e);
        res.status(500).send(JSON.stringify(e));
    }
}
