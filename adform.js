var EventEmitter = require('events').EventEmitter;
var util = require('util');

var request = require('request').defaults({ jar: false });

var Advertiser = require('./lib/advertiser');
var makeRequest = require('./lib/request.js');
var adform = exports;
var IDLE = 0, AUTHORIZING = 1, AUTHORIZED = 2;

function Adform(username, password) {
    if (!(this instanceof Adform)) return new Adform(username, password);
    EventEmitter.call(this);
    this.ticket = null;
    this.status = IDLE;
    this.username = username;
    this.password = password;
}
util.inherits(Adform, EventEmitter);

Adform.prototype.login = function() {
    var self = this;
    request.post({
            "json": true,
            "body": {
                "UserName": this.username,
                "Password": this.password
            },
            "uri": 'https://api.adform.com/Services/SecurityService.svc/JSON/Login'
        },
        function (err, res, ticket) {
            console.log('emit ticket');
            self.ticket = ticket;
            self.status = AUTHORIZED;
            self.emit('ticket');
        }
    );
}

Adform.prototype.request = function (opts, callback) {
    var self = this;
    if (this.status === AUTHORIZING) {
        this.once('ticket', function() {
            self.request(opts, callback);
        });
        return;
    }
    if (this.status === IDLE) {
        this.once('ticket', function() {
            self.request(opts, callback);
        });
        this.status = AUTHORIZING;
        this.login();
        return;
    }
    makeRequest(this.ticket, opts, callback);
}

Adform.prototype.getAdvertisers = function(callback) {
    var self = this;

    this.request({
        uri: 'https://api.adform.com/Services/AdvertiserService.svc',
        action: 'http://www.adform.com/api/2010/06/IAdvertiserService/GetAdvertisers'
    }, function(err, etree) {
        var advertisers = etree.findall('./s:Body/Advertisers/Advertiser').map(function(data) {
            var name = data.findtext('Name');
            var id = Number(data.findtext('Id'));
            return new Advertiser(self, name, id)
        });
        callback(null, advertisers);
    });
}

module.exports = Adform;