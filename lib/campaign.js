function Campaign(adform, name, id, startDate, endDate) {
	this.adform = adform;
	this.name = name;
	this.id = id;
	this.startDate = startDate;
	this.endDate = endDate;
}

Campaign.prototype.createAd = function(adName, data, callback) {
    this.adform.request({
        action: 'http://www.adform.com/api/2010/06/IAdService/CreateAd',
        uri: 'https://api.adform.com/Services/AdService.svc',
        data: {
            'ns:CreateAdData': {
                'ns:Ad': {
                    'ns:Name': adName,
                    'ns:CampaignId': this.id,
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

module.exports = Campaign;