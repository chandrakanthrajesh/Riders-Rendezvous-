var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/milestone4', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
var Schema = mongoose.Schema;


var userSchema = new Schema({
  user_ID: {
    type: String,
    required: true
  },
  first_name: {
    type: String
  },
  last_name: {
    type: String
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type:String,
    required:true
  }
});

var userModel = mongoose.model('users', userSchema);


//getting user data
async function getUser(user_ID) {

  let data = await userModel.find({
    user_ID: user_ID
  })
  return data;
}


function getUserByEmail(email) {
  return userModel.findOne({
  email:email}).lean()
}


function getUserProfile(userName) {
  return userModel.findOne({
    email: userName
  })
}

function addNewUser(email) {
  const userID = Math.floor(1000 + Math.random() * 9000);
  const userPro = {
    email: email,
    user_ID: userID
  }
  return userModel.create(userPro)
}


module.exports = {
  getUser: getUser,
  getUserProfile: getUserProfile,
  addNewUser: addNewUser,
  getUserByEmail: getUserByEmail
};