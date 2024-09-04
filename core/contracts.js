const { ethers } = require("ethers")
const { tokenConfig, ledgerConfig, nftConfig } = require("./metadata")

let tokenContract;
let ledgerContract;
let nftContract;


const getProvider = () => {
    return new ethers.JsonRpcProvider(process.env.RPC_URL)
}
const getTokenContract = () => {
    return new ethers.Contract(tokenConfig.address, tokenConfig.abi);
    //tokenContract = new ethers.Contract(tokenConfig.address, tokenConfig.abi);
    //o_tokenContract = tokenContract.connect(ethers.getSigner(process.env.PRIVATE_KEY))
}
const getLedgerContract = () => {
    return new ethers.Contract(ledgerConfig.address, ledgerConfig.abi);
    //ledgerContract = new ethers.Contract(ledgerConfig.address, ledgerConfig.abi);
    //o_ledgerContract = ledgerContract.connect(ethers.getSigner(process.env.PRIVATE_KEY))
}
const getNftContract = () => {
    return new ethers.Contract(nftConfig.address, nftConfig.abi);
    //nftContract = new ethers.Contract(nftConfig.address, nftConfig.abi);
    //o_nftContract = nftContract.connect(ethers.getSigner(process.env.PRIVATE_KEY))
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

