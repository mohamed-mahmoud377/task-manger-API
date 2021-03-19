const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const v= require("mongoose")
const {Task} = require("../models/task")
const userSchema =  new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        validate: function (value){

        }
    },
    email: {
        type: String,
        trim:true,
        required: true,
        unique: true,
        dropDups: true,
        // index: {unique: true, dropDups: true},
        validate: function (value){
            if(!validator.isEmail(value)){
                throw  new Error("fuck you this is a wrong email")
            }
        }
    }
    , age:{
        type: Number,
        default:0
    },
    password:{
        type:String,
        required:true,
        trim:true,
        validate: function (value){
            if(value.length<=6){
                throw  new Error("the length of the password is less than 6")
            }else if(value.includes('password')){
                throw  new Error("the possword contions password")
            }
        }
    },
    tokens:[{
        token:{
            type:String,
            required:false,
        }
    }]
},{timestamps:true})
userSchema.virtual("tasks",{
    ref:"Tasks",
    localField:'_id',
    foreignField:"owner",
})
userSchema.methods.getPublicProfile = function (){
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete  userObject.tokens
    return userObject
}
userSchema.methods.toJSON = function (){
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete  userObject.tokens
    return userObject
}
userSchema.methods.generateAuthToken = async function (){
    const user = this
    const token = jwt.sign({_id: user._id.toString()},process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({token:token})
    await user.save()
    return token

}
userSchema.statics.findByCredentials = async (email,password)=>{

        const user = await  User.findOne({email})
        if (!user){
            throw new Error("Unable to login")
        }
        const isMatch = await  bcrypt.compare(password,user.password)
        if (!isMatch){
            throw  new Error("Unable to login")
        }
        return user

}


userSchema.pre("remove",async function (next){
    const user = this
    await Task.deleteMany({owner:user._id})

    next()
})

userSchema.pre("save",async  function (next){
    const user = this
    if(user.isModified("password")){
        user.password = await bcrypt.hash(user.password,8)
    }

    next()
})
const User = mongoose.model("User",userSchema)

//this line of code is added to make the unique work !
User.init().then(() => {

});

 module.exports = {User}