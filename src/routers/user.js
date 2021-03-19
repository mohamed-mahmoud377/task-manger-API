const express = require("express")
const router = new express.Router()
const {User} = require("../models/user")
require("../db/mongoose")
const chalk  =require('chalk')
const auth =require("../middleware/auth")
const multer  = require("multer")
const {sendWelcomeEmail,sendByeEmail}  = require("../emails/account")

const upload = multer({
    dest:"public/avatar",
    limits:{
        fileSize:1000000
    },
    fileFilter(req, file, callback) {
       if (!file.originalname.match(/\.(jpg|jpeg|png)$/)){
           return callback(new Error ("please upload a img doc bitch"))

       }
       callback(undefined,true)
    }
})


router.post("/users",async(req,res)=>{
    // console.log(req.body)
    // const user = new User(req.body)
    // user.save().then((user)=>{
    //     res.status(201).send(user)
    // }).catch((error)=>{
    //     console.log(error)
    //     res.status(400).send(error)
    // })
    const user = new User (req.body)

    try{
        await user.save()
        sendWelcomeEmail(user.email,user.name)
        const token = await  user.generateAuthToken()
        console.log(chalk.inverse(`an new user has been added successfully to the database ${user}  `))
        res.status(201).send({user,token})


    }catch (e) {
        console.error(chalk.black.bgRed(e.message))
        res.status(500).send(e)
    }


})

router.post("/users/login",async (req,res)=>{
   try {
       // const jason =JSON.stringify(req.body)
       // const reqq = JSON.parse(req.body)
       console.log(req.body)
       const user = await User.findByCredentials(req.body.email,req.body.password)
       const token = await user.generateAuthToken()
        req.session.isLoggedIn = true
           // console.log(user)
          res.status(200).json({
              user:user,
              token:token
          })

   }catch (e) {
        console.log(e)
       res.status(400).send()
   }
})

router.post("/users/logout",auth,async (req,res)=>{
    try {
        req.user.tokens= req.user.tokens.filter((token)=> token.token !== req.token)
        await  req.user.save()
        res.send()
    }catch (e) {
        res.status(500).send()
    }
})

router.post("/users/logoutall",auth,async (req,res)=>{
    try{
        req.user.tokens = []
        await req.user.save()
        res.send()
    }catch (e) {
        res.status(500).send()
    }
})

router.get("/users/me",auth,async(req,res)=>{
    // User.find({}).then((users)=>{
    //     console.log(users)
    //     res.send(users)
    // }).catch((e)=>{
    //     console.log(e)
    //     res.status(500).send()
    //
    // })

    // try{
    //     const  users =await User.find({})
    //     res.send(users)
    // }catch (e) {
    //     console.error(chalk.black.bgRed(e.message))
    //     res.status(500).send()
    // }
    res.send(req.user)



})
router.get('/users/:id',async (req, res)=>{
    const _id = req.params.id
    console.log(typeof _id)
    console.log(req.params.id)
    // User.findById(_id).then((user)=>{
    //     if (!user){
    //         return res.status(404).send()
    //     }
    //     res.send(user)
    // }).catch((e)=>{
    //     console.log(e)
    //     res.status(500).send()
    // })
    try{
        const user = await User.findById(_id)
        if (!user){
            return res.status(404).send()
        }
        res.send(user)
    }catch (e) {
        res.status(500).send()
    }

})

router.patch("/users/me",auth,async (req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdate =["name", "email" , "password", "age"]
    const isValidUpdate = updates.every((update)=>{
        return allowedUpdate.includes(update)
    })
    if (!isValidUpdate){
        return  res.status(400).send({error: "Invalid update"})
    }
    const id = req.params.id
    try{
        // const user = await  User.findById(id)
        //
        // // const user=await User.findByIdAndUpdate(id,req.body,{new:true,runValidators: true})
        // if(!user){
        //     console.log(chalk.black.bgMagentaBright(`the user with id ${id} you are trying to update is not found`))
        //     return res.status(404).send()
        // }
        updates.forEach((update)=> req.user[update] = req.body[update])
        await req.user.save()
        console.log(chalk.inverse(`the user with id ${id} got updated ${req.user}`))
        res.status(201).send(req.user)
    }catch (e) {
        if (e._message === "Validation failed"){
            console.log(chalk.black.bgMagentaBright(`validation error accured during updating the user with ID ${id}`))
            res.status(400).send(e.message)
        }else{
            console.log(chalk.black.bgRed("intrnal server error happened"))
            res.status(500).send(e.message)
        }

    }
})

router.delete("/users/me",auth,async (req,res)=>{
    try{
        // const deletedUser = await User.findByIdAndDelete(req.user._id)
        // if (!deletedUser){
        //     console.log(chalk.black.bgMagentaBright(`the user with id ${req.user._id} you are trying to delete is not found`))
        //     return res.status(404).send()
        // }
        sendByeEmail(req.user.email,req.user.name)
        await  req.user.remove()

        console.log(chalk.inverse(`the user with id ${req.user._id} got deleted ${req.user}`))
        res.status(200).send(req.user)
    }catch (e) {

        console.log(chalk.black.bgRed("intrnal server error happened"))
        res.status(500).send(e.message)


    }

})
router.post("/users/me/avatar",upload.single("jerry"),(req,res)=>{
    res.send("a7la mesa 3leek ya a5oia")
})


module.exports = {
    "userRouter" :router}