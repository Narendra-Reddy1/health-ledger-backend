const { ethers } = require("ethers");
const { adminConfig } = require("../core/config");
const { getLedgerContract, getDefaultRunner, getOwner, getTokenContract } = require("../core/contracts");
const PrizeDistribution = require("../models/prizeDistribution");
const Tournament = require("../models/Tournament");
const { ledgerConfig } = require("../core/metadata");


exports.createTournament = async (req, res) => {

    //HOW are you gonna disperse ther rewards????
    try {

        const { adminId, startTime, endTime, prizePool, prizeDistributionId } = req.body;
        if (!adminConfig.admins.includes(adminId)) {
            return sendError(403, `Unauthorized`, res);
        }
        //const tournament = await Tournament.findOne({ tournamentId: tournamentId });
        //const { startDate, endDate, prizePool } = await getLedgerContract().connect(getDefaultRunner()).getTournamentInfo(tournamentId);
        if (startTime >= endTime) {
            return res.status(400).send((JSON.stringify({
                message: `start time should be less than endTime time`
            })))
        }
        if (endTime <= Date.now() / 1000) {
            return res.status(400).send(JSON.stringify(JSON.stringify({
                message: `endDate should be greater than current time.`,
                currentTime: Date.now(),
                endTime: endTime
            })))
        }
        if (prizePool <= 0) {
            return res.status(400).send((JSON.stringify({
                message: `prizePool should greater than 0`
            })))
        }
        const prizeDistribution = await PrizeDistribution.findOne({ id: prizeDistributionId })
        if (!prizeDistribution) {
            return res.status(404).send((JSON.stringify({
                message: `No prizeDistribution found with Id: ${prizeDistributionId}`,
            })))
        }

        const ledgerContract = getLedgerContract().connect(getOwner());
        const tokenTx = await getTokenContract().connect(getOwner()).approve(ledgerConfig.address, ethers.parseEther(prizePool.toString()));
        const tokenReceipt = await tokenTx.wait();
        if (tokenReceipt.status != 1) {
            res.status(500).send((JSON.stringify({
                message: "approval transaction is not finalized on blockchain"
            })))
        }
        const tx = await ledgerContract.startTournament(startTime, endTime, ethers.parseEther(prizePool.toString()));
        const receipt = await tx.wait();
        if (receipt.status == 1) {
            const tournamentId = await ledgerContract.getLastTournamentId();

            const tournament = await Tournament.create({
                tournamentId: (Number)(tournamentId),
                startTime: startTime,
                endTime: endTime,
                prizePool: prizePool,
                prizeDistributionId: prizeDistributionId
            });
            await tournament.save();

            return res.status(201).send(JSON.stringify({
                txHash: tx.hash,
                tournamentId: (Number)(tournamentId),
                prizeDistribution: prizeDistribution
            }))
        }
        else {
            res.status(500).send(JSON.stringify({
                message: "transaction is not finalized on blockchain"
            }))
        }
    }
    catch (e) {
        console.log(e)
        res.status(500).send(JSON.stringify(e))
    }
}

