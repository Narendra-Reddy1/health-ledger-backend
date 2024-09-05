const { ethers } = require("ethers");
const UserModel = require("../models/User");
const bcrypt = require("bcryptjs");
const { JsonRpcProvider } = require("ethers");
const { tokenContract, getTokenContract, getProvider, getDefaultRunner, getOwner } = require("../core/contracts");



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
        const wallet = ethers.Wallet.createRandom(getProvider())
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
                tokens: tokenBalance.toString()
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
        const user = UserModel.findOne({ username: username });
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
        if (amount < 0 || amount > balance) {
            return res.status(400).send(JSON.stringify({
                message: "invalid balance",
                requestedAmount: amount,
                balance: balance
            }))
        }

        const wallet = await ethers.Wallet.fromEncryptedJson(user.wallet, passkey);
        const tokenContract = await getTokenContract().connect(wallet);
        const tx = tokenContract.transfer(toAddress, amount);
        const receipt = await tx.wait();
        if (receipt.status == 1) {
            const newBalance = (Number)(await tokenContract.balanceOf(wallet.address))
            res.status(200).send(JSON.stringify({
                txHash: tx.hash,
                updatedBalance: newBalance
            }))
        }
        else {
            res.status(500).send(JSON.stringify({
                message: `transaction is not finalized on blockchain`
            }))
        }
    }
    catch (e) {
        res.status(500).send(JSON.stringify(e))
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