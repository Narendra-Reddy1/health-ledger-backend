const express = require("express");
const { createWallet, getBalance, withdraw, getUserInfo, recordUserSteps } = require("../controllers/user");

const userRouter = express.Router();

userRouter.post("/:username/withdraw", withdraw)
userRouter.get("/:username/user-info", getUserInfo)
userRouter.get("/:username/get-balance", getBalance)
userRouter.post("/:username/create-wallet", createWallet)
userRouter.post("/:username/record-steps", recordUserSteps)

module.exports = { userRouter }