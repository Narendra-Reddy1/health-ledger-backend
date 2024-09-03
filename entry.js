const express = require("express");
const { userRouter } = require("./routes/userRoute");
const { ethers } = require("ethers");
const { Wallet } = require("ethers");
const { default: mongoose } = require("mongoose");
const { authRouter } = require("./routes/authRouter");
require("dotenv").config()

const app = express();

const PORT = 3000;
app.use(express.json());

app.use(authRouter);
app.use(userRouter);


mongoose.connect(`mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.y6m6z3o.mongodb.net/fitness-ledger`).then(result => {
    console.log("Connected...");
    app.listen(process.env.PORT || 3000);
})
