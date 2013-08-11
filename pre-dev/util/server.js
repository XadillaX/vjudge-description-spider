var http = require("http");
var serverName = "VJudge Description Spider Tester Server Engine";
var logger = require("log4js").getLogger("SRV");
var mime = require("./mime");
var url = require("url");
var querystring = require("querystring");

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
function showErrorPage(req, resp, msg, status, errtemplate) {
    if(undefined === status) status = 404;

    var fs = require("fs");
    var path = require("path");

    var dir = path.dirname(__filename);
    var filename = dir + "/template/error.html";
    if(errtemplate !== undefined) {
        filename = dir + "/" + errtemplate;
    }

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

        if(typeof msg === "string") {
            text = text.replaceAll("_ERROR_", msg);
        } else {
            text = text.replaceAll("_ERROR_", msg.message);
        }

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
function getStatic(req, resp, errtemplate) {
    var fs = require("fs");
    var path = require("path");

    var dir = path.dirname(__filename);
    var filename = dir + "/static" + req["url"];

    fs.readFile(filename, "binary", function(err, data) {
        if(err) {
            logger.error("Failed in fetching static resources [ " + req["url"] + " ] : " + err.message + ".");

            showErrorPage(req, resp, err, errtemplate);
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

function testerServer() { }

/**
 * Start a test server.
 * @param ojname
 * @param showname
 * @param port
 */
testerServer.prototype.start = function(ojname, showname, port) {
    if(port === undefined) port = 8888;
    var index = require("../../index");
    var self = this;

    try {
        this.oj = index.getOJSpider(ojname);
        this.ojname = showname;

        if(this.oj === null) {
            logger.error("Can't start test server: this oj name is not supported.");
            return;
        }

        /**
         * Get page count
         */
        this.oj.getPageCount(function(status, msg, count) {
            if(status === false) {
                logger.error("Can't start test server: " + msg);
                return;
            }

            self.pageCount = count;

            /**
             * Create the server and listen
             */
            http.createServer(function(req, resp) {
                logger.info("Received a request : " + req["url"] + " (" + req["headers"]["user-agent"] + ") from " + req.socket.remoteAddress + ".");

                if(req["url"] === "/") {
                    resp.writeHead(302, {
                        "content-type"  : "text/html",
                        "location"      : "list",
                        "server"        : serverName
                    });
                    resp.end();
                    return;
                } else if(url.parse(req["url"]).pathname === "/list") {
                    self.processList(req, resp);
                    return;
                } else if(url.parse(req["url"]).pathname === "/problem") {
                    self.processProblem(req, resp);
                    return;
                } else {
                    getStatic(req, resp);
                    return;
                }
            }).listen(port);

            logger.info("Test Server started at listening port " + port + ".");
        });
    } catch(e) {
        logger.error("Can't start test server: " + e.message);
    }
}

/**
 * Process a certain problem
 * @param req
 * @param resp
 */
testerServer.prototype.processProblem = function(req, resp) {
    var id = NaN;
    var self = this;

    var qs = url.parse(req["url"]).query;
    qs = querystring.parse(qs);
    if(qs["id"] !== null) {
        id = parseInt(qs["id"]);
    }

    this.oj.getProblemByID(id, function(status, msg, problemObject) {
        if(!status) {
            showErrorPage(req, resp, msg, 500);
            return;
        }

        var fs = require("fs");
        var path = require("path");
        var dir = path.dirname(__filename);

        fs.readFile(dir + "/template/problem.html", function(err, data) {
            if(err) {
                showErrorPage(req, resp, err, 500);
                return;
            }

            var StringDecoder = require('string_decoder').StringDecoder;
            var decoder = new StringDecoder('utf8');
            var text = decoder.write(data);

            text = text.replaceAll("_OJNAME_", self.ojname);

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

            if(problemObject["specialJudge"] === true) {
                text = text.replaceAll("_SPECIALJUDGE_", ' <small class="muted">Special Judge</small>')
            } else {
                text = text.replaceAll("_SPECIALJUDGE_", "");
            }

            resp.writeHead(200, {
                "content-type"  : "text/html",
                "server"        : serverName
            });
            resp.write(text);
            resp.end();
        });
    });
}

/**
 * Process with list page
 * @param req
 * @param resp
 */
testerServer.prototype.processList = function(req, resp) {
    var page = 1;
    var self = this;

    var qs = url.parse(req["url"]).query;
    qs = querystring.parse(qs);
    if(qs["page"] !== undefined) {
        page = parseInt(qs["page"]);
    }

    /**
     * Page exceeded.
     */
    if(page > this.pageCount) {
        resp.writeHead(302, {
            "content-type"  : "text/plain",
            "server"        : serverName,
            "location"      : "list"
        });
        resp.end();
        return;
    }

    this.oj.getProblemIDListFromPage(page, function(status, msg, list) {
        if(!status) {
            showErrorPage(req, resp, msg, 500);
            return;
        }

        var fs = require("fs");
        var path = require("path");
        var dir = path.dirname(__filename);

        fs.readFile(dir + "/template/problist.html", function(err, data) {
            if(err) {
                showErrorPage(req, resp, err, 500);
                return;
            }

            resp.writeHead(200, {
                "content-type"  : "text/html",
                "server"        : serverName
            });

            var StringDecoder = require('string_decoder').StringDecoder;
            var decoder = new StringDecoder('utf8');
            var text = decoder.write(data);

            var listReg = /{{ problist }}([\s\S]*){{ \/problist }}/;
            var listEleResult = listReg.exec(text);

            if(listEleResult !== null && listEleResult.length === 2) {
                var listEleText = listEleResult[1];
                var listString = "";

                for(var i = 0; i < list.length; i++) {
                    var temp = listEleText;
                    temp = temp.replaceAll("_PROB_.TITLE", list[i].title);
                    temp = temp.replaceAll("_PROB_.ID", list[i].id);
                    temp = temp.replaceAll("_PROB_.ACCEPTED", list[i].accepted);
                    temp = temp.replaceAll("_PROB_.SUBMITTED", list[i].submitted);
                    temp = temp.replaceAll("_PROB_.RATIO", ((list[i].accepted / list[i].submitted * 100).toFixed(2)) + "%");
                    temp = temp.replaceAll("_PROB_.URL", "problem?id=" + list[i].id);

                    listString += temp;
                }

                listReg = /{{ problist }}([\s\S]*){{ \/problist }}/g;
                text = text.replace(listReg, listString);
                text = text.replace("_OJNAME_", self.ojname);
            }

            var pagination = '<div class="pagination pagination-mini pagination-centered"><ul>';
            if(page === 1) {
                pagination += '<li class="disabled"><a href="#">«</a></li>';
            } else {
                pagination += '<li><a href="/list?page=1">«</a></li>'
            }
            for(var i = 1; i <= self.pageCount; i++) {
                var href = "/list?page=" + i;
                if(i === page) {
                    pagination += '<li class="active"><a href="' + href + '">' + i + '</a></li>';
                } else {
                    pagination += '<li><a href="' + href + '">' + i + '</a></li>';
                }
            }
            if(page === self.pageCount) {
                pagination += '<li class="disabled"><a href="#">»</a></li>';
            } else {
                pagination += '<li><a href="/list?page=' + self.pageCount + '">»</a></li>';
            }
            pagination += '</ul></div>';
            text = text.replaceAll("_PAGINATION_", pagination);

            resp.write(text);
            resp.end();
        });
    }, true);
}

/**
 * Start a test server.
 * @param ojname
 * @param port
 */
exports.startTestServer = function(ojname, showname, port) {
    var srv = new testerServer();
    srv.start(ojname, showname, port);
};

/**
 * Start a pre-dev test server.
 * @param callback(serverCallback(ojname, problemObject, resp), resp)
 * @param port
 */
exports.startPreDev = function(callback, port) {
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

        logger.info("Pre-Dev Test Server started at listening port " + port + ".");
    } catch(e) {
        logger.error("Can't start test server: " + e.message);
    }
};
