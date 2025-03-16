const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");

const OTPSchema = new mongoose.Schema({
 
     email:{
        type:String,
        required:true,
     },

     otp:{
        type:String,
        required:true,
     },
     createdAt:{
        type:Date,
        default:Date.now(),
        expires:5*60,
     }
});

// a function create kr lete hai jiska kaam hai to send emails

async function sendVerificationEmail(email, otp){
    try{
        const mailResponse = await mailSender(email, "Verification Email From MindLink", otp);
        console.log("Email sent Successfully:",mailResponse);
        
    }
    catch(error){
        console.log("error occured while sending mail:",error);
        throw error;
    }
}


OTPSchema.pre("Save", async function(next){
    await sendVerificationEmail(this.email,this.otp);
    next();
})

module.exports = mongoose.model("Course",OTPSchema);