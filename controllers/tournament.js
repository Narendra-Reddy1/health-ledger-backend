const { getLedgerContract, getOwner } = require("../core/contracts");
const Tournament = require("../models/Tournament");
const UserModel = require("../models/User");


//creating tournament is admin task
// exports.createTournament = (req, res) => {


// }

exports.getTournament = async (req, res) => {
    const id = req.body.tournamentId
    const tournament = await Tournament.findOne({ tournamentId: id });
    if (!tournament) {
        return res.status(404).send(JSON.stringify({
            message: `Can't find Tournament with id: ${id}`
        }))
    }
    tournament.participants.sort((a, b) => {
        return (b.stepCount - a.stepCount)
    });
    //console.log(await tournament.isUserParticipated("reddy"))

    res.status(200).send(JSON.stringify(tournament))
}


exports.joinTournament = async (req, res) => {
    try {

        const id = req.body.tournamentId;
        const username = req.body.username;
        const user = await UserModel.findOne({ username: username });
        if (!user) {
            return res.status(404).send({
                message: `user not found with username: ${username}`
            })
        }
        const tournament = await Tournament.findOne({ tournamentId: id });
        if (!tournament) {
            return res.status(404).send(JSON.stringify({
                message: `no tournament found with id: ${id}`
            }))
        }
        const isRunning = await tournament.isRunning();
        if (!isRunning) {
            return res.status(404).send(JSON.stringify({
                message: "tournament is not LIVE!"
            }))
        }
        const ledgerContract = getLedgerContract().connect(getOwner());
        const isParticipated = await ledgerContract.isUserParticipatedInTournament(id, user.publicKey);
        if (isParticipated) {
            return res.status(409).send(JSON.stringify({
                message: "Already participated!"
            }))
        }
        const tx = await ledgerContract.forceJoinTournament(id, user.publicKey);
        const receipt = await tx.wait();
        if (receipt.status == 1) {
            tournament.participants.push({
                publicKey: user.publicKey,
                steps: 0,
                username: username,
            })
            await tournament.save();
            return res.status(201).send(JSON.stringify({
                txHash: tx.hash,
                tournamentId: id,
                stepsCount: 0,
            }))
        }
        else {
            return res.status(500).send(JSON.stringify({
                message: `failed to join tournament with tournamentId: ${id}`,
                txStatus: receipt.status
            }))
        }
    }
    catch (e) {
        console.log(e)
        res.status(500).send(JSON.stringify({
            error: e
        }));
    }
}

exports.recordSteps = async (req, res) => {
    try {
        //use spread operator bc
        const stepCount = req.body.steps;
        const username = req.body.username;
        const id = req.body.tournamentId;

        const tournament = await Tournament.findOne({ tournamentId: id });
        if (!tournament) {
            return res.status(404).send(JSON.stringify({
                message: `no tournament found with id: ${id}`
            }))
        }
        const isRunning = await tournament.isRunning();
        if (!isRunning) {
            return res.status(404).send(JSON.stringify({
                message: "tournament is not LIVE!"
            }))
        }
        const participant = tournament.participants.find(x => x.username == username);
        if (!participant) {
            return res.status(404).send({
                message: `no pqrticipant with username: ${username}`
            })
        }
        const ledgerContract = getLedgerContract().connect(getOwner());
        const tx = await ledgerContract.recordSteps(id, participant.publicKey, stepCount);
        const receipt = await tx.wait();
        if (receipt.status == 1) {
            const steps = (Number)(await ledgerContract.getUserStepCount(id, participant.publicKey));
            participant.steps += steps;
            await tournament.save();
            res.status(200).send(JSON.stringify({
                txHash: tx.hash,
                tournamentId: id,
                updatedSteps: participant.steps
            }))
        }
        else {
            res.send.status(500).send(JSON.stringify({
                message: `failed to record steps to tournamentId:: ${id}`
            }))
        }

    }
    catch (e) {
        res.status(500).send(e.toString())
    }
}

