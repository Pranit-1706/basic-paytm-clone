const express = require("express");
const userRouter = require("./user");

router.use("/user", userRouter);

export const router = express.Router();