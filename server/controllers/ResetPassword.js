const User = require("../models/User");
const mailSender=require("../utils/mailSender");
const bcrypt= require("bcrypt");

// resetPasswordToken
exports.resetPasswordToken = async(req,res) =>{
   try{
      // get email from request body
    const email = request.body.email;
    // check user for this mail or validation on mail ki user exist krta hai
    const user=await User.findOne({email:email});
    if(!user){
        return res.json({
            success:false,
            message:"Your Email is not registered with us",
        });
    }

    // generate token
    const token= crypto.randomUUID();

    // update user by adding token and expiration time
    const updatedDetails = await User.findOneAndUpdate(
                                            {email:email},{
                                                token:token,
                                                resetPasswordExpires:Date.now() + 5*60*1000,
                                            }, 
                                        {new:true});

    // create url 
    const url=`http://localhost:3000/update-password/${token}`
    // send mail containing the url
    await mailSender(email,"Password Reset Link", `Password Reset Link:${url}`);
    
    // return response
    return res.json({
        success:true,
        message:"Email sent successfully, please check email and check password",
    });
}
catch(error){
    console.log(error);
    return res.status(500).json({
        success:false,
        message:"Something went wrong while sending reset password mail"
    });
}

}
   
// resetPassword
exports.resetPassword=async(req,res)=>{
   try{

     // data fetch
     const {password, confirmPassword, token} = req.body;
     // validation
     if(password!==confirmPassword){
         return res.json({
             success:false,
             message:"password not matching",
         });
     }
     // get userdetails from db using token
     const userDetails = await user.findOne({token:token});
     // if no entry-invalid token
     if(!userDetails){
         return res.json({
             success:false,
             message:"Token is invalid",
         });
     }
     // token time check
     if(userDetails.resetPasswordExpires < Date.now()){
          return res.json({
             success:false,
             message:"Token is expired, please regenerate your token",
          })
     }
     // hash password
     const hashedPassword= await bcrypt.hash(password,10);
     // password update
     await User.findByIdAndUpdate(
         {token:token},
         {password:hashedPassword},
         {new:true},
     );
     // return response
     return res.status(200).json({
        success:true,
        message:"Password reset successfull",
     })

   }catch(err){
    console.log(error);
    return res.status(500).json({
        success:false,
        message:"Something went wrong while updating password",
    });
   }
}
  