const express = require("express");
const { userRouter } = require("./routes/user");
const { default: mongoose } = require("mongoose");
const { authRouter } = require("./routes/auth");
const { tournamentRouter } = require("./routes/tournament");
const { adminRouter } = require("./routes/admin");
require("dotenv").config()

const app = express();
app.use(express.json());
// app.use((req, res, next) => {
//     req.provider = provider;

//     next();
// })
app.use(authRouter);
app.use(userRouter);
app.use(tournamentRouter);
app.use("/admin", adminRouter);


mongoose.connect(`mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.y6m6z3o.mongodb.net/fitness-ledger`).then(result => {
    console.log("Connected to DB...");
    app.listen(process.env.PORT || 3000, () => {

        console.log("Connected to server...");
    });
})

///https://amoy.polygonscan.com/address/{publicKey}
