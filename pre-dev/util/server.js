var http = require("http");

String.prototype.replaceAll = stringReplaceAll;
function stringReplaceAll(AFindText,ARepText){
    var raRegExp = new RegExp(AFindText.replace(/([\(\)\[\]\{\}\^\$\+\-\*\?\.\"\'\|\/\\])/g,"\\$1"),"ig");
    return this.replace(raRegExp,ARepText);
}

/**
 * No enough error handle because it's just a tester
 * @param problemObject
 */
function getProblem(ojname, problemObject, resp) {
    var fs = require("fs");
    var path = require("path");
    var dir = path.dirname(__filename);

    fs.readFile(dir + "/pre-dev-template.html", function(err, data) {
        var StringDecoder = require('string_decoder').StringDecoder;
        var decoder = new StringDecoder('utf8');
        var text = decoder.write(data);

        text = text.replaceAll("_OJNAME_", ojname);

        text = text.replaceAll("_ID_", problemObject["id"]);
        text = text.replaceAll("_TITLE_", problemObject["title"]);
        text = text.replaceAll("_TIME_", problemObject["time"]);
        text = text.replaceAll("_MEMO_", problemObject["memo"]);
        text = text.replaceAll("_AC_", problemObject["accept"]);
        text = text.replaceAll("_SUB_", problemObject["submit"]);
        text = text.replaceAll("_RATIO_", problemObject["ratioString"]);

        text = text.replaceAll("_DESCRIPTION_", problemObject["description"]);
        text = text.replaceAll("_INPUT_", problemObject["input"]);
        text = text.replaceAll("_OUTPUT_", problemObject["output"]);
        text = text.replaceAll("_SINPUT_", problemObject["sampleInput"]);
        text = text.replaceAll("_SOUTPUT_", problemObject["sampleOutput"]);
        text = text.replaceAll("_HINT_", problemObject["hint"]);
        text = text.replaceAll("_SOURCE_", problemObject["source"]);

        resp.write(text);
        resp.end();
    });
};

exports.start = function(callback) {
    http.createServer(function(req, resp) {
        resp.writeHead(200, { "content-type" : "text/html" });

        callback(getProblem, resp);
    }).listen(8888);
};
