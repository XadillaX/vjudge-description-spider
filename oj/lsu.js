/**
 * Created with JetBrains WebStorm.
 * User: xadillax
 * Date: 13-8-10
 * Time: 下午3:57
 * The impl of LSU OJ.
 */
var base = require("../base");
var util = require("util");

exports.create = function(baseurl) {
    return new lsu(baseurl);
}

function lsu(baseurl) {
    base.core.call(this);

    this.name = "LSU";
    this.logger = base.logger("LSU");
    if(undefined === baseurl) {
        this.baseurl = "http://acms.lsu.edu.cn:81/OnlineJudge/";
    }
}

util.inherits(lsu, base.core);

/**
 * Override and ignore the base
 * @param callback
 */
lsu.prototype.getPageCount = function(callback) {
    var url = this.baseurl + "problemlist";
    var par = this;

    this.spider.get(url, function(data, status, respheader) {
        if(status !== 200) {
            par.logger.warn("Received an error status from server.");
        }

        /**
         * One example:
         *
         *     ...<center><font size=5>Volume</font>
         *      <a href=problemlist?volume=1><font size=5 color=red>1</font></a>
         *      <a href=problemlist?volume=2><font size=5 >2</font></a>
         *      <a href=problemlist?volume=3><font size=5 >3</font></a>
         *     </center>...
         *
         * NOTICE: It seems that this system is running under WINDOWS, so the line ending is "\r\n".
         *         But the \s in Regular Expressions is only space and \n, so we have to write \r independently.
         *
         * The result of that regular expression will be 2 length long, one is the whole matching and the second one
         * is just the last matching.
         */
        var reg = new RegExp("<center><font size=5>Volume</font>[\\s]*(<a href=problemlist\\?volume=[\\d]+><font size=5 .*>[\\d]+</font></a>[\\s\r]*)+</center>");
        var result = reg.exec(data);
        if(result === null || result.length !== 2) {
            par.logger.error("Failed to get the page count: Get a wrong data.");
            if(callback !== undefined) {
                callback.bind(par)(false, "Get a wrong data.");
            }
            return;
        }

        result = /<font size=5.*>([\d]+)<\/font>/.exec(result[1]);
        if(result === null || result.length !== 2) {
            par.logger.error("Failed to get the page count: Get a wrong data.");
            if(callback !== undefined) {
                callback.bind(par)(false, "Get a wrong data.");
            }
            return;
        }

        var count = parseInt(result[1]);
        par.logger.info("Successfully getting the page count: " + count + ".");
        if(undefined !== callback) {
            callback.bind(this)(true, "", count);
        }
    }, "gbk").on("error", function(e) {
        par.logger.error("Failed to get the page count: " + e.message);
        if(callback !== undefined) {
            callback.bind(par)(false, e.message, 0);
        }
    });
}

/**
 * Override and ignore the base.
 * @param page
 * @param callback
 */
lsu.prototype.getProblemIDListFromPage = function(page, callback, detail) {
    this.logger.info("Getting the problem id list from page " + page + ".");

    var url = this.baseurl + "problemlist?volume=" + page;
    this.getProblemIDListFromUrl(url, callback, detail);
}

/**
 * Override and ignore the base.
 * @param url
 * @param callback
 */
lsu.prototype.getProblemIDListFromUrl = function(url, callback, detail) {
    this.logger.info("Getting the problem id list from url [ " + url + " ].");

    if(detail === undefined || !detail) {
        /**
         * The problem table will be like:
         *
         *     ...<tr class=row1>
         *     <td align=center>1000</td>...
         *     ...<tr class=row2>
         *     <td align=center>1001</td>...
         *     ...<tr class=row1>
         *     <tr align=center>1002</td>...
         *     .
         *     .
         *     .
         */
        var reg = /<tr class=row[12]>[\s\r]+<td align=center>([\d]+)<\/td>/g;
        var freg = /<td align=center>([\d]+)<\/td>/;
        var par = this;

        var rtn = [];

        this.spider.get(url, function(data, status, respheader) {
            if(status !== 200) {
                par.logger.warn("Received an error status from server.");
            }

            var listResults = data.match(reg);
            if(listResults === null) {
                par.logger.error("Failed to get the problem id list: data error.");
                if(callback !== undefined) {
                    callback.bind(par)(false, "data error", []);
                }
                return;
            }
            for(var i = 0; i < listResults.length; i++) {
                var result = freg.exec(listResults[i]);
                if(result === null || result.length !== 2) {
                    par.logger.error("Failed to get the problem id list: data error.");
                    if(callback !== undefined) {
                        callback.bind(par)(false, "data error", []);
                    }
                    return;
                }

                rtn.push(result[1]);
            }

            if(callback !== undefined) {
                callback.bind(par)(true, "", rtn);
            }
        }, "gbk").on("error", function(e) {
            par.logger.error("Failed to get the problem id list: " + e.message);
            if(callback !== undefined) {
                callback.bind(par)(false, e.message, []);
            }
        });
    } else {
        var reg = /<tr class=row[12]>[\s\r]+<td align=center>([\d]+)<\/td>[\s\r]+<td.*>(.*)<\/a><\/td>[\s\r]+<td.*>([\d]+)<\/a>\/.*>([\d]+)<\/a>\)<\/td>/g;
        var freg = /<tr class=row[12]>[\s\r]+<td align=center>([\d]+)<\/td>[\s\r]+<td.*>(.*)<\/a><\/td>[\s\r]+<td.*>([\d]+)<\/a>\/.*>([\d]+)<\/a>\)<\/td>/;
        var par = this;

        var rtn = [];

        this.spider.get(url, function(data, status, respheader) {
            if(status !== 200) {
                par.logger.warn("Received an error status from server.");
            }

            var listResults = data.match(reg);
            if(listResults === null) {
                par.logger.error("Failed to get the problem id list: data error.");
                if(callback !== undefined) {
                    callback.bind(par)(false, "data error", []);
                }
                return;
            }
            for(var i = 0; i < listResults.length; i++) {
                var result = freg.exec(listResults[i]);
                if(result === null || result.length !== 5) {
                    par.logger.error("Failed to get the problem id list: data error.");
                    if(callback !== undefined) {
                        callback.bind(par)(false, "data error", []);
                    }
                    return;
                }

                var obj = {
                    "id"        : parseInt(result[1]),
                    "title"     : result[2],
                    "accepted"  : parseInt(result[3]),
                    "submitted" : parseInt(result[4])
                };

                rtn.push(obj);
            }

            if(callback !== undefined) {
                callback.bind(par)(true, "", rtn);
            }
        }, "gbk").on("error", function(e) {
            par.logger.error("Failed to get the problem id list: " + e.message);
            if(callback !== undefined) {
                callback.bind(par)(false, e.message, []);
            }
        });
    }
}

