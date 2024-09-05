const { ethers } = require("ethers")
const { tokenConfig, ledgerConfig, nftConfig } = require("./metadata")

const getProvider = () => {
    return new ethers.JsonRpcProvider(process.env.RPC_URL)
}
const getTokenContract = () => {
    return new ethers.Contract(tokenConfig.address, tokenConfig.abi);
}
const getLedgerContract = () => {
    return new ethers.Contract(ledgerConfig.address, ledgerConfig.abi);
}
const getNftContract = () => {
    return new ethers.Contract(nftConfig.address, nftConfig.abi);
}
const getDefaultRunner = () => {
    return new ethers.Wallet(process.env.PRIVATE_KEY, getProvider())
}
const getOwner = () => {
    return new ethers.Wallet(process.env.OWNER_PRIVATE_KEY, getProvider())
}
module.exports = {
    getLedgerContract, getNftContract, getTokenContract, getProvider,
    getDefaultRunner, getOwner
}

