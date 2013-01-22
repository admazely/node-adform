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

function SerializationError(body, message) {
    AdformError.call(this, body, message);
    this.name = 'SerializationError';
}
util.inherits(SerializationError, AdformError);

function ValidationError(body, message, fieldPath) {
    AdformError.call(this, body, message);
    this.name = 'ValidationError';
    this.fieldPath = fieldPath;
}
util.inherits(ValidationError, AdformError);

function wrap(body) {
    var parsed = et.parse(body);
    var type = parsed.findtext('.//faultcode');
    var message = parsed.findtext('.//Message');

    if (type === 's:SerializationError') {
        return new SerializationError(body, message);
    }

    if (type === 's:ValidationError') {
        var fieldPath = parsed.findtext('.//FieldPath');
        return new ValidationError(body, message, fieldPath);
    }

    return new AdformError(body, message);
}

exports.AdformError = AdformError;
exports.SerializationError = SerializationError;
exports.ValidationError = ValidationError;
exports.wrap = wrap;
