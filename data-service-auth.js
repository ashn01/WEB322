
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

mongoose.Promise = global.Promise;
let Schema = mongoose.Schema;

var userSchema = new Schema({
  "user" : {
    "type" : String,
    "unique" : true},
  "password" : String
});


let User; // to be defined on new connection (see initialize)


module.exports.initialize = function()
{
  return new Promise((resolve,reject)=>{
    let db = mongoose.createConnection("mongodb://ykim185:dbmaster@ds135983.mlab.com:35983/web322_a7");
    db.on('error', (err)=>{
      reject(err); // reject the promise with the provided error
    });
    db.once('open', ()=>{
      User = db.model("users", userSchema);
      resolve();
    });
  });
};

module.exports.registerUser = function(userData)
{
  return new Promise((resolve,reject)=>{
    if(userData.password != userData.password2)
    reject("Passwords do not match");
    else
    {

      bcrypt.genSalt(10, function(err, salt) { // Generate a "salt" using 10 rounds
        bcrypt.hash(userData.password, salt, function(err, hash) { // encrypt the password: "myPassword123"
          // TODO: Store the resulting "hash" value in the DB
          if(err)
          {
            reject("There was an error encrypting the password => "+err+" <=");
          }
          else{
            userData.password = hash;
            let newUser = new User(userData);
            newUser.save((err)=>{
              if(err)
              {
                if(err.code == "11000")
                reject("User Name already taken");
                else if(err)
                reject("There was an error creating the user: => "+err+" <=");
              }
              else
              resolve();
            });

          }
        });
      });
    }
  });
};

module.exports.checkUser = function(userData)
{
  return new Promise((resolve,reject)=>{
    User.find({user:userData.user})
    .exec()
    .then((users)=>{
      bcrypt.compare(userData.password, users[0].password).then((res) => {
        // res === true if it matches and res === false if it does not match
        if(res === true)
        {
            resolve();
        }
        else if(res === false)
        {
          reject("Incorrect Password for user: => "+userData.user+" <=");
        }
      });
    }).catch((err)=>{
      reject("Unable to find user: => "+userData.user+" <=");
    });
  });
};

module.exports.updatePassword = function(userData)
{
  return new Promise((resolve,reject)=>{
    if(userData.password != userData.password2)
    reject("Passwords do not match");
    else
    {

      bcrypt.genSalt(10, function(err, salt) { // Generate a "salt" using 10 rounds
        bcrypt.hash(userData.password, salt, function(err, hash) { // encrypt the password: "myPassword123"
          // TODO: Store the resulting "hash" value in the DB
          if(err)
          {
            reject("There was an error encrypting the password => "+err+" <=");
          }
          else{
            User.update({user:userData.user},
              {$set:{password:hash}},
              {multi:false})
            .exec()
            .then(()=>{
              resolve();
            }).catch((err)=>{
              reject("There was an error updating the password for "+userData.user+" "+err);
            });
          }
        });
      });
    }
  });
};
