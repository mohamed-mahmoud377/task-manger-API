const express = require("express")
const router = new express.Router()
const {Task} = require("../models/task")
require("../db/mongoose")
const chalk  =require('chalk')
const auth = require("../middleware/auth")

router.post ("/task",auth,async (req,res)=>{
    // console.log(req.body)
    // const task = new Task(req.body)
    // task.save().then((task)=>{
    //     console.log("this new task added"+task)
    //     res.status(201).send(task)
    // }).catch((e)=>{
    //     console.log(e)
    //     res.status(400).send(e)
    //
    // })


    // const task = new Task(req.body)

    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try{

        await  task.save()
        console.log(chalk.inverse(`new task has been saved to the database ${task} `))
        res.status(200).send(task)

    }catch (e) {
        console.error(chalk.black.bgRed(e.message))
        res.status(400).send(e)
    }


})
// GET tasks?completed=true
//GET  /tasks?limit=10&skip=0
//GET /tasks/sortyBy= des:desc
router.get("/tasks",auth,async(req,res)=>{
    const match = {}
    const sort ={}
    if (req.query.completed){
        match.completed = req.query.completed ==="true"
    }
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]]= parts[1]==='desc'?-1:1
    }
    try {
        await  req.user.populate({
            path:'tasks',
            match: match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort:sort
            }
        }).execPopulate()
        console.log(req.user._id)
        console.log(chalk.inverse("tasks has been sent to the user"))
        res.send(req.user.tasks)
    }catch (e) {
        console.error(chalk.bgRed.black("an error happened when sending all the tasks to the client"),e)
        res.status(500).send()
    }
})
router.get("/tasks/:id",auth,async (req,res)=>{
    const _id =req.params.id
    // Task.findById(_id).then((task)=>{
    //     if (task){
    //         return res.status(200).send(task)
    //     }else{
    //         res.status(404).send()
    //     }
    //
    // }).catch((e)=>{
    //     console.log(e)
    //     res.status(500).send(e)
    // })
    try {
        // const task = await Task.findById(_id)
        const task = await  Task.findOne({_id:_id,owner:req.user._id})
        if (!task){
            console.log(chalk.bgMagentaBright.black(`user tried to get a task with ID ${_id} but not found`))
            return res.status(404).send()

        }
        console.log(chalk.inverse(`task with ID ${_id} has been fetched to client`))

        res.status(200).send(task)
    }catch (e) {
        console.error(chalk.bgRed.black("erroer accusers during fetching some task from the dataabse",e))
        res.status(500).send()
    }
})



router.patch("/tasks/:id",auth,async (req,res)=>{
    const taskId = req.params.id
    const userUpdates = Object.keys(req.body)
    const allowedUpdates = ["completed","description"]
    const isValidUpdate = userUpdates.every((update)=>{
        return allowedUpdates.includes(update)
    })
    if (!isValidUpdate){
        return res.status(400).send({error: "Invalid update"})
    }
    try{
        // const task= await Task.findByIdAndUpdate(taskId,req.body,{new:true,runValidators: true})
        // const task = await Task.findOneAndUpdate({_id:taskId,owner:req.user._id},req.body,{new:true, runValidators:true})
        const task = await  Task.findOne({_id:taskId,owner:req.user._id})
        if(!task){
            console.log(chalk.black.bgMagentaBright(`the task with id ${taskId} you are trying to update is not found`))
            return res.status(404).send()
        }
        userUpdates.forEach((update)=>task[update]=req.body[update])
        await  task.save()
        console.log(chalk.inverse(`the task with id ${taskId} got updated ${task}`))
        res.status(201).send(task)
    }catch (e) {
        if (e._message === "Validation failed"){
            console.log(chalk.black.bgMagentaBright(`validation error accured during updating the tasl with ID ${taskId}`))
            res.status(400).send(e.message)
        }else{
            console.log(chalk.black.bgRed("intrnal server error happened"))
            res.status(500).send(e.message)
        }

    }
})





router.delete("/tasks/:id",auth,async (req,res)=>{
    try {
        const deletedTask = await  Task.findOneAndDelete({_id:req.params.id, owner:req.user._id})
        if (!deletedTask){
            console.log(chalk.black.bgMagentaBright(`the task with id ${req.params.id} you are trying to delete is not found`))
            return res.status(404).send()
        }
        console.log(chalk.inverse(`the user with id ${req.params.id} got updated ${deletedTask}`))
        res.status(200).send(deletedTask)
    }catch (e) {
        console.log(chalk.black.bgRed("intrnal server error happened"))
        res.sendStatus(500).send(e.message)
    }
})

module.exports = {
   "taskRouter" : router
}