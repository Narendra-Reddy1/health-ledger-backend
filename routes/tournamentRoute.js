const express = require("express");
const { getTournament, joinTournament } = require("../controllers/tournamentController");

const tournamentRouter = express.Router();



tournamentRouter.get("/get-tournament", getTournament)
tournamentRouter.post("/join-tournament", joinTournament)

module.exports = { tournamentRouter }