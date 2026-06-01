const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'Provide your Name'],
        trim: true,
        maxlength: [30, 'Name cannot be longer than 30 characters']
    },

    email:{
        type: String,
        required: [true, 'Provide your Email'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 
            "Please provide a valid Email"
        ]
        
    },
    password:{
        type: String,
        required: true,
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false
    },
    role:{
        type: String,
        enum:{
            values:['admin', 'manager','employee'],
            message: 'Role must be either: admin, manager, or employee'
        },
        default: 'employee'
    },
    isActive:{
        type: Boolean,
        default: true
    }
},{
    timestamps: true
});

userSchema.pre('save', async function(){
    if(!this.isModified('password')) return;
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function(candisatePassword){
    return await bcrypt.compare(candisatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
