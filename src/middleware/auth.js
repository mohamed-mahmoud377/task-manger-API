const jwt  = require("jsonwebtoken")
const {User} = require("../models/user")

const auth = async (req,res,next)=>{
    try{

        const token = req.header('Authorization').replace("Bearer ","")
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        console.log(decoded._id , token)
        const user= await  User.findOne({_id:decoded._id,"tokens.token":token })
        if (!user){
            throw new Error()
        }
        req.user= user
        req.token = token
        next()
        console.log(token)
    }catch (e) {
        console.log(e)
        res.status(401).send({error:"please authenticate"})
    }
}
module.exports = auth