var util = require('util');

var et = require('elementtree');

function AdformError(body, message) {
    Error.call(this, message);
    Error.captureStackTrace(this, arguments.callee);
    this.name = 'AdformError';
    this.body = body;
    this.message = message;
}
util.inherits(AdformError, Error);

function ValidationError(body, message, fieldPath) {
    AdformError.call(this, body, message);
    this.name = 'ValidationError';
    this.fieldPath = fieldPath;
}
util.inherits(ValidationError, AdformError);

function wrap(body) {
    var parsed = et.parse(body);
    var type = parsed.findtext('.//faultstring');
    var message = parsed.findtext('.//Message');
    if (type === 'ValidationError') {
        var fieldPath = parsed.findtext('.//FieldPath');
        return new ValidationError(body, message, fieldPath);
    } else {
        return new AdformError(body, message);
    }
}

exports.AdformError = AdformError;
exports.ValidationError = ValidationError;
exports.wrap = wrap;