const User=require("../models/User");
const OTP=require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt= require("jsonwebtoken");

require("dotenv").config();

// send otp

exports.sendOTP= async(req,res)=>{

    try{

      // fetch email from request body
    const {email}=req.body;

    // check if user already present

    const checkUserPresent = await User.findOne({email});

    // if user already exist, then return a response

    if(checkUserPresent){
        return res.status(401).json({
            success:false,
            message:"user already registered",
        })
    }
  
    // generate otp
    var otp=otpGenerator.generate(6,{
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false,
    });
    console.log("OTP generated:",otp);

    // check unique otp or not

    const result=await OTP.findOne({otp: otp});

    while(result){
        otp=otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });
        result=await OTP.findOne({otp: otp});
    }

    // otp ko database mei save krna hai

    const otpPayload= {email,otp};

    // create an entry for OTP in db

    const otpBody= await OTP.create(otpPayload);
    console.log(otpBody);

    // return response successfull

    res.status(200).json({
        success:true,
        message:"OTP Sent Successfully",
        otp,
    })

 }

    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })

    }  

};


// signup

exports.signUp= async (req,res)=>{
    try{
    // data fetch from request body
    const {
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        accountType,
        contactNumber,
        otp
    } = req.body;

    // validate kr lo
      if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
        return res.status(403).json({
            success:false,
            message:"All fields are required",
        })
      }

    // dono password ko match kr lo (password and confirm password)
    if(password !== confirmPassword){
         return res.status(400).json({
           success:false,
           message:"Password and confirmPassword values does not match, Please trt again later",
         });
    }

    // check user already exist or not
   const existingUser = await User.findOne({email});

   if(existingUser){
    return res.status(400).json({
        success:false,
        message:"user is already registered",
    });
   }

    // find most recent otp stored for the user
    
    const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
    console.log(recentOtp);

    // validate otp
     if(recentOtp.length ==0){
        // otp not found
        return res.status(400).json({
            success:false,
            message:"OTP Not Found",
        })
     } else if(otp!==recentOtp.otp){
        // invalid otp
        return res.status(400).json({
            success:false,
            message:"Invalid OTP",
        });
     }

    // hash password
    const hashedPassword = await bcrypt.hash(password,10);

    // entry create in db
    const profileDetails =await Profile.create({
        gender:null,
        dateOfBirth:null,
        about:null,
        contactNumber:null,
    });

    const user=await User.create({
        firstName,
        lastName,
        email,
        contactNumber,
        password:hashedPassword,
        accountType,
        additionalDetails:profileDetails._id,
        image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstname} ${lastName}`,
    })
    // return response

    return res.status(200).json({
        success:true,
        message:'user is registered successfully',
        user,
    });
}
  catch(error){
     console.log(error);
     return res.status(500).json({
        success:false,
        message:"User cannot be registered. Please try again",
     })
  }
}


// login

exports.login()=async(req,res)=>{
    try{ 
        // get data from request body
        const {email,password} = req.body;

        // validation data
        if(!email || !password){
            return res.status(403).json({
                success:false,
                message:`All fields are required, please try again`,
            });
        }
        // user check exist or not
        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User is not registered, please signup first",
            });
        }
        // generate jwt, after password matching
        if(await bcrypt.compare(password, user.password)){
           const payload={
            email:user.email,
            id:user._id,
            accountType:user.accountType,
           }
            const token = jwt.sign(payload, process.env.JWT_SECRET,{
                expiresIN:"2h",
            });
            user.token =token;
            user.password=undefined;

              // create cookie and send respond
              const options={
                expires:new Date(Date.now()+ 3*24*60*60*1000),
                httpOnly:true,
              }

              res.cookie("token",token,options).status(200).json({
                success:true,
                token,
                user,
                message:"Logged in successfully",
              })
        }
        else{
            return res.status(401).json({
                success:false,
                message:'Password is Incorrect',
            });
        }
      

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Log in Failure, Please try again",
        });

    }
};

// change Password
exports.changePassword = async(req,res)=>{
    // get data from req body
    // get oldpassword, newpassword, confirm password
    // validation

    // update password in db
    // send mail -password updated
    // return response
}

