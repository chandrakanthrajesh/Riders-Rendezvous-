var mongoose = require('mongoose');
var connectionDB = require('./connectionDB');
mongoose.connect('mongodb://localhost:27017/milestone4', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
var Schema = mongoose.Schema;

var userConnectionSchema = new Schema({
    user_ID: {
        type: String,
        required: true
    },
    ID: {
        type: String,
        required: true
    },
    RSVP: {
        type: String,
        required: true
    },
});

var userConnectionModel = mongoose.model('userconnections', userConnectionSchema);
var connectionModel = mongoose.model('connections', connectionDB.connectionsSchema);

function getUsersConnections(user_ID) {
    return userConnectionModel.find({
        user_ID: String(user_ID)
    }).lean()
}


async function getUserRSVPd(user_ID) {

    let data = await userConnectionModel.find({
        user_ID: user_ID
    })
    return data;
}



//inserting data
async function addRSVP(rsvp, passedID) { //rsvp and passedID is the ID you get from the user
    let userConnection = {
        "ID": passedID,
        "rsvp": rsvp
    };
    let data = await userConnectionModel.insertOne(userConnection)
    return data;
}


//updating data
async function updateRSVP(rsvp, passedID, user_ID) {
    let userConnection = {
        "ID": passedID,
        "user_ID": user_ID,
        "rsvp": rsvp
    };
    let data = await userConnectionModel.updateOne({
        passedID: passedID,
        user_ID: user_ID
    }, userConnection)
    return data;
}


function addOrUpdateRSVP(user_ID, ID, RSVP) {
    return userConnectionModel.updateOne({
        user_ID, // => user_ID: userID
        ID: String(ID)
    }, {
        // user_ID,
        // ID: String(ID),
        RSVP
    }, {
        // this commands updates or adds
        upsert: true,
        // returns updated document
        new: true
    }).lean()
}


//delete data
function deleteConnection(ID, user_ID) {
    return userConnectionModel.deleteOne({
        ID: ID,
        user_ID: user_ID
    }).lean()
}


//add a new connection

function addingConnection(conn){
    var id = '998';
    id += Math.floor(Math.random() * 10) + 7;
     var defaultImage = "/assets/rider.jpg"
    var newConnection = {"ID":id,"heading":conn.heading,"name":conn.name,"diflev":conn.diflev,"details":conn.details,"date":conn.date,"time":conn.time,"loc":conn.loc,"imgURL":defaultImage};
    return (connectionModel.collection.insertOne(newConnection))
           
          }
        



module.exports = {
    getUserRSVPd: getUserRSVPd,
    addRSVP: addRSVP,
    updateRSVP: updateRSVP,
    addingConnection: addingConnection,
    deleteConnection: deleteConnection,
    getUsersConnections: getUsersConnections,
    addOrUpdateRSVP: addOrUpdateRSVP
};