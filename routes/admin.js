const express = require("express");
const { createTournament } = require("../controllers/admin");

const adminRouter = express.Router();

adminRouter.post("/admin/automate-reward", createTournament)


module.exports = { adminRouter }