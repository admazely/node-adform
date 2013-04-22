var url = require('url');

var request = require('request').defaults({ jar: false });

var makeRequest = require('./lib/request.js');
var adform = exports;

adform.getAdvertisers = function(ticket, callback) {
    makeRequest(ticket, {
        uri: 'https://api.adform.com/Services/AdvertiserService.svc',
        action:
            'http://www.adform.com/api/2010/06/IAdvertiserService/GetAdvertisers'
    }, function(err, etree) {
        var rawAdvertisers = etree.findall('./s:Body/Advertisers/Advertiser');
        var advertisers = rawAdvertisers.map(function(advertiser) {
            return {
                name: advertiser.findtext('Name'),
                id: advertiser.findtext('Id')
            };
        });
        callback(null, advertisers);
    });
};

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
                        'xmlns:xsi':
                            'http://www.w3.org/2001/XMLSchema-instance',
                        'xsi:type': 'ns:FlashAd'
                    }
                },
                'ns:IgnoreWarnings': true
            }
        }
    }, callback);
};

adform.getCampaigns = function(ticket, advertiser, callback) {
    makeRequest(ticket, {
        uri: 'https://api.adform.com/Services/CampaignService.svc',
        action:
            'http://www.adform.com/api/2010/06/ICampaignService/GetCampaigns',
        data: {
            'ns:GetCampaignsData': {
                'ns:AdvertiserId': advertiser.id
            }
        }
    }, function(err, etree) {
        var rawCampaigns = etree.findall('./s:Body/Campaigns/Campaign');
        var campaigns = rawCampaigns.map(function(campaign) {
            return {
                name: campaign.findtext('Name'),
                id: campaign.findtext('Id'),
                startDate: new Date(campaign.findtext('StartDate')),
                endDate: new Date(campaign.findtext('EndDate'))
            };
        });
        callback(null, campaigns);
    });
};

adform.getAdStats = function(ticket, campaign, startDate, endDate, callback) {

    function formatStats(stats) {
        return {
            impressions: Number(stats.findtext('Impressions')),
            clicks: Number(stats.findtext('Clicks')),
            leads: Number(stats.findtext('Leads')),
            sales: Number(stats.findtext('Sales'))
        };
    }
    function formatAd(ad) {
        return {
            id: Number(ad.findtext('Id')),
            days: ad.findall('./Days/Day').map(function(day) {
                var stats = day.find('Stats');
                return {
                    date: new Date(day.findtext('Date')),
                    stats: formatStats(day.find('Stats'))
                };
            })
        };
    }

    var ns = 'http://www.adform.com/api/CampaignStatsService/2010/09';

    makeRequest(ticket, {
        uri: 'https://api.adform.com/Services/CampaignStatsService.svc',
        action:
            'http://www.adform.com/api/CampaignStatsService/2010/09/' +
                'ICampaignStatsService/GetAdStats',
        data: {
            'ns1:GetAdStatsData': {
                'ns1:IdFilter': {
                    'ns:CampaignId': {
                        '_attr': {
                            'xmlns:ns': ns
                        },
                        '_text': campaign.id
                    },
                    '_attr': {
                        'i:type': 'ns1:CampaignIdFilter',
                        'xmlns:i': 'http://www.w3.org/2001/XMLSchema-instance'
                    }
                },
                // transform startDate and endDate to 'yyyy-mm-dd' format
                'ns1:StartDate': startDate.toJSON().slice(0, 10),
                'ns1:EndDate': endDate.toJSON().slice(0, 10)
            }
        },
        namespaces: [{
            name: 'ns1',
            src: ns
        }]

    }, function(err, etree) {
        if (err) {
            console.log(err.body);
            throw err;
        }
        var ads = etree.findall('./s:Body/Campaign/Ads/Ad').map(formatAd);
        callback(null, ads);
    });
};

adform.getFeeds = function(ticket, advertiser, callback) {
    function formatFeed(feed) {
        console.log(feed.find('Transformation'))
        var lastRunTime = feed.findtext('LastRunTime');
        if (lastRunTime)
            lastRunTime = new Date(lastRunTime)

        return {
            type: feed.get('i:type'),
            code: feed.findtext('Code'),
            name: feed.findtext('Name'),
            source: feed.findtext('Source/Url') + feed.findtext('FilePath'),
            schedule: {
                interval: feed.findtext('Schedule/Interval'),
                startHour: feed.findtext('Schedule/StartHour')
            },
            endDate: new Date(feed.findtext('EndDate')),
            lastRunTime: lastRunTime,
            lastRunStatus: feed.findtext('LastRunStatus'),
            notificationEmail: feed.findtext('NotificationEmail'),
            templateId: Number(feed.findtext('TemplateId')),
            transformation: {
                name: feed.findtext('Transformation/Name'),
                defaultProductName: feed.findtext('Transformation/DefaultProductName'),
                description: feed.findtext('Transformation/Description'),
                xslt: feed.findtext('Transformation/Xslt'),
                defaultRedirectUrl: feed.findtext('Transformation/DefaultRedirctUrl'),
                templateLandingPage: feed.findtext('Transformation/TemplateLandingPage')
            }
        }
    }

    var ns = 'http://www.adform.com/api/ProductService/2010/09';

    makeRequest(ticket, {
        uri: 'https://api.adform.com/Services/ProductService.svc',
        action: 'http://www.adform.com/api/ProductService/2010/09/' +
            'IProductService/GetFeeds',
        data: {
            'ns1:GetFeedsData': {
                'ns1:AdvertiserName': advertiser.name
            }
        },
        namespaces: [{
            name: 'ns1',
            src: ns
        }]
    }, function(err, etree) {
        if (err) {
            console.log(err.body);
            throw err;
        }
        console.log(etree)
        callback(
            null,
            etree.findall('./s:Body/Feeds/Feed').map(formatFeed)
        )
    })
}

