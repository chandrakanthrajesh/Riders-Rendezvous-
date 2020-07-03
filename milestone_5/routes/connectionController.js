const express = require('express');
const router = express.Router();
const app = express();
var { check, validationResult } = require('express-validator');
const userProfileDB = require('../utility/userProfileDB');
const connectionDB = require("../utility/connectionDB")
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const urlEncodedParser = bodyParser.urlencoded({
    extended: false
});


app.set('view engine', 'ejs');



router.get('/', function (req, res) {
    res.render('index', {
        user: req.session.theUser
    })
});


router.get('/index', function (req, res) {
    res.render('index', {
        user: req.session.theUser
    });
});


router.get('/about', function (req, res) {
    res.render('about', {
        user: req.session.theUser
    });
});


router.get('/contact', function (req, res) {
    res.render('contact', {
        user: req.session.theUser
    });
});

router.get('/newConnection',function(req,res){                   //renders new connection
   
  var errors =validationResult(req);
  var user = req.session.theUser;
 if(!errors.isEmpty()){

  res.render('newConnection',{user:req.session.theUser,error:errors.array(),flag:false})
}else if(user == null){
  res.render('newConnection',{user:req.session.theUser,error:undefined,flag:true})
}else{
  userConnectionDB.addingConnection(req.body,user);
 res.redirect('/connections');
}


//adding new data by taking the user input
router.post('/newConnection', urlEncodedParser, async function (req, res) {
    let data = req.body
    await userProfileDB.addaConnection(data);
    res.redirect('/connections');
});
})



router.get('/connections', async function (req, res) {
    const data = await connectionDB.getConnection();
    const dynamicData = await connectionDB.listingFunction(data);
    const categories = await connectionDB.getuniqueCategories();
    res.render('connections', {
        dataNew: dynamicData,
        user: req.session.theUser
    });
});


router.get('/connection/savedconnections', async function (req, res) {
    //const data = connectionDB.getSubConnection();
    console.log(req.query)

    const sessionUserProfile = req.session.theUser

    if (!sessionUserProfile) {
        // redirect him to login page
        res.redirect('/login')
        return
    }
    // get subconnections
    // if sub connections are empty -  do nothing
    let subConnection = await userProfileDB.getUsersConnections(sessionUserProfile['user_ID'])
    let ID_ARRAY = subConnection.map(x => x.ID)
    let getTotalSubConnection = await connectionDB.getConnectionsByIDS(ID_ARRAY)

    // manipulate data accoring to sub connection

     subConnection = connectionDB.getFormattedSavedConnections(subConnection, getTotalSubConnection)


    if (!parseInt(req.query.ID)) {
        //just to show user connections
        res.render('savedConnections', {
            data: subConnection,
            user: req.session.theUser
        });
        return
    }

    const ID = (req.query.ID);

    const deleteQuery = req.query.delete;

    if (deleteQuery === 'true') {
        let poppedData = await userProfileDB.deleteConnection(ID, sessionUserProfile['user_ID']);
         subConnection = await userProfileDB.getUsersConnections(sessionUserProfile['user_ID'])
         ID_ARRAY = subConnection.map(x => x.ID)
         getTotalSubConnection = await connectionDB.getConnectionsByIDS(ID_ARRAY)
         subConnection = connectionDB.getFormattedSavedConnections(subConnection, getTotalSubConnection)
    
        res.render('savedConnections', {
            data: subConnection,
            user: req.session.theUser
        });

        return

    }


    const rsvp = req.query.RSVP;
    const updatedData = await userProfileDB.addOrUpdateRSVP(sessionUserProfile['user_ID'], ID, rsvp); //doubt cleared
     subConnection = await userProfileDB.getUsersConnections(sessionUserProfile['user_ID'])
     ID_ARRAY = subConnection.map(x => x.ID)
     getTotalSubConnection = await connectionDB.getConnectionsByIDS(ID_ARRAY)
     subConnection = connectionDB.getFormattedSavedConnections(subConnection, getTotalSubConnection)

    res.render('savedConnections', {
        data: subConnection,
        user: req.session.theUser
    }); //taking all the data from connectionDB so that we can use it in savedconnections page
});


router.get('/connection/:ID', async function (req, res) {
    const ID = req.params.ID;
    console.log(ID);
    // const category = await connectionDB.getuniqueCategories(); //headings

    if (ID) {
        const result = await connectionDB.getConnectionsByID(ID); //going through the data by ID
        if (result) {
            res.render('connection', {
                data: result,
                user: req.session.theUser
            });
        } else {
            res.send('No Connection Code available');
        }
    } else {
        res.render('connections', {
            data: [],
            categories: category,
            user: req.session.theUser
        }); //non functional, so i made the data empty
    }
});

router.get('*', function (req, res) {
    res.render('error');
});

module.exports = router;