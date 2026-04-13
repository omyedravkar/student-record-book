const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    prn: { type : String , required : true, unique : true }, 
    name : { type : String , required : true }, 
    email : { type : String , require: true , unique : true },  
    password : { type : String , required : true },
    role : { type : String , enum : ['student', 'admin', 'mentor' ,'placement'] ,
        required : true 
    }, 
    branch : { type : String  },
    year : { type : Number },
    mentor_id : { type : mongoose.Schema.Types.ObjectId , ref : 'User' },
});

module.exports = mongoose.model('User', userSchema);