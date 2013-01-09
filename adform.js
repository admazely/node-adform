var request = require('request').defaults({ jar: false });

var makeRequest = require('./lib/request.js');
var adform = exports;

adform.getAdvertisers = function(ticket, callback) {
    makeRequest(ticket, {
        uri: 'https://api.adform.com/Services/AdvertiserService.svc',
        action: 'http://www.adform.com/api/2010/06/IAdvertiserService/GetAdvertisers'
    }, function(err, etree) {
        var advertisers = etree.findall('./s:Body/Advertisers/Advertiser').map(function(advertiser) {
            return {
                name: advertiser.findtext('Name'),
                id: advertiser.findtext('Id')
            };
        });
        callback(null, advertisers);
    })
}

adform.createAd = function(ticket, campaign, name, data, callback) {
    makeRequest(ticket, {
        action: 'http://www.adform.com/api/2010/06/IAdService/CreateAd',
        uri: 'https://api.adform.com/Services/AdService.svc',
        data: {
            'ns:CreateAdData': {
                'ns:Ad': {
                    // 'ns:AdType': 'FlashAd',
                    'ns:Name': name,
                    'ns:CampaignId': campaign.id,
                    'ns:FileData': data.toString('base64'),
                    '_attr': {
                        'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
                        'xsi:type': 'ns:FlashAd'
                    }
                },
                'ns:IgnoreWarnings': true 
            }
        }
    }, callback);
}

adform.getCampaigns = function(ticket, advertiser, callback) {
    makeRequest(ticket, {
        uri: 'https://api.adform.com/Services/CampaignService.svc',
        action: 'http://www.adform.com/api/2010/06/ICampaignService/GetCampaigns',
        data: {
            'ns:GetCampaignsData': {
                'ns:AdvertiserId': advertiser.id
            }
        }   
    }, function(err, etree) {
        var campaigns = etree.findall('./s:Body/Campaigns/Campaign').map(function(campaign) {
            return {
                name: campaign.findtext('Name'),
                id: campaign.findtext('Id'),
                startDate: new Date(campaign.findtext('StartDate')),
                endDate: new Date(campaign.findtext('EndDate'))
            }
        });
        callback(null, campaigns);
    });
}

adform.login = function(username, password, callback) {
    var body = {
        "UserName": username,
        "Password": password
    };
    request.post({
            "json": true,
            "body": body,
            "uri": 'https://api.adform.com/Services/SecurityService.svc/JSON/Login',
            "headers": {
                'content-length': body.length
            }
        },
        function (err, res, ticket) {
            callback(err, ticket);
        }
    );
}