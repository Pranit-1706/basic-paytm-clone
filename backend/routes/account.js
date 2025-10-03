const express = require("express");
const { Account } = require("../db");
const { authMiddleware } = require("../middleware");

const router = express.Router();

router.get("/balance",authMiddleware ,async (req, res)=>{
    const account = Account.findOne({
        userId: req.userId
    })

    res.json({
        message: account.balance,
    })
})

router.post("/transfer", authMiddleware, async(req, res)=>{
    const session = await mongoose.startSession();

    session.startTransaction();
    const body = req.body;

    const account = Account.findOne({
        userId: req.userId
    }).session(session);

    if(!account || account.balance < body.amount){
        await session.abortTransaction();
        return res.status(400).json({
            message:"insufficient balance"
        })
    }

    const toAccount = Account.findOne({
        userId: body.to,
    }).session(session);

    if(!toAccount){
        await session.abortTransaction();
        return res.status(400).json({
            message:"invalid account"
        })
    }

    await Account.updateOne({
        userId: req.userId
    },{ $inc: { balance: -amount } }).session(session);

    await Account.updateOne({
        userId: to 
    }, { $inc: { balance: amount } }).session(session);

    await session.commitTransaction();
    res.json({
        message: "Transfer successful"
    });
})



module.exports = router;