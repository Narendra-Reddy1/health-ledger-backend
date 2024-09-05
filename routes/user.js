const express = require("express");
const { createWallet, getBalance, withdraw } = require("../controllers/user");

const userRouter = express.Router();

userRouter.post("/:username/create-wallet", createWallet)
userRouter.get("/:username/get-balance", getBalance)
userRouter.post("/:username/withdraw", withdraw)

module.exports = { userRouter }