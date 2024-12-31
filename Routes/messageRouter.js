const express = require('express');
const {UserModel, MsgModel} = require("../DB/DBmodel")
const router = express.Router();
const { chatList,searchByName,lastMsg } = require('../Controller/messageController')

router.get("/conversationList/:currentUserId", chatList)

router.delete("/deleteMsg/:id", async function(req,res){
  try {
    // Find sms and delete it
    const msg = await MsgModel.findByIdAndDelete(req.params.id)
    res.status(200).send("Message is deleted")
  } catch (error) {
    res.status(500).send("Something went wrong")
  }
}) 

router.get('/getMsg/:userId/:destinationId', async function(req,res,next){
    try {
      const messages = await MsgModel.find({
        $or: [
          { sender: req.params.userId , receiver: req.params.destinationId},
          { receiver: req.params.userId, sender: req.params.destinationId},
        ],
  
      })
      res.send(messages)
      
    } catch (error) {
      
    }
})
 
router.post('/postMsg/:userId/:destinationId', async function(req,res,next){
    try {
      const addMsg = await MsgModel.create({
        sender : req.params.userId,
        receiver: req.params.destinationId ,
        message: req.body.textMessage,
      })
      addMsg.save()
  
      res.send(addMsg)
    } catch (error) {
      console.log(error);
    }
    
})
router.get("/contact/:contactName", searchByName)
router.get("/singleContact/lastmessage/:constactId/:userId", lastMsg)
module.exports = router

// Working on delete router
