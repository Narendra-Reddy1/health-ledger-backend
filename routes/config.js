const express = require("express");
const { getwalletConfig } = require("../controllers/config");

const configRouter = express.Router();



configRouter.get("/config/wallet", getwalletConfig)


module.exports = { configRouter }