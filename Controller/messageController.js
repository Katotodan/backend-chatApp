const { MsgModel,UserModel } = require("../DB/DBmodel")

const chatList = async function(req,res,next){
    try {
      const messages = await MsgModel.aggregate([
        // Match messages where user is either sender or receiver
        {
          $match: {
            $or: [
              { sender: req.params.currentUserId },
              { receiver: req.params.currentUserId }
            ]
          }
        },
        
        
        
        // // Group by both sender and receiver to create unique conversations
        {
          $addFields: {
            conversationId: {
              $cond: {
                if: { $lt: ["$sender", "$receiver"] },
                then: { $concat: ["$sender", "-", "$receiver"] },
                else: { $concat: ["$receiver", "-", "$sender"] }
              }
            }
          }
        },
        
         // Group by conversation ID and get the first (latest) message
        {
          $group: {
            _id: "$conversationId",
            lastMessage: { $last: "$$ROOT" }
          }
        },
        // Replace root to clean up the output
        {
          $replaceRoot: { newRoot: "$lastMessage" }
        },
        // // Sort by timestamp descending to get latest messages first
        {
          $sort: { "time": -1 }
        },
        
        
        
        
        
      ]);
    
      res.json(messages)
      
    } catch (error) {
      console.log(error);
      res.send([])
      
    }
}

const searchByName = async (req,res,next)=>{
  try {
    // Search user with username simular to req.params.contactName
    const data = req.params.contactName
    

    const user = await UserModel.find({ 
      $and: [
        // Username contains the search string (case-insensitive)
        { username: { $regex: data, $options: 'i' } },
        // Exclude the current user
        { username: { $ne: req.user.username  } }
      ]
    });
    
    res.status(200).json(user)
  } catch (error) {
    res.status(400).json({"err": error.message})
  }
}
const chatInfo = async(req, res, next)=>{
  try {
    const user = await UserModel.findOne({_id: req.params.id}).exec()    
    if(user){
      res.status(200).json(user)
    }else{
      res.status(404).json({"status": "fail", "message": "No user found"})
    }
  } catch (error) {
    res.status(400).json({"status": "fail", "message": "Something went wrong"})
  }
}

module.exports = {chatList, searchByName, chatInfo}

// I should work on message, when send message the scroll should be automatic
