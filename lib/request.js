var request = require('request').defaults({ jar: false });
var et = require('elementtree');

var errors = require('./errors');

var ElementTree = et.ElementTree;
var element = et.Element;
var subElement = et.SubElement;

function walk(obj, elm) {
    if (typeof(obj) === 'object') {
        Object.keys(obj).forEach(function(key) {
            if (key !== '_attr' && key !== '_text'){
                walk(obj[key], subElement(elm, key));
            }
        });
        if (obj._attr) {
            Object.keys(obj._attr).forEach(function(key) {
                var val = obj._attr[key];
                elm.set(key, val);
            });
        }
        if (obj._text) {
            elm.text = obj._text;
        }
    } else {
        elm.text = obj;
    }
}

var toXml = function(ticket, opts) {
    var root = element('soapenv:Envelope');
    root.set('xmlns:soapenv', 'http://schemas.xmlsoap.org/soap/envelope/');
    root.set('xmlns:ns', 'http://www.adform.com/api/2010/06');
    root.set('xmlns:arr', 'http://schemas.microsoft.com/2003/10/Serialization/Arrays');
    if (opts.namespaces) {
        opts.namespaces.forEach(function(namespace) {
            root.set('xmlns:' + namespace.name, namespace.src);
        });
    }
    var header = subElement(root, 'soapenv:Header');
    var tick = subElement(header, 'ns:Ticket');
    tick.text = ticket;
    var body = subElement(root, 'soapenv:Body')
    if (opts.data){
        walk(opts.data, body);
    }
    var etree = new ElementTree(root);
    return etree.write({'xml_declaration': false});
}

module.exports = function(ticket, opts, callback) {
    var xml = toXml(ticket, opts);
    request.post({
        body: xml,
        uri: opts.uri,
        headers: {
            'Content-Length': xml.length,
            'Content-Type': 'text/xml;charset=UTF-8',
            'SOAPAction': opts.action
        }
    }, function(err, res, body) {
        if (err) {
            return callback(err);
        }
        if (res.statusCode !== 200) {
            var err = errors.wrap(body);
            return callback(err);
        }
        var etree = et.parse(body);
        callback(null, etree);
    });
}