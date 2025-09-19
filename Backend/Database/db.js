const mongoose=require('mongoose');

const connectToDB= async()=>{
  try{
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Successfully Connected");
  }catch(e){
    console.log("Failure in connection:",e);
    process.exit(1);
  }
}

module.exports= connectToDB;