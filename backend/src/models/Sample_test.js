import mongoose from "mongoose";
const Sample_test_schema= mongoose.Schema({
    username :{
        type:String,
        required:true
    },
    email:{
        type:String,
        required: true
    },
    password:{
        type:String,
        required: true
    }
})
const Sample_test=mongoose.model('Sample_test',Sample_test_schema);
export default Sample_test;