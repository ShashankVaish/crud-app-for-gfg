const mongoose = require('mongoose')
mongoose.connect(`mongodb://127.0.0.1:27017/miniproject`)
const userschema = mongoose.Schema({
    name:String,
    username:String,
    email:String,
    password:String,
    post:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'post'
        }
    ],
    profilepic:{
        type:String,
        default:'default.png'
    }

})
module.exports=mongoose.model('user',userschema)