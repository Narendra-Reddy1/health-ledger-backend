const { ethers } = require("ethers");
const UserModel = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const { JsonRpcProvider } = require("ethers");
const { tokenContract, getTokenContract, getProvider, getDefaultRunner } = require("../core/contracts");



exports.createWallet = async (req, res) => {
    try {

        const username = req.params.username;
        //if only user name? then any one can trigger this API to create wallet. PREVENT ITT
        const user = await UserModel.findOne({ username: username });
        if (user.wallet != null | undefined) {
            return res.status(409).send(JSON.stringify({
                message: "wallet already exists"
            }))
        }
        const wallet = ethers.Wallet.createRandom()
        const encryptedWallet = await wallet.encrypt(req.body.passkey);
        user.publicKey = wallet.address
        user.wallet = encryptedWallet;
        user.pin = bcrypt.hashSync(req.body.passkey)
        await user.save();
        res.send(JSON.stringify({
            publicKey: wallet.address,
        }))
    }
    catch (e) {
        console.log(e);
        res.status(500).send(JSON.stringify(e));
    }
}



exports.getBalance = async (req, res) => {
    try {

        const username = req.params.username;
        console.log("req: ", username);
        const user = await UserModel.findOne({ username: username })
        if (user == (null | undefined)) return res.status(404).send(JSON.stringify({
            message: "user not found"
        }))
        const publicKey = user.publicKey;
        //const publicKey = "0xBE60EfCE791c19836F06b54B9E827b7d91b7DDD8";



        const tokenBalance = await (getTokenContract().connect(getDefaultRunner())).balanceOf(user.publicKey);
        res.send(JSON.stringify({
            publicKey: user.publicKey,
            balances: {
                tokens: tokenBalance.toString()
            }
        }))
    }
    catch (e) {
        console.log(e);
        res.status(500).send(JSON.stringify(e));
    }
}
