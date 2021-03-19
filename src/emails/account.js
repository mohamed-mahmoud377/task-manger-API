const sgMail = require("@sendgrid/mail")



sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail= (email,name)=>{
     sgMail.send({
         to:email,
         from:"mohamedpop.9558@gmail.com",
         subject:"thanks !",
         text:`welcome to the task manager app ${name}`
     })
}
const sendByeEmail= (email,name)=>{
    sgMail.send({
        to:email,
        from:"mohamedpop.9558@gmail.com",
        subject:`thanks ${name} for using task manager !`,
        text:`we really hope that you can send us some feedback about why did you cancel your account `
    })
}


module.exports={
    sendWelcomeEmail,
    sendByeEmail
}