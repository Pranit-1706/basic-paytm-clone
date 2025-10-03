const express = require("express");
const zod = require("zod");
const router = express.Router();
const jwt = require("jsonwebtoken")
const {User} = require("../db")
const {jwt_token} = require("../config")
const  { authMiddleware } = require("../middleware");

const signupSchema = zod.object({
    username: zod.string(),
    password: zod.string(),
    firstname: zod.string(),
    lastname: zod.string(),
})

const signinSchema = zod.object({
    username: zod.string().email(),
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

    if(user._id){
        return res.json({
            message: "email already taken"
        })
    }

    const dbUser = await User.create(body);
    const token = jwt.sign({
        userId: dbUser._id
    }, jwt_token);

    res.json({
        message: "User created",
        token
    })
})

router.post("signin",async (req, res)=>{
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
            userId: body._id
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
            firstName: {
                "$regex": filter
            }
        }, {
            lastName: {
                "$regex": filter
            }
        }]
    })

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})

module.exports = router;