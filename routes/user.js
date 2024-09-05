const express = require("express");
const { createWallet, getBalance } = require("../controllers/user");

const userRouter = express.Router();

userRouter.post("/:username/create-wallet", createWallet)
userRouter.get("/:username/get-balance", getBalance)

module.exports = { userRouter }