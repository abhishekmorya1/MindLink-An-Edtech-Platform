const mongoose = require("mongoose");
require('dotenv').config();

exports.connect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("✅ DB connected successfully");
    } catch (error) {
        console.error("❌ DB Connection Error:", error.message);
        process.exit(1);  // Exit the app only if necessary
    }
};