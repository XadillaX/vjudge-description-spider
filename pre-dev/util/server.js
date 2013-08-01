var http = require("http");
var serverName = "VJudge Description Spider Tester Server Engine";
var logger = require("log4js").getLogger("SRV");
var mime = require("./mime");

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

    fs.readFile(dir + "/template/randomproblem.html", function(err, data) {
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

        resp.writeHead(200, {
            "content-type"  : "text/html",
            "server"        : serverName
        });
        resp.write(text);
        resp.end();
    });
};

/**
 * Show the error page.
 * @param req
 * @param resp
 * @param err
 */
function showErrorPage(req, resp, msg, status) {
    if(undefined === status) status = 404;

    var fs = require("fs");
    var path = require("path");

    var dir = path.dirname(__filename);
    var filename = dir + "/template/error.html";

    fs.readFile(filename, function(err, data) {
        if(err) {
            resp.writeHead(status, {
                "content-type"  : "text/html",
                "server"        : serverName
            });
            resp.write("Fatal Error: " + err.message);
            resp.end();
            return;
        }

        resp.writeHead(status, {
            "content-type"  : "text/html",
            "server"        : serverName
        });

        var StringDecoder = require('string_decoder').StringDecoder;
        var decoder = new StringDecoder('utf8');
        var text = decoder.write(data);

        text = text.replaceAll("_ERROR_", msg.message);

        resp.write(text);
        resp.end();
    });
};

/**
 * Get the static resources from server.
 *   e.g. foo.css and bar.js and so on.
 *
 * @param req
 * @param resp
 */
function getStatic(req, resp) {
    var fs = require("fs");
    var path = require("path");

    var dir = path.dirname(__filename);
    var filename = dir + "/static" + req["url"];

    fs.readFile(filename, "binary", function(err, data) {
        if(err) {
            logger.error("Failed in fetching static resources [ " + req["url"] + " ] : " + err.message + ".");

            showErrorPage(req, resp, err);
            return;
        }

        var ext = path.extname(filename);
        ext = ext ? ext.slice(1) : 'unknown';

        var contentType = mime[ext] || "text/plain";
        resp.writeHead(200, {
            "content-type"  : contentType,
            "server"        : serverName
        });

        resp.write(data, "binary");
        resp.end();
    });
}

exports.start = function(callback, port) {
    if(port === undefined) port = 8888;

    try {
        http.createServer(function(req, resp) {
            logger.info("Received a request : " + req["url"] + " (" + req["headers"]["user-agent"] + ") from " + req.socket.remoteAddress + ".");

            if(req["url"] === "/") {
                resp.writeHead(302, {
                    "content-type"  : "text/html",
                    "location"      : "randomProblem",
                    "server"        : serverName
                });
                resp.end();
                return;
            } else if(req["url"] === "/randomProblem") {
                callback(getProblem, resp);
                return;
            } else {
                getStatic(req, resp);
                return;
            }
        }).listen(port);

        logger.info("Test Server started at listening port " + port + ".");
    } catch(e) {
        logger.error("Can't start test server: " + e.message);
    }
};
