const express = require("express");
const { getTournament, joinTournament, recordSteps } = require("../controllers/tournamentController");

const tournamentRouter = express.Router();



tournamentRouter.get("/get-tournament", getTournament)
tournamentRouter.post("/join-tournament", joinTournament)
tournamentRouter.patch("/record-steps", recordSteps);
module.exports = { tournamentRouter }