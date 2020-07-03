const express = require('express');
const router = express.Router();
const app = express();
const userDB = require('../utility/userdb');
const bodyParser = require('body-parser');
const userProfileDB = require('../utility/userProfileDB');
const bcrypt = require('bcrypt');
const connectionDB = require("../utility/connectionDB");
var { check, validationResult } = require('express-validator');
const urlEncodedParser = bodyParser.urlencoded({
    extended: false
});



app.set('view engine', 'ejs');

//
router.get('/login', function (req, res) {
    res.render('login', {
        user: req.session.theUser,
        errors:null,
        valid:false
    })
});

router.get('/logout', function (req, res) {

    req.session.destroy();

    res.redirect('/index');

});




router.post('/login', [
    check('username')
    .isEmail()
    .normalizeEmail()
    .trim().escape().withMessage("Please enter a valid username, i.e an email id."),
    check('password')
    .isLength({ min: 6 })
    .trim().escape().withMessage("Invalid password length.")
],
//handling post request
async function(req, res) { 
    const errors = validationResult(req);
    //if errors is not empty render login page 
    if (!errors.isEmpty()) {
        return res.render('login', {
            user: null,
            errors: errors.array()
        });
    }

    console.log("email: ", req.body.username)
    //reading email and password
    const email = req.body.username; 
    const password = req.body.password;
    const userExist = await userDB.getUserByEmail(email);
    //when we try to login, if the user exists in the mongoDB
    if (userExist) {
        //if the user exists,
        //bcrypting the password
        //why bcrypt the password? cz passwords are easy to hack and hackers have found the way to hack into one way hashed passwords, so we use salting 
        //it adds additional string to your password and make it more secure. random salting makes it more secure.align
        //bcrypt is a more efficient way.
        //here in the code it is just going to check if the entered password and te password stored in user profile are the same.
        bcrypt.compare(password, userExist.password, async function(error, result) {
            //so the logic behind the login page is that we first check if the userexist comparing it to the user we have entered on the website
            //next if it exists we are storing that user in the session and creating a variable called subconnection and ID_ARRAY to retrieve the userid
            //next we are creating variable gettotalcubconnection and passing in the ID_ARRAY and retriving the data which will be displayed in savedconnection page as default data

            console.log("userExist.password: ", userExist.password);
            console.log("password: ", password);
            if (result == true) {
                //storing the existing user inside the session
                req.session.theUser = userExist;
                //we are storing the user id from the userprofiledb inside subconnection
                let subConnection = await userProfileDB.getUsersConnections(userExist['user_ID'])
                console.log('SubConnection=>'+subConnection);
                //we are mapping the IDs fron the subconnection
                let ID_ARRAY = subConnection.map(x => x.ID)
                console.log('mappedIDs=>'+ID_ARRAY)
                //getting data using the userID
                let getTotalSubConnection = await connectionDB.getConnectionsByIDS(ID_ARRAY)
                console.log("totalsubconnection=>"+getTotalSubConnection[1]);


                subConnection = connectionDB.getFormattedSavedConnections(subConnection, getTotalSubConnection)
                //data variable here represents the data that is present in the user's data stored in the db, so whenever he logs in it will have a 
                //log of the data stored already and it will redirect us to there(savedconnectioons page).
                res.render('savedConnections', {
                    data: subConnection,
                    user: req.session.theUser
                });

            }
            //if the credentials arent matching
            else {

                errorMessage = "please check your credentials once"
                res.render('login', { user: null, errors: [{ msg: errorMessage }] });
            }
        });

        //if the USER does not exist
    } else {
        errorMessage = "User not found."
        res.render('login', { user: null, errors: [{ msg: errorMessage }] });
    }
});



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
    res.render('newConnection',{user:req.session.theUser,error:null,flag:false})})



//adding new data by taking the user input
router.post('/newConnection', urlEncodedParser,[
    check('heading').matches(/^[a-z ]+$/i).trim().escape().withMessage('topic should only have alphabets'),
    check('name').isAlphanumeric().trim().escape().withMessage('Name should include only alphabets'),
    check('diflev').isAlphanumeric().trim().escape().withMessage('Name should include only alphabets'),
    check('details').isLength({ min: 3}).trim().escape().withMessage('Minimum length of details should be 3'),
    check('date').isLength({min:6}).escape().withMessage('Minimum length of date should be 6'),
    check('time').matches(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/).trim().escape().withMessage('Time format is invalid'),
    check('loc').isLength({min:3}).trim().escape().withMessage('Minimum length of location should be 3'),
  ], async function (req, res) {
    var errors =validationResult(req);
    if(!errors.isEmpty()){
   
      res.render('newConnection',{user:req.session.theUser,error:errors.array()})
    }else{
    await userProfileDB.addingConnection(req.body);
    res.redirect('/connections');
    }
});



router.get('/connections', async function (req, res) {
    //entire data
    const data = await connectionDB.getConnection();
    //just the heading data
    const dynamicData = await connectionDB.listingFunction(data);
    //const categories = await connectionDB.getuniqueCategories();
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
    switch (rsvp) {
        case "Yes":
        case "No":
        case "Maybe":
            break;
        default:
            {
                res.render('savedConnections', {
                    data: subConnection,
                    user: req.session.theUser
                });
                return;
            }
    }
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



router.get('/connection/:ID', [
    check("ID").isNumeric().trim().escape()
],
async function(req, res) {
    const ID = req.params.ID;
    console.log(ID);

  

    const errors = validationResult(req);
    //if there is no problem with the user ID
    //if we enter anything other than numbers in the connection ID it is going to redirect us to connections page.
    if (!errors.isEmpty()) {
        console.log("came here");
        return res.redirect("/connections");
    }
    
    if (ID) {
        const result = await connectionDB.getConnectionsByID(ID); //going through the data by ID
        console.log('result'+result);
        if (result) {
            res.render('connection', {
                //data will consist the data according the passed ID
                data: result,
                user: req.session.theUser
            });
        } else {
            res.send('No Connection Code available');
        }
        //if there is a problem with the user ID
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