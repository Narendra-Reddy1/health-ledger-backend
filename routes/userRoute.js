const express = require("express");
const { createWallet, getBalance } = require("../controllers/userController");

const userRouter = express.Router();

userRouter.post("/create-wallet", createWallet)
userRouter.get("get-balance", getBalance)

module.exports = { userRouter }