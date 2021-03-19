const  express = require("express")
const chalk  = require("chalk")
const auth =require("../src/middleware/auth")
require("./db/mongoose")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const session = require("express-session")
const path = require("path")

const  bodyParser = require('body-parser')
const app = express()
const port = process.env.PORT

 const viewsPath =path.join(__dirname,"../templates/views")
const publicDir = path.join(__dirname,"../public")
app.set("view engine","hbs")
app.set("views", viewsPath)
app.use(express.static(publicDir))
// app.use(express.json())
app.use(bodyParser.json())

const {userRouter} = require("./routers/user")
const {taskRouter} = require("./routers/tasks")
// app.use((req,res,next)=>{
//     console.log(req.method,req.path)
//     if (req.method==="GET")
//         res.send("Get requests are disabled")
//     else
//         next()
// })


const multer = require("multer")
const upload = multer({
    dest:"images"
})
app.post('/upload',upload.single("upload"),(req,res)=>{
    res.send()
})

app.use(session({secret:"thisIsMyToken",resave:false,saveUninitialized:false}))
app.use(userRouter)
app.use(taskRouter)

app.get("*",(req,res)=>{
    res.send("<h1>page not found</h1>")
})
app.listen(port,()=>{

    console.log("Server is up and running on port "+port)
})

