var spider = require("vjudge-description-spider").spider;
var logger = require("vjudge-description-spider").logger("lsu");
var util = require("vjudge-description-spider").util;

function nbutCallback(serverCallback, resp) {
    /**
     * First step: Get the page count.
     */
    logger.info("Pre-dev Tester starting...");
    spider.get("http://acm.nbut.edu.cn/problem.xhtml?page=5", function(data, status, respheader) {
        if(status !== 200) return;

        logger.info("Pagination information data fetched.");
        logger.info("Parsing...");

        var pageReg = /<a title="尾页" href="\/Problem.xhtml?page=([\d]+)" class="page_a">尾页<\/a>/;
        var regResult = pageReg.exec(data);
        var pageCount = 1;
        if(regResult !== null && regResult[1] !== null) {
            pageCount = parseInt(regResult[1]);
        }

        logger.info("LSU totally has [ " + pageCount + " ] Page(s).");

        /**
         * Second step: Try to parse first page's problem id list.
         */
        var list = [];
        var listRegG = /<td style="text-align: center;" class="br">([\d]+)<\/td>/g;
        var listReg = /<td style="text-align: center;" class="br">([\d]+)<\/td>/;
        var listResult = data.match(listRegG);
        for(var i = 0; i < listResult.length; i++) {
            var result = listReg.exec(listResult[i]);
            list.push(parseInt(result[1]));
        }

        var msg = "The problem id list contains:";
        for(var i = 0; i < list.length; i++) {
            if(i == 0) msg += " ";
            else msg += ", ";

            msg += "[";
            msg += list[i];
            msg += "]";
        }
        msg += ".";

        logger.info(msg);
        var listData = data;

        /**
         * Third step: random get one problem.
         */
        var id = list[util.random(0, list.length - 1)];
        logger.info("Going to fetch [ Problem " + id + " ]");

        spider.get("http://acm.nbut.edu.cn/Problem/view.xhtml?id=" + id, function(data, status, respheader) {
            var prob = util.problemObject.create("http://acm.nbut.edu.cn/");

            prob.setHtml(util.unixify(data));

            prob.setID(id);
            prob.setTitle(/<li id="title"><h3>\[[\d]+] (.*)<\/h3><\/li>/);
            prob.setTime(/时间限制: ([\d]+) ms/);
            prob.setMemo(/内存限制: ([\d]+) K/);
            prob.setDescription(/<li class="contents" id="description">[\s]*<div>[\s]*([\s\S]*)[\s]*<\/div>[\s]*<\/li>[\s]*<li class="titles" id="input-title">输入<\/li>/);
            prob.setInput(/<li class="contents" id="input">[\s]*<div>[\s]*([\s\S]*)[\s]*<\/div>[\s]*<\/li>[\s]*<li class="titles" id="output-title">输出<\/li>/);
            prob.setOutput(/<li class="contents" id="output">[\s]*<div>[\s]*([\s\S]*)[\s]*<\/div>[\s]*<\/li>[\s]*<li class="titles" id="sampleinput-title">样例输入<\/li>/);
            prob.setSampleInput(/<li class="contents" id="sampleinput">[\s]*<pre>([\s\S]*)<\/pre>[\s]*<\/li>[\s]*<li class="titles" id="sampleoutput-title">样例输出<\/li>/);
            prob.setSampleOutput(/<li class="contents" id="sampleoutput">[\s]*<pre>([\s\S]*)<\/pre>[\s]*<\/li>[\s]*<li class="titles" id="hint-title">提示<\/li>/);
            prob.setHint(/<li class="contents" id="hint">([\s\S]*)<\/li>[\s]*<li class="titles" id="source-title">来源<\/li>/);
            prob.setSource(/<li class="contents" id="source">([\s\S]*)<\/li>[\s]*<li class="titles" id="operation-title">操作<\/li>/);

            prob.setHtml(util.unixify(listData));

            var regStr = '<td style="text-align: center;" class="br">' + id + '</td>[\\s]*<td class="br"><a href="/Problem/view.xhtml\\?id=' + id + '">.*</a></td>[\\s]*<td style="text-align: center;">';
            var regStr1 = regStr + "([\\d]+) / [\\d]+ (.*)</td>";
            var regStr2 = regStr + "[\\d]+ / ([\\d]+) (.*)</td>";
            prob.setSubmitCount(new RegExp(regStr2));
            prob.setAcceptedCount(new RegExp(regStr1));
            prob.calcRatio();

            prob.remotify();
            prob.clearHtml();

            serverCallback("NOJ", prob, resp);
        });
    });
}

exports.start = function(port) {
    var server = require("./util/server");
    server.startPreDev(nbutCallback, port);
};
