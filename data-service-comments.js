const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
let Schema = mongoose.Schema;

var commentSchema = new Schema({
  "authorName" : String,
  "authorEmail" : String,
  "subject" : String,
  "commentText" : String,
  "postedDate" : Date,
  "replies" : [{
    "comment_id" : String,
    "authorName" : String,
    "authorEmail" : String,
    "commentText" : String,
    "repliedDate" : Date
  }]
});


let Comment; // to be defined on new connection (see initialize)


module.exports.initialize = function()
{
  return new Promise((resolve,reject)=>{
    let db = mongoose.createConnection("mongodb://ykim185:dbmaster@ds141410.mlab.com:41410/web322_a6");
    db.on('error', (err)=>{
      reject(err); // reject the promise with the provided error
    });
    db.once('open', ()=>{
      Comment = db.model("comments", commentSchema);
      resolve();
    });
  });
};

module.exports.addComment = function(data)
{
  return new Promise((resolve,reject)=>{
    data.postedDate = Date.now();
    let newComment = new Comment(data);
    newComment.save((err)=>{
      if(err){
        reject("There was an error saving the comment =>" +err+"<=" );
      }
      else {
        resolve(newComment._id);
      }
    });
  });
}

module.exports.getAllComments = function()
{
  return new Promise((resolve,reject)=>{
    Comment.find().sort({"postedDate":1}).exec().then((result)=>{
      if(!result)
      {
        throw new Error("No result returned");
        //reject(result);
      }else {
        resolve(result);
      }
    }).catch((err)=>{
      reject("There was an error : "+err);
    });
  });
};

module.exports.addReply = function(data)
{
  return new Promise((resolve,reject)=>{
    data.repliedDate=Date.now();
    Comment.update(
      {_id : data.comment_id},
      {$addToSet : {replies : data}}
    ).exec().then((result)=>{
      if(!result)
      {
        throw new Error("No result returned");
        //reject(result);
      }
      else {
        resolve(result);
      }
    }).catch((err)=>{
      reject("There was an error : "+err);
    });
  });
}
