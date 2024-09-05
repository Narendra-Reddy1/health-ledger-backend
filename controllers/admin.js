const { getLedgerContract, getDefaultRunner, getOwner } = require("../core/contracts");
const PrizeDistribution = require("../models/prizeDistribution");
const Tournament = require("../models/Tournament");


exports.createTournament = async (req, res) => {

    const { adminId, startTime, endTime, prizePool, prizeDistributionId } = req.body;

    //const tournament = await Tournament.findOne({ tournamentId: tournamentId });
    //const { startDate, endDate, prizePool } = await getLedgerContract().connect(getDefaultRunner()).getTournamentInfo(tournamentId);
    if (startTime <= endTime) {
        return senResponse(400, `startim should be less than endTime time: `);
    }
    if (endTime <= Date.now()) {
        return senResponse(400, `endDate should be greater than current time: ${endTime}`);
    }
    if (prizePool <= 0) {
        return senResponse(400, `prizePool should greater than 0`);
    }
    const prizeDistribution = await PrizeDistribution.findOne({ id: prizeDistributionId })
    if (!prizeDistribution) {
        return senResponse(404, `No prizeDistribution found with Id: ${prizeDistributionId}`);
    }



    const ledgerContract = getLedgerContract().connect(getOwner());
    const tx = await ledgerContract.startTournament(startTime, endTime, prizePool);
    const receipt = await tx.wait();
    if (receipt.status == 1) {
        const tournamentId = await ledgerContract.getLastTournamentId();

        const tournament = await Tournament.create({
            tournamentId: tournamentId,
            startTime: startTime,
            endTime: endTime,
            prizePool: prizePool,
            prizeDistributionId: prizeDistributionId
        });
        await tournament.save();

        return res.status(201).send(JSON.stringify(JSON.stringify({
            txHash: tx.hash,
            tournamentId: tournamentId,
            prizeDistribution: prizeDistribution
        })))
    }
    else {
        res.status(500).send(JSON.stringify({
            message: "transaction is not finalized on blockchain"
        }))
    }

}


function senResponse(code, data) {
    return res.status(code).send(JSON.stringify(JSON.stringify({
        message: data
    })))
}