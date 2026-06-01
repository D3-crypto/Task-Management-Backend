const mongoose = require('mongoose');

const connectDB = async() => {
    try{
        const conn = await mongoose.connect(process.env.MONGODB_URI);

        console.log(`MongoDB Connected : ${conn.connection.name}`);
    }
    catch(err){
        console.log(`MONGO Connection Error : ${err.message}`);
        process.exit(1);
    }
};

mongoose.connection.on('disconnected', () => {
    console.log(`MongoDB Disconnected`);
});

mongoose.connection.on('error', (err)=>{
    console.log(`MongoDB Error : ${err.message}`);
})

module.exports = connectDB;