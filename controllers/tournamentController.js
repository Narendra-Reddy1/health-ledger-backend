const { getLedgerContract, getOwner } = require("../core/contracts");
const Tournament = require("../models/Tournament");
const UserModel = require("../models/UserModel");


exports.createTournament = (req, res) => {


}
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
        const tx = await getLedgerContract().connect(getOwner()).forceJoinTournament(id, user.publicKey);
        const receipt = await tx.wait();
        if (receipt.status == 1) {
            tournament.participants.add({
                publicKey: publicKey,
                stepCount: 0,
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
        res.status(500).send(JSON.stringify(e));
    }
}

exports.recordSteps = async (req, res) => {
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
    participant.stepCount += steps;

    await tournament.save();

    res.status(200).send(JSON.stringify({
        tournamentId: id,
        updatedSteps: participant.stepCount
    }))

}
