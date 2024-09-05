/* 
tournament id=0
prize-distribution data={}
participants=[] {username,publicKey}


///conntract data
stepCount.

 */

const { default: mongoose } = require("mongoose");
const { getLedgerContract, getDefaultRunner } = require("../core/contracts");
const PrizeDistribution = require("./prizeDistribution");

const Tournament = new mongoose.Schema({
    tournamentId: {
        type: Number,
        required: true
    },
    startTime: {
        type: Number,
        required: true
    },
    endTime: {
        type: Number,
        required: true
    },
    prizePool: {
        type: Number,
        required: true
    },
    prizeDistributionId: {
        type: Number,
        required: true
    },
    participants: [{
        username: {
            type: String,
            required: true,
        },
        steps: {
            type: Number,
            required: true
        },
        publicKey: {
            type: String,
            required: true
        },
        _id: false
    }],
})
Tournament.methods.isUserParticipated = async function (username) {
    try {

        const participant = this.participants.find(x => x.username == username)
        if (!participant) return false;
        const isParticipated = await getLedgerContract().connect(getDefaultRunner()).isUserParticipatedInTournament(this.tournamentId, participant.publicKey)
        return isParticipated;
    } catch (e) {
        console.log(e);
        return false
    }
}
Tournament.methods.isRunning = async function () {
    const result = await getLedgerContract().connect(getDefaultRunner()).isTournamentRunning(this.tournamentId)
    return result;
}
module.exports = mongoose.model("Tournament", Tournament)