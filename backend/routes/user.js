const express = require("express");
const zod = require("zod");
const router = express.Router();
const jwt = require("jsonwebtoken")
const {User, Account} = require("../db")
const {jwt_token} = require("../config")
const  { authMiddleware } = require("../middleware");

const signupSchema = zod.object({
    username: zod.string(),
    password: zod.string(),
    firstname: zod.string(),
    lastname: zod.string(),
})

const signinSchema = zod.object({
    username: zod.string(),
	password: zod.string()
})

const updateSchema = zod.object({
	password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
})


router.post("/signup", async (req, res)=>{
    const body = req.body;

    const {success} = signupSchema.safeParse(body);
    if(!success){
        return res.json({
            message:"incorrect inputs"
        })
    }

    const user =await User.findOne({
        username: body.username,
    })

    if(user){
        return res.json({
            message: "email already taken"
        })
    }

    const dbUser = await User.create(body);

    const userId = dbUser._id;
    
    await Account.create({
        userId,
        balance: 100+Math.random()*10000
    })

    const token = jwt.sign({
        userId
    }, jwt_token);

    res.json({
        message:"user created",
        token:token
    })
})

router.post("/signin",async (req, res)=>{
    const body = req.body;

    const {success} = signinSchema.safeParse(body);

    if(!success){
        return res.status(411).json({
            message:"incorrect inputs"
        })
    }

    const user =await User.findOne({
        username: body.username,
        password: body.password
    })

    if(user){
        const token = jwt.sign({
            userId: user._id
        }, jwt_token);

        return res.json({
            token
        })
    }

    return res.status(411).json({
        message:"wrong username or password"
    })
})

router.put("/", authMiddleware, async(req, res)=>{
    const {success} = updateSchema.safeParse(req.body);

    if(!success){
        res.status(411).json({
            message:"error while updating"
        })
    }

    await User.updateOne({_id: req.userId}, req.body);

    res.json({
        message:"update successful"
    })
})

router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [{
            firstname: {
                "$regex": filter
            }
        }, {
            lastname: {
                "$regex": filter
            }
        }]
    })

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            _id: user._id
        }))
    })
})

module.exports = router;