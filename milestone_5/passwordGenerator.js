const bcrypt = require('bcrypt');

let saltRounds = 10;

bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash('CK@123', salt, function(err, hash) {
        console.log('hash: ', hash);
    });
});