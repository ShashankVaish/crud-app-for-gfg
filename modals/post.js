const mongoose = require('mongoose')

const postschema = mongoose.Schema({
   content:String,
   date:{
    type:Date,
    default:Date.now
   },
   likes:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'user'


   }],
   user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'user'
   }

})
module.exports=mongoose.model('post',postschema)