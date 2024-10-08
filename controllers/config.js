const coreConfig = require("../models/coreConfig");
const prizeDistribution = require("../models/prizeDistribution");


exports.getPrizeDistribution = async (req, res) => {
    const { id } = req.body;
    const distro = await prizeDistribution.findOne({ id: id });
    if (!distro) {
        return res.status(404).send(JSON.stringify({
            message: `nothing found at given id: ${id}`
        }))
    }
    res.status(200).send(JSON.stringify(distro.distribution));
}
exports.getwalletConfig = async (req, res) => {
    const config = await coreConfig.findOne({ index: 0 });
    if (!config) {
        console.error("Something messed up with coreConfig Data");
        return res.status(500).send(JSON.stringify({
            message: "something messed up with coreConfig"
        }))
    }
    res.status(200).send(JSON.stringify(
        {
            wallet: config.wallet
        }));
}