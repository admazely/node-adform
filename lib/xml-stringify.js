var stringify = function(element) {
    var head = '<' + element.tag;

    function formatAttr() {
        return Object.keys(element.attrib).map(function(key) {
            return key + '=' + '"' + element.attrib[key] + '"'
        }).join(' ')
    }

    if (Object.keys(element.attrib).length > 0) {
        head = head + ' ' + formatAttr();
    }

    if (element.text) {
        return head + '>' + element.text + '</' + element.tag + '>';
    } else if (element._children.length > 0) {
        return head + '>' + element._children.map(function(child) {return stringify(child); }).join('\n') + '</' + element.tag + '>';
    } else {
        return head + '/>';
    }

}

module.exports = stringify;