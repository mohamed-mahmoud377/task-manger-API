const mongoose = require("mongoose")


mongoose.connect(process.env.MONGODB_URL, {useNewUrlParser: true, useCreateIndex: true,useUnifiedTopology: true,useFindAndModify:false,autoIndex:true}).then((mongoose)=>{
    // console.log(mongoose.connections[0].NativeConnection.collections)
}).catch((e)=>{
    console.log(e)
})

