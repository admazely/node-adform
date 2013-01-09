var test = require('tap').test;

var errors = require('../lib/errors');

test('ValidationError', function(t) {
	var body = '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><s:Fault><faultcode>s:ValidationError</faultcode><faultstring xml:lang="en-US">ValidationError</faultstring><detail><FaultDetails xmlns="http://www.adform.com/api/2010/06" xmlns:i="http://www.w3.org/2001/XMLSchema-instance"><Errors><Error><Message>Ad name is not unique.</Message><FieldPath>Ad.Name</FieldPath></Error></Errors><RefNo i:nil="true"/></FaultDetails></detail></s:Fault></s:Body></s:Envelope>';

	var err = errors.wrap(body);
	t.type(err, errors.ValidationError);
	t.equal(err.message, 'Ad name is not unique.');
	t.equal(err.fieldPath, 'Ad.Name');
	t.equal(err.body, body);

	t.end();
});

test('UnknownError', function(t) {
	var input = '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><s:Fault><faultcode>s:SomeUnknownError</faultcode><faultstring xml:lang="en-US">SomeUnknownError</faultstring><detail><FaultDetails xmlns="http://www.adform.com/api/2010/06" xmlns:i="http://www.w3.org/2001/XMLSchema-instance"><Errors><Error><Message>Ad name is not unique.</Message><FieldPath>Ad.Name</FieldPath></Error></Errors><RefNo i:nil="true"/></FaultDetails></detail></s:Fault></s:Body></s:Envelope>';

	var err = errors.wrap(input);
	t.type(err, errors.AdformError);

	t.end();
});