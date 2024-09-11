const { ethers } = require("ethers");
const UserModel = require("../models/User");
const bcrypt = require("bcryptjs");
const { getTokenContract, getProvider, getDefaultRunner, getOwner } = require("../core/contracts");



exports.createWallet = async (req, res) => {
    try {
        const username = req.params.username;
        const passkey = req.body.passkey;

        //if only user name? then any one can trigger this API to create wallet. PREVENT ITT
        // if (passkey.length < 6) {
        //     return res.status(400).send(JSON.stringify({
        //         message: "Secuirity Pin is short"
        //     }))
        // }
        const user = await UserModel.findOne({ username: username });
        if (user.wallet != null | undefined) {
            return res.status(409).send(JSON.stringify({
                message: "wallet already exists"
            }))
        }
        const wallet = ethers.Wallet.createRandom(getProvider())
        const encryptedWallet = await wallet.encrypt(passkey);
        user.publicKey = wallet.address
        user.wallet = encryptedWallet;
        user.pin = bcrypt.hashSync(req.body.passkey)
        await user.save();
        res.send(JSON.stringify({
            user: {
                publicKey: wallet.address,
                balance: 0
            }
        }))
    }
    catch (e) {
        console.log(e);
        res.status(500).send(JSON.stringify({
            error: e
        }));
    }
}

exports.getUserInfo = async (req, res) => {
    const user = await UserModel.findOne({ username: req.params.username });
    if (!user) {
        return res.status(404).send(JSON.stringify({
            message: `User not found with username: ${req.body.username}`
        }))
    }
    let tokenBalance = 0;
    if (user.publicKey)
        tokenBalance = (await getTokenContract().connect(getDefaultRunner()).balanceOf(user.publicKey))
    res.status(200).send(JSON.stringify({
        user: {
            username: user.username,
            stepsCount: user.stepsCount,
            publicKey: user.publicKey,
            balance: (Number)(ethers.formatUnits(tokenBalance)),
            tournaments: user.tournaments
        }
    }))
}

exports.recordUserSteps = async (req, res) => {
    const username = req.params.username;
    const steps = req.body.steps;

    if (steps < 0) {
        return res.status(400).send(JSON.stringify({
            message: `Invalid steps count sent ${steps}`
        }));
    }
    const user = await UserModel.findOne({ username: username });
    if (!user) {
        return res.status(404).send(JSON.stringify({
            message: `No user found with username ${username}`
        }));
    }
    user.stepsCount += steps;
    await user.save();
    res.status(200).send(JSON.stringify({
        username: username,
        updatedSteps: user.stepsCount
    }))
}

exports.getBalance = async (req, res) => {
    try {

        const username = req.params.username;
        const user = await UserModel.findOne({ username: username })
        if (user == (null | undefined)) return res.status(404).send(JSON.stringify({
            message: "user not found"
        }))
        const publicKey = user.publicKey;
        //const publicKey = "0xBE60EfCE791c19836F06b54B9E827b7d91b7DDD8";

        //await getTransactions(publicKey)

        const tokenBalance = await (getTokenContract().connect(getDefaultRunner())).balanceOf(user.publicKey);
        res.send(JSON.stringify({
            publicKey: user.publicKey,
            balances: {
                tokens: (Number)(ethers.formatUnits(tokenBalance.toString()))
            }
        }))
    }
    catch (e) {
        console.log(e);
        res.status(500).send(JSON.stringify(e));
    }
}
exports.withdraw = async (req, res) => {
    try {
        const username = req.params.username;
        const { passkey, amount, toAddress } = req.body;
        const user = await UserModel.findOne({ username: username });
        const parsedAmount = ethers.parseEther(amount.toString());
        if (!user) {
            return res.status(404).send(JSON.stringify({
                message: `user not found with username: ${username}`
            }))
        }
        const isMatch = await bcrypt.compare(passkey, user.pin);
        if (!isMatch) {
            return res.status(400).send(JSON.stringify({
                message: `invalid passkey`
            }))
        }
        const balance = await getTokenContract().connect(getDefaultRunner()).balanceOf(user.publicKey);
        const formattedBalance = (Number)(ethers.formatUnits(balance));
        if (parsedAmount < 0n || parsedAmount > balance) {
            return res.status(400).send(JSON.stringify({
                message: "invalid balance",
                requestedAmount: amount,
                balance: formattedBalance
            }))
        }

        const wallet = await ethers.Wallet.fromEncryptedJson(user.wallet, passkey);
        const singerWallet = wallet.connect(getProvider())
        const tokenContract = getTokenContract().connect(singerWallet);
        const tx = await tokenContract.transfer(toAddress, parsedAmount);
        const receipt = await tx.wait();
        if (receipt.status == 1) {
            const newBalance = (await tokenContract.balanceOf(wallet.address))
            const formattedBalance = (Number)(ethers.formatUnits(newBalance));
            res.status(200).send(JSON.stringify({
                txHash: tx.hash,
                updatedBalance: formattedBalance
            }))
        }
        else {
            res.status(500).send(JSON.stringify({
                message: `transaction is not finalized on blockchain`
            }))
        }
    }
    catch (e) {
        console.log(e);
        res.status(500).send(JSON.stringify({
            message: e
        }))
    }

}

// async function getTransactions(publicKey) {
//     const tokenContract = getTokenContract().connect(getDefaultRunner());

//     await tokenContract.connect(getOwner()).transfer(publicKey, ethers.parseEther("100"));

//     const filterFrom = tokenContract.filters.Transfer(publicKey, null);
//     const filterTo = tokenContract.filters.Transfer(null, publicKey);

//     const fromTransfers = await tokenContract.queryFilter(filterFrom, 0, "latest");
//     const toTransfers = await tokenContract.queryFilter(filterTo, 0, "latest");


//     console.log(`withdrawls `, fromTransfers)
//     console.log(`Deposits `, toTransfers)


// }