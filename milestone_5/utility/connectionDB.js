const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/milestone4', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const Schema = mongoose.Schema;

const connectionsSchema = new Schema({
  ID: {
    type: String,
    required: true
  },
  heading: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  diflev: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  loc: {
    type: String,
    required: true
  },
  loc: {
    type: String,
    required: true
  },
  going: {
    type: String,
    required: true
  },
  imgURL: String
});


const connectionModel = mongoose.model('connections', connectionsSchema);


//returning whole data
async function getConnection() {
  return connectionModel.find({}).lean()
}

//returning data by passing ID
async function getConnectionsByID(ID) {
  return connectionModel.findOne({
    "ID": ID
  }).lean()
}

async function getConnectionsByIDS(ID_ARRAY) {

  return connectionModel.find({
    "ID": {
      "$in": ID_ARRAY
    }
  }).lean()
}


async function getuniqueCategories() { //making connections dynamic
  return (connectionModel.distinct("heading"))
}

async function getdiflev() {
  return connectionModel.distinct("diflev");
}





function listingFunction(abc) {
  allHeadings = new Set(abc.map(x => x.heading))
  allHeadings = Array.from(allHeadings)
  let newArray = [];
  for (let i = 0; i < allHeadings.length; i++) {
    subArray = []
    for (let index = 0; index < abc.length; index++) {
      if (allHeadings[i] === abc[index].heading) {
        subArray.push(abc[index])
      }

    }
    newArray.push({
      key: allHeadings[i],
      list: subArray
    })
  }
  return newArray
};

const subsetconnection = [];

module.exports.getSubConnection = () => {

  return subsetconnection; //stored connection
}



function getFormattedSavedConnections(subConnection, getTotalSubConnection) {

  for (let i = 0; i < getTotalSubConnection.length; i++) {
    for (let j = 0; j < subConnection.length; j++) {
      if (getTotalSubConnection[i].ID === subConnection[j].ID) {
        subConnection[j].diflev = getTotalSubConnection[i].diflev
        subConnection[j].heading = getTotalSubConnection[i].heading
        break
      }

    }
  }

  return subConnection

}




module.exports = {
  getConnection: getConnection,
  getConnectionsByID: getConnectionsByID,
  getuniqueCategories: getuniqueCategories,
  getdiflev: getdiflev,
  listingFunction: listingFunction,
  getConnectionsByIDS: getConnectionsByIDS,
  getFormattedSavedConnections: getFormattedSavedConnections
}