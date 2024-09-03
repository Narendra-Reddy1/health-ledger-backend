const { ethers } = require("ethers");
const UserModel = require("../models/UserModel");
const bcrypt = require("bcryptjs")


module.exports.createWallet = async (req, res) => {
    const username = req.body.username;
    //if only user name? then any one can trigger this API to create wallet. PREVENT ITT
    const user = await UserModel.findOne({ username: username });
    if (user.wallet != null | undefined) {
        return res.status(409).send(JSON.stringify({
            status: 409,
            message: "wallet already exists"
        }))
    }
    const wallet = ethers.Wallet.createRandom()
    const encryptedWallet = await wallet.encrypt(req.body.passkey);
    user.wallet = encryptedWallet;
    user.pin = bcrypt.hashSync(req.body.passkey)
    await user.save();
    console.log(user.toJSON())
    res.send(JSON.stringify({
        status: 201,
        publicKey: wallet.address,
    }))
}

module.exports.getBalance = async (req, res) => {

}