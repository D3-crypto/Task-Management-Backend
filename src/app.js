const globalErrorHandler = require('./middlewares/error.middleware');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRouter = require('./routes/auth.routes');
const taskRouter = require('./routes/task.routes');
const adminRouter = require('./routes/admin.routes');


const app = express();

app.use(helmet());

app.use(cors({
    origin:process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));

app.use(morgan('dev'));

app.use(express.json());

app.use(express.urlencoded({extended:true}));


app.use('/api/auth', authRouter);
app.use('/api/tasks', taskRouter);
app.use('/api/admin', adminRouter);


app.get('/api/health', (req,res)=>{
    res.status(200).json({
        success:true,
        message:'Server is running',
        timestamp:new Date().toISOString(),
        env:process.env.NODE_ENV,
        port:process.env.PORT
    });
});

app.use((req,res)=>{
    res.status(404).json({
        success:false,
        message:`Route ${req.originalUrl} not found`,
        timestamp:new Date().toISOString()
    });
})

app.use(globalErrorHandler);

module.exports=app;