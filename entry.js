const express = require("express");
const { userRouter } = require("./routes/userRoute");
const { ethers } = require("ethers");
const { Wallet } = require("ethers");
const { default: mongoose } = require("mongoose");
const { authRouter } = require("./routes/authRouter");
const { tournamentRouter } = require("./routes/tournamentRoute");
require("dotenv").config()

const app = express();
let provider;
app.use(express.json());
// app.use((req, res, next) => {
//     req.provider = provider;

//     next();
// })
app.use(authRouter);
app.use(userRouter);
app.use(tournamentRouter);


mongoose.connect(`mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.y6m6z3o.mongodb.net/fitness-ledger`).then(result => {
    console.log("Connected...");
    app.listen(process.env.PORT || 3000, () => {
        //provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    });
})
