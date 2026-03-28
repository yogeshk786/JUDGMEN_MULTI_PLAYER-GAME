const mongoose = require('mongoose') ;
 
const connectDB = async () => {
    try{
        const conn =await mongoose.connect(process.env.Mongo_URI) ;
        
        console.log(`🟢 CLOUD MONGODB INITIATED : CONNECTED TO ATLAS (${conn.connection.host})`);
    }   catch (err) {
        console.error('cloud mongodb error.message ') ;
        process.exit(1) ;
    }

};

module.exports = connectDB ;
