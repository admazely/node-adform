var makeRequest = require('./request');
var Campaign = require('./campaign');

function Advertiser(adform, name, id) {
	this.adform = adform;
	this.name = name;
	this.id = id;
}

Advertiser.prototype.getCampaigns = function(callback) {
	var self = this;
    this.adform.request({
        uri: 'https://api.adform.com/Services/CampaignService.svc',
        action: 'http://www.adform.com/api/2010/06/ICampaignService/GetCampaigns',
        data: {
            'ns:GetCampaignsData': {
                'ns:AdvertiserId': this.id
            }
        }   
    }, function(err, etree) {
        var campaigns = etree.findall('./s:Body/Campaigns/Campaign').map(function(data) {
        	var name = data.findtext('Name');
        	var id = Number(data.findtext('Id'));
        	var startDate = new Date(data.findtext('StartDate'));
        	var endDate = new Date(data.findtext('EndDate'));
        	return new Campaign(self.adform, name, id, startDate, endDate);
        });
        callback(null, campaigns);
    });
}

module.exports = Advertiser;