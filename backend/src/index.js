import "dotenv/config";
import connectDB from "./db/index.js";
import { app } from "./app.js";

connectDB()
.then(()=>{
  app.listen(process.env.PORT || 8000, ()=>{
    console.log(`Server is running at port : ${process.env.PORT}`);
  })
})
.catch((err)=>{
  console.log("MongoDB connection failed", err);
})







/*
It is a good approach but it makes the index file clumze and non-Professional
import express from "express"
const app = express()

( async ()=>{
    try {
      await  mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`) 
      app.on("error", ()=>{
        console.log("Error", error);
        
      })

      app.listen(process.env.PORT, ()=>{
        console.log(`App is listening on port ${process.env.PORT}`);
        
      })
    } catch (error) {
        console.error("Error Aya hai ",error);
        
    }
})()
    */