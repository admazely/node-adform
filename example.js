var userName = 'pvts-admzdk';
var password = 'Pvts.987';
var adform = require('./adform');

// ticket is a security token you get when logged in used to do further
// actions with the api
var client = adform(userName, password);
client.getAdvertisers(function(err, advertisers) {
    advertisers.forEach(function(advertiser) {
        console.log('name: %s\tid: %s', advertiser.name, advertiser.id);
    });
});
