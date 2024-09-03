const express = require("express");
const { postSignup } = require("../controllers/authController");

const authRouter = express.Router();



authRouter.post("/sign-up", postSignup)


module.exports = { authRouter }