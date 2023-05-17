
const mongoose = require('mongoose')
const Users = require('../models/userModel')
const review = require('../models/review.Model')
const { log } = require('npmlog')
const session = require('express-session')

// riview

const insertReview = async (req, res) => {
    try {
     
      const comment = req.body.comment;   
      const proid = req.body.id;   
      const user = req.session.user_id;
      const userdata = await Users.findOne({ _id: user });
  
      
        const newReview = new review({

          userId:req.session.user_id,  
          user: userdata.name,
          productId: proid,
          comment: comment,
          date: new Date(),
         
        });
  
        const reviewSave = await newReview.save();
  
        if (reviewSave) {
          res.json({ success: true });
        }
      
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: 'Server Error' }); // Send error response to client
    }
  }

  
 const editreview= async (req,res)=>{
    try {
       const id= req.body.id
       const comments= req.body.comments
         const succ=  await review.findByIdAndUpdate({_id:id},{$set:{comment:comments}})
      
        if(succ){
           res.json({ success: true });
        }


    } catch (error) {
        console.log(error);
    }
 } 

 const deletereview = async (req,res)=>{
    try {
       const id= req.body.id
        const suc=  await review.deleteOne({_id:id})
       
        if(suc){
        res.json({ success: true });
        }


    } catch (error) {
        console.log(error);
    }
 } 


 
module.exports = {

    insertReview,
    deletereview,
    editreview
   
}