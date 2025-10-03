const express = require("express");
const { Account } = require("../db");
const { authMiddleware } = require("../middleware");
const mongoose = require("mongoose");

const router = express.Router();

router.get("/balance",authMiddleware ,async (req, res)=>{
    const account =await Account.findOne({
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

    const account =await Account.findOne({
        userId: req.userId
    }).session(session);

    const amount = body.amount;
    if(!account || account.balance < amount){
        await session.abortTransaction();
        return res.status(400).json({
            message:"insufficient balance"
        })
    }

    try{
        const toAccount =await Account.findOne({
            userId: body.to,
        }).session(session);
    }catch(err){
        await session.abortTransaction();
        return res.status(400).json({
            message:"invalid account"
        })
    }

    await Account.updateOne({
        userId: req.userId
    },{ $inc: { balance: -amount } }).session(session);

    await Account.updateOne({
        userId: body.to 
    }, { $inc: { balance: amount } }).session(session);

    await session.commitTransaction();
    res.json({
        message: "Transfer successful"
    });
})



module.exports = router;