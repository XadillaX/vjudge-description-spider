/**
 * Created with JetBrains WebStorm.
 * User: XadillaX
 * Date: 13-8-11
 * Time: 下午7:24
 * The impl of ShareCode (Tehran Online Judge)
 */
var base = require("../base");
var util = require("util");

exports.create = function(baseurl) {
    return new tehran(baseurl);
}

function tehran(baseurl) {
    base.core.call(this);

    this.name = "ShareCode (Tehran Online Judge)";
    this.logger = base.logger("TEHRANOJ");
    if(undefined === baseurl) {
        this.baseurl = "http://sharecode.ir/";
    }
}

util.inherits(tehran, base.core);

/**
 * Override and ignore the base.
 * @param callback
 */
tehran.prototype.getPageCount = function(callback) {
    var url = this.baseurl + "problemset";
    var par = this;

    this.spider.get(url, function(data, status, resphreader) {
        if(status !== 200) {
            par.logger.warn("Received an error status from server.");
        }

        var locReg = /<div id="paging">[\s]*<span>pages:<\/span>[\s]*<ul>[\s]*(<li.*?>.*?([\d]+).*?<\/li>[\s]){4}[\s]*<\/ul>[\s]*<\/div>/;
        var result = locReg.exec(data);

        if(result === null || result.length !== 3) {
            par.logger.error("Failed to get the page count: Get a wrong data.");
            if(callback !== undefined) {
                callback.bind(par)(false, "Get a wrong data.");
            }
            return;
        }

        var count = parseInt(result[2]);

        par.logger.info("Successfully getting the page count: " + count + ".");
        if(undefined !== callback) {
            callback.bind(this)(true, "", count);
        }
    }, "utf8");
}

/**
 * Override and ignore the base.
 * @param page
 * @param callback
 */
tehran.prototype.getProblemIDListFromPage = function(page, callback, detail) {
    this.logger.info("Getting the problem id list from page " + page + ".");

    var url = this.baseurl + "problemset/page/" + page;
    this.getProblemIDListFromUrl(url, callback, detail);
}

/**
 * Override and ignore the base.
 * @param url
 * @param callback
 * @param detail
 */
tehran.prototype.getProblemIDListFromUrl = function(url, callback, detail) {
    this.logger.info("Getting the problem id list from url [ " + url + " ].");
    var par = this;

    this.spider.get(url, function(data, status, respheader) {
        var list = [];

        /**
         * Some regular expressions.
         */
        var locString = '<tr>[\\s]*<th class="" scope="row"><a .*>([\\d]+)</a></th>[\\s]*<td><a .*>(.*)</a></td>[\\s]*<td class="ratio"><a .*>([\\d]+)+/([\\d]+)=.*%</a></td>[\\s]*</tr>';
        var locGReg = new RegExp(locString, "g");
        var locReg = new RegExp(locString);

        /**
         * Do the regular match
         */
        var listResults = data.match(locGReg);

        /**
         * Verify whether the result is valid.
         */
        if(listResults === null) {
            par.logger.error("Failed to get the problem id list: data error.");
            if(callback !== undefined) {
                callback.bind(par)(false, "data error", []);
            }
            return;
        }

        /**
         * If `detail` is undefined or not true, just to get the id list,
         * or get some base information as well.
         */
        if(detail === undefined || !detail) {
            for(var i = 0; i < listResults.length; i++) {
                var result = locReg.exec(listResults[i]);
                if(result === null || result.length !== 5) {
                    par.logger.error("Failed to get the problem id list: data error.");
                    if(callback !== undefined) {
                        callback.bind(par)(false, "data error", []);
                    }
                    return;
                }

                list.push(result[1]);
            }
        } else {
            for(var i = 0; i < listResults.length; i++) {
                var result = locReg.exec(listResults[i]);
                if(result === null || result.length !== 5) {
                    par.logger.error("Failed to get the problem id list: data error.");
                    if(callback !== undefined) {
                        callback.bind(par)(false, "data error", []);
                    }
                    return;
                }

                var rtn = {
                    "id"        : result[1],
                    "title"     : result[2],
                    "accepted"  : parseInt(result[3]),
                    "submitted" : parseInt(result[4])
                };
                list.push(rtn);
            }
        }

        if(callback !== undefined) {
            callback.bind(par)(true, "", list);
        }
    }, "utf8");
}

