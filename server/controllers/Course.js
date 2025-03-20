const Course = require("../models/Course");
const Tag = require("../models/tags");
const User= require("../models/User");
const {uploadImageToCloudinary} = require("../utils/ImageUploader");
require("dotenv").config();

// create course handler

exports.createCourse=async(req,res)=>{
    try{
    //  fetch data
    const {courseName, courseDescription, whatYouWillLearn, price, tag}=req.body;

    // get thumbnail
    const thumbnail= req.files.thumbnailImage;

    // validation
    if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail){
      return res.status(400).json({
        success:false,
        message:"All fields are required",
      })
    }
    
    // check for instructor
    const userId=req.user.id;
    const instructorDetails = await User.findById(userId);
    console.log("Instructor Details:", instructorDetails);
    // todo: verify that userId and instructorDetails._id are same or different

    if(!instructorDetails){
        return res.status(404).json({
            success:false,
            message:"Instructor Details not found",
        });
    }

    // check given tag is valid or not

    const tagDetails = await Tag.findById(tag);
    if(!tagDetails){
        return res.status(404).json({
            success:false,
            message:"Tag Details not found",
        });
    }

    // upload image to cloudinary
    const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

    // create an entry for new course
    const newCourse= await Course.create({
        courseName,
        courseDescription,
        instructor:instructorDetails._id,
        whatYouWillLearn:whatYouWillLearn,
        price,
        tag:tagDetails._id,
        thumbnail:thumbnailImage,
    })

    // update user means instructor- add the user schema of instructor
    await User.findByIdAndUpdate(
        {_id:instructorDetails._id},
        {
            $push:{
                courses:newCourse._id,
            }
        },
        {new:true},
    );

    // update the Tag Schema
    await Tag.findByIdAndUpdate(tagDetails._id, { $push: { courses: newCourse._id } });

    // return response
    return res.status(200).json({
        success:true,
        message:"Course Created Successfully",
        data:newCourse,
    });

    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: "Failed to create course",
            error: error.message,
        });
    }
}

// getAllCourses handler function

exports.showAllCourses= async (req,res)=>{
    try{
    //  find call
    //  todo: change the below statement incrementally
      const allCourses= await Course.find({}, {courseName:true,
        price:true, thumbnail:true, instructor:true, ratingAndReviews:true, studentEnrolled:true,}).populate("instructor").exec();

        return res.status(200).json({
            success:true,
            message:"Data for all courses fetched successfully",
            data:allCourses,
        })
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: "cannot fetch course data ",
            error: error.message,
        });
    }
}