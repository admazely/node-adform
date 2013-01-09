var userName =;
var password =;
var adform = require('./adform');

// ticket is a security token you get when logged in used to do further
// actions with the api
adform.login(userName, password, function(err, ticket) {
    if (err) return console.error(err);
    adform.getAdvertisers(ticket, function(err, advertisers) {
        if (err) return console.error(err);
        // advertisers is a list of advertisers (clients) associated with
        // the logged in user
        console.log('Advertisers:');
        advertisers.forEach(function(advertiser) {
            console.log('name: %s id: %s', advertiser.name, advertiser.id);
        });
    });
});