tehran.prototype.getProblemByID = function(id, callback) {
    var url = this.baseurl + "problemset/view/" + id;
    var par = this;

    this.logger.info("Getting the problem from url [ " + url + " ].");
    this.spider.get(url, function(data, status, respheader) {
        if(status !== 200) {
            par.logger.warn("Received an error status from server.");
        }

        /**
         * If no such problem, the server will return a 404 error:
         *
         *
         * <!DOCTYPE html>
         * <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
         * <head>
         * <title>ShareCode :: 404 Page Not Found</title>
         * <style type="text/css">
         * * {
         *			margin: 0px;
         *			padding: 0px;
         *		}
         * body {
         *			background: #e1e1e0;
         *		}
         *
         * #content  {
         *			background: url(http://sharecode.ir/assets/theme_new/images/404.jpg) no-repeat;
         *			width: 643px;
         *			height: 409px;
         *			margin: auto auto;
         *		}
         * #margin {
         *			margin-bottom: 6%;
         *		}
         * </style>
         * </head>
         * <body>
         * <div id="margin"></div>
         * <div id="content">
         *
         * </div>
         * </body>
         * </html>
         *
         */
        if(status === 404) {
            par.logger.error("Failed to get the problem: Can not find problem (ID: " + id + ").");
            if(undefined !== callback) {
                callback.bind(par)(false, "Can not find problem (ID: " + id + ")", null);
            }
            return;
        }

        /**
         * Verify the data.
         */
        if(/<p id="info">Time Limit: <span class="red">[\d]+ Second[s]*<\/span> &nbsp;&nbsp; Memory Limit: <span class="red">[\d]+ KB<\/span>.*<\/p>/.exec(data) === null) {
            par.logger.error("Failed to get the problem: data error.");
            if(undefined !== callback) {
                callback.bind(par)(false, "data error", null);
            }
            return;
        }

        var prob = base.util.problemObject.create(par.baseurl);
        prob.setHtml(base.util.unixify(data));

        prob.setID(id);
        prob.setTitle(/<title>ShareCode :: Problem #[\d]+ :: (.*)<\/title>/);
        prob.setTime(/<p id="info">Time Limit: <span class="red">([\d]+) Second[s]*<\/span> &nbsp;&nbsp; Memory Limit: <span class="red">[\d]+ KB<\/span>.*<\/p>/, 1000);
        prob.setMemo(/<p id="info">Time Limit: <span class="red">[\d]+ Second[s]*<\/span> &nbsp;&nbsp; Memory Limit: <span class="red">([\d]+) KB<\/span>.*<\/p>/);
        prob.setDescription(/<p id="info">Time Limit: <span class="red">[\d]+ Second[s]*<\/span> &nbsp;&nbsp; Memory Limit: <span class="red">[\d]+ KB<\/span>.*<\/p>([\s\S]*?)<h2>Input<\/h2>/);
        prob.setInput(/<h2>Input<\/h2>([\s\S]*)<h2>Output<\/h2>/);
        prob.setOutput(/<h2>Output<\/h2>([\s\S]*)<h2>Sample Input<\/h2>/);
        prob.setSampleInput(/<h2>Sample Input<\/h2>[\s]*<pre>([\s\S]*)<\/pre>[\s]*<h2>Sample Output<\/h2>/);
        prob.setSampleOutput(/<h2>Sample Output<\/h2>[\s]*<pre>([\s\S]*)<\/pre>[\s]*<a id="submit-btn" .*>Submit<\/a>/);
        prob.setSource(/<p id="problem_source">(.*)<\/p>/);
        if(data.indexOf('<span class="red">Special Judge</span>') !== -1) {
            prob.setSpecialJudge(true);
        }

        prob.clearHtml();
        prob.remotify();

        /**
         * The Tehran Online Judge has no ACCEPTED/SUBMITTED information in the problem page.
         * And of cause, we couldn't know which page the problem is in the list just from the problem id.
         *
         * So we must get them from the RUN page:
         *
         *   http://sharecode.ir/runs/problem/xxxx
         *   http://sharecode.ir/runs/acc_problem/xxxx
         *
         * And we can get the page number of runs. We know there're 20 RUNs per page and the last page may be is not 20.
         * Due to some unknown reason, the RUNs we fetched will have a little deviation.
         */
        var suburl = par.baseurl + "runs/problem/" + id;
        var acurl = par.baseurl + "runs/acc_problem/" + id;

        par.logger.info("Getting the `SUBMITTED PAGE COUNT` from url [ " + suburl + " ].");
        par.spider.get(suburl, function(data, status, respheader) {
            var pageLocReg = /<div id="paging">[\s]+<span>pages:<\/span>[\s\S]*>([\d]+)<[\s\S]*<div id="problemset_runs" class="shadowed">/;
            var pageResult = pageLocReg.exec(data);

            /**
             * We consider this condition will be `0`
             */
            if(pageResult === null || pageResult.length !== 2) {
                if(undefined !== callback) {
                    callback.bind(par)(true, "", prob);
                }
                return;
            }

            var run_page = parseInt(pageResult[1]);
            /**
             * Go to fetch the last page and count the record number.
             */
            par.logger.info("Getting the `SUBMITTED COUNT OF LAST PAGE` from url [ " + suburl + "/" + run_page + " ].");
            par.spider.get(suburl + "/" + run_page, function(data, status, respheader) {
                var locRegString = '<tr class="run_row" .*>[\\s\\S]*?</tr>';
                var locReg = new RegExp(locRegString, "g");
                var recList = data.match(locReg);

                var last = 0;
                if(recList !== null) last = recList.length;

                /**
                 * So this is the SUBMITTED count
                 */
                var subcount = (run_page - 1) * 20 + last;
                prob.setSubmitCount(subcount);
                par.logger.info("The `SUBMITTED COUNT` is calculated out: " + subcount + ".");

                /**
                 * Well, let's get the ACCEPTED count now.
                 */
                par.logger.info("Getting the `ACCEPTED COUNT` from url [ " + acurl + " ].");
                par.spider.get(acurl, function(data, status, respheader) {
                    pageResult = pageLocReg.exec(data);

                    /**
                     * We consider this condition will be `0`
                     */
                    if(pageResult === null || pageResult.length !== 2) {
                        if(undefined !== callback) {
                            callback.bind(par)(true, "", prob);
                        }
                        return;
                    }

                    var ac_page = parseInt(pageResult[1]);

                    /**
                     * Go to fetch the last page and count the record number.
                     */
                    par.logger.info("Getting the `ACCEPTED COUNT OF LAST PAGE` from url [ " + acurl + "/" + ac_page + " ].");
                    par.spider.get(acurl + "/" + ac_page, function(data, status, respheader) {
                        recList = data.match(locReg);

                        last = 0;
                        if(recList !== null) last = recList.length;

                        /**
                         * So this is the ACCEPTED count
                         */
                        var account = (ac_page - 1) * 20 + last;
                        prob.setAcceptedCount(account);
                        par.logger.info("The `ACCEPTED COUNT` is calculated out: " + account + ".");

                        /**
                         * Then we calculate the RATIO
                         */
                        prob.calcRatio();

                        if(undefined !== callback) {
                            callback.bind(par)(true, "", prob);
                        }
                        return;
                    });
                });
            });
        }, "utf8");
    }, "utf8");
}
