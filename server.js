require('dotenv').config();

const app = require('./src/app');

const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

connectDB();

const server  = app.listen(PORT,()=>{
    console.log(`Server is running on port : ${PORT}`)
    console.log(`Environment : ${process.env.NODE_ENV || 'developement'}`);
    console.log(`URL: http://localhost:${PORT}`)
})

process.on('unhandledRejection', (err) => {
    console.error('UNHANDELED REJECTION! Shutting down ...');
    console.error(err.name,err.message);
    server.close(()=>{
        process.exit(1);
    });
});