adform.deleteFeed = function(ticket, feed, callback) {
    var ns = 'http://www.adform.com/api/ProductService/2010/09';

    makeRequest(ticket, {
        uri: 'https://api.adform.com/Services/ProductService.svc',
        action: 'http://www.adform.com/api/ProductService/2010/09/' +
            'IProductService/DeleteFeed',
        data: {
            'ns1:DeleteFeedData': {
                'ns1:FeedCode': feed.code
            }
        },
        namespaces: [{
            name: 'ns1',
            src: ns
        }]
    }, function(err) {
        if (err) {
            console.log(err.body);
            throw err;
        }
        callback(null);
    })
}

adform.getTemplates = function(ticket, advertiser, callback) {
    var ns = 'http://www.adform.com/api/ProductService/2010/09';

    function formatTemplate(template) {
        return {
            id: Number(template.findtext('Id')),
            title: template.findtext('Title')
        };
    }

    makeRequest(ticket, {
        uri: 'https://api.adform.com/Services/ProductService.svc',
        action: 'http://www.adform.com/api/ProductService/2010/09/' +
            'IProductService/GetTemplates',
        data: {
            'ns1:GetTemplatesData': {
                'ns1:AdvertiserName': advertiser.name
            }
        },
        namespaces: [{
            name: 'ns1',
            src: ns
        }]
    }, function(err, etree) {
        if (err) {
            console.log(err.body);
            throw err;
        }
        var templates = etree.findall('./s:Body/Templates/Template').map(formatTemplate);
        callback(null, templates);
    });
}


adform.saveProductFeed = function(ticket, opts, callback) {
    var ns = 'http://www.adform.com/api/ProductService/2010/09';

    if (!opts.source) {
        return callback(new TypeError('opts.souce can not be undefined'))
    }

    var tmp = url.parse(opts.source);
    var sourceUrl = 'http://' + tmp.host;
    var filePath = tmp.path.slice(1);

    var xslt = '<![CDATA[' + opts.xslt + ']]>';
    var schedule = {
        'ns1:Interval': opts.schedule.interval
    }
    if (opts.schedule.startHour) {
        schedule['ns1:StartHour'] = opts.schedule.startHour;
    }

    makeRequest(ticket,
        {
            uri: 'https://api.adform.com/Services/ProductService.svc',
            action: 'http://www.adform.com/api/ProductService/2010/09/' +
                'IProductService/SaveProductFeed',
            data : {
                'ns1:SaveProductFeedData': {
                    _attr: {
                        'xmlns:i': 'http://www.w3.org/2001/XMLSchema-instance',
                        'xmlns': 'http://www.adform.com/api/ProductService/2010/09'
                    },
                    'Feed': {
                        'ns1:Name': opts.feedName,
                        'ns1:Source': {
                            'ns1:Url': sourceUrl,
                            '_attr': {
                                'i:type': 'ns1:HttpSource',
                                'xmlns:i': 'http://www.w3.org/2001/XMLSchema-instance'
                            }
                        },
                        'ns1:Schedule': schedule,
                        'ns1:EndDate': opts.endDate,
                        'ns1:FilePath': filePath,
                        'ns1:NotificationEmail': opts.notificationEmail,
                        'ns1:TemplateId': opts.templateId,
                        'ns1:Transformation': {
                            'ns1:Name': opts.transformationName,
                            'ns1:DefaultProductName': 'Cheapest',
                            'ns1:Xslt': xslt
                        }
                    }
                }
            },
            namespaces: [{
                name: 'ns1',
                src: ns
            }]
    }, function(err, etree) {
        if (err) {
            console.log(err.body);
            throw err;
        }
        var feedCode = etree.findtext('./s:Body/FeedCode');
        callback(null, feedCode);
    });
}

adform.login = function(username, password, callback) {
    var body = {
        'UserName': username,
        'Password': password
    };
    var uri = 'https://api.adform.com/Services/SecurityService.svc/JSON/Login';

    request.post({
            'json': true,
            'body': body,
            'uri': uri,
            'headers': {
                'content-length': body.length
            }
        },
        function(err, res, ticket) {
            callback(err, ticket);
        }
    );
};
