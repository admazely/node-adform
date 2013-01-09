# node-adform[![build status](https://secure.travis-ci.org/admazely/node-adform.png)](http://travis-ci.org/admazely/node-adform)

## About
A node.js module to work with the adform [api](http://api.adform.com/Services/Documentation/Index.htm).

### Warning
This is far from feature complete. The API will change dramaticly in ways that aren't backwards compatible. There might be bugs etc etc.

## Installation
`npm install adform`

## Example

```javascript
    // this file is also available as example.js in the project root
    var adform = require('adform');

    // ticket is a security token you get when logged in used to do further
    // actions with the api
    adform.login(userName, password, function(err, ticket) {
        adform.getAdvertisers(ticket, function(err, advertisers) {
            // advertisers is a list of advertisers (clients) associated with
            // the logged in user
            console.log('Advertisers:');
            advertisers.forEach(function(advertiser) {
                console.log('name: %s id: %s', advertiser.name, advertiser.id);
            });
        });
    });
```