const coreConfig = require("../models/coreConfig")


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