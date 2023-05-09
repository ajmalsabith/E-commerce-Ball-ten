
const mongoose = require('mongoose')

const Users = require('../models/userModel')
const review = require('../models/review.Model')
const { log } = require('npmlog')
const session = require('express-session')

// riview

const insertReview = async (req, res) => {
    try {
        console.log('ajmal1212');
      const comment = req.body.comment;
      console.log(comment);
      const proid = req.body.id;
      console.log(proid);
      const user = req.session.user_id;
      console.log('ajmal1212');
      const userdata = await Users.findOne({ _id: user });
  
      
        const newReview = new review({

          userId:req.session.user_id,  
          user: userdata.name,
          productId: proid,
          comment: comment,
          date: new Date(),
         
        });
        console.log('ajmal1212')
  
        const reviewSave = await newReview.save();
  
        if (reviewSave) {

            console.log('ajumalaaaa');
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
        console.log(succ);
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
       console.log(id);
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