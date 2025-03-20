const Tag =  require("../models/tags");

// create tag handler

exports.createTag = async(req,res) =>{
    try{
    //  fetch data from req body
    const {name,description}=req.body;

    // validation
    if(!name || !description){
        return res.status(400).json({
            success:false,
            message:"All fields are required",
        })
    }
    // create entry in db
     const tagDetails= await Tag.create({
        name:name,
        description:description,
     });
     console.log(tagDetails);

    //  return response
    return res.status(200).json({
        success:false,
        message:"Tag Created Successfully",
    })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}


// getAllTags handler function

exports.ShowAllTags = async(req,res)=>{
    try{
    // create find function
    const allTags= await Tag.find({},{name:true, description:true});

    res.status(200).json({
        success:false,
        message:"All tags returned successfully",
        allTags,
    })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}