/**
 * Override and ignore the id.
 * @param id
 * @param callback
 */
lsu.prototype.getProblemByID = function(id, callback) {
    var url = this.baseurl + "showproblem?problem_id=" + id;
    var par = this;

    this.logger.info("Getting the problem from url [ " + url + " ].");
    this.spider.get(url, function(data, status, respheader) {
        if(status !== 200) {
            par.logger.warn("Received an error status from server.");
        }

        if(data.indexOf("Can not find problem") !== -1) {
            par.logger.error("Failed to get the problem: Can not find problem (ID: " + id + ").");
            if(undefined !== callback) {
                callback.bind(par)(false, "Can not find problem (ID: " + id + ")", null);
            }
            return;
        }

        if(/<p align="center">Time Limit:.*MS&nbsp; Memory Limit:.*K<br>/.exec(data) === null) {
            par.logger.error("Failed to get the problem: data error.");
            if(undefined !== callback) {
                callback.bind(par)(false, "data error", null);
            }
            return;
        }

        var prob = base.util.problemObject.create(par.baseurl);
        prob.setHtml(base.util.unixify(data));

        prob.setID(id);
        prob.setTitle(/<title>.*\d{4} -- ([\s\S]*)<\/title>/);
        prob.setTime(/Time Limit:([\d]+)MS&nbsp; Memory Limit:[\d]+K/);
        prob.setMemo(/Time Limit:[\d]+MS&nbsp; Memory Limit:([\d]+)K/);
        prob.setSubmitCount(/Total Submit:([\d]+) Accepted:[\d]+/);
        prob.setAcceptedCount(/Total Submit:[\d]+ Accepted:([\d]+)/);
        prob.calcRatio();
        prob.setDescription(/<font color="#333399" size="5">Description<\/font>[\s\S]*<font face="Times New Roman" size="3">([\s\S]*)<\/font><\/p>[\s\S]*<font color="#333399" size="5">Input<\/font>/);
        prob.setInput(/<font color="#333399" size="5">Input<\/font>[\s\S]*<font face="Times New Roman" size="3">([\s\S]*)<\/font><\/p>[\s\S]*<font color="#333399" size="5">Output<\/font>/);
        prob.setOutput(/<font color="#333399" size="5">Output<\/font>[\s\S]*<font face="Times New Roman" size="3">([\s\S]*)<\/font><\/p>[\s\S]*<font color="#333399" size="5">Sample Input<\/font>/);
        prob.setSampleInput(/<font color="#333399" size="5">Sample Input<\/font>[\s\S]*<font face="Times New Roman" size="3"><pre>\n([\s\S]*)<\/pre><\/font><\/p>[\s\S]*<font color="#333399" size="5">Sample Output<\/font>/);
        prob.setSampleOutput(/<font color="#333399" size="5">Sample Output<\/font>[\s\S]*<font face="Times New Roman" size="3"><pre>\n([\s\S]*)<\/pre><\/font><\/p>[\s\S]*<font color="#333399" size="5">[\s\S]*<\/font>/);
        prob.setHint(/<font color="#333399" size="5">Hint<\/font>[\s\S]*<font face="Times New Roman" size="3">([\s\S]*)<\/font><\/p>[\s\S]*<font color="#333399" size="5">Source<\/font>/);
        prob.setSource(/<font color="#333399" size="5">Source<\/font>[\s\S]*<font face="Times New Roman" size="3">([\s\S]*)<\/font><\/p>[\s\S]*<\/table>/);

        prob.clearHtml();
        prob.remotify();

        if(undefined !== callback) {
            callback.bind(par)(true, "", prob);
        }
    }, "gbk").on("error", function(e) {
        par.logger.error("Failed to get the problem: " + e.message);
        if(callback !== undefined) {
            callback.bind(par)(false, e.message, null);
        }
    });
}