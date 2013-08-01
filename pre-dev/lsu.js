var spider = require("vjudge-description-spider").spider;
var logger = require("vjudge-description-spider").logger("lsu");
var util = require("vjudge-description-spider").util;

function lsuCallback(serverCallback, resp) {
    /**
     * First step: Get the page count.
     */
    logger.info("Pre-dev Tester starting...");
    spider.get("http://acms.lsu.edu.cn:81/OnlineJudge/problemlist", function(data, status, respheader) {
        if(status !== 200) return;

        logger.info("Pagination information data fetched.");
        logger.info("Parsing...");

        var s1 = "<center><font size=5>Volume</font>";
        var p1 = data.indexOf(s1);
        var p2 = data.indexOf("</center>", p1);
        var text = data.substring(p1, p2);

        var signText = "href=problemlist?volume=";
        var signPos = 0;
        var pageCount = 0;
        while(text.indexOf(signText, signPos) !== -1) {
            pageCount++;
            signPos = text.indexOf(signText, signPos) + 1;
        }

        logger.info("LSU totally has [ " + pageCount + " ] Page(s).");

        /**
         * Second step: Try to parse first page's problem id list.
         */
        var list = [];
        var pos1 = data.indexOf("<tr class=rowtitle>");
        var idpos = pos1;
        var tmppos = 0;
        do {
            tmppos = data.indexOf("<tr class=row", idpos);
            if(tmppos === -1) break;

            pos1 = data.indexOf("<td align=center>", tmppos);
            var pos2 = data.indexOf("</td>", pos1);
            var id = parseInt(data.substring(pos1 + 17, pos2));
            list.push(id);

            idpos = pos2;
        } while(tmppos !== -1);

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

        /**
         * Third step: random get one problem.
         */
        var id = util.random(list[0], list[list.length - 1]);
        logger.info("Going to fetch [ Problem " + id + " ]");

        spider.get("http://acms.lsu.edu.cn:81/OnlineJudge/showproblem?problem_id=" + id, function(data, status, respheader) {
            var prob = util.problemObject.create();

            prob.setHtml(util.unixify(data));

            prob.setID(id);
            prob.setTitle(/<title>\d{4} -- ([\s\S]*)<\/title>/);
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

            serverCallback("LSUOJ", prob, resp)
        }, "gbk");
    }, "gbk");
}

exports.start = function(port) {
    var server = require("./util/server");
    server.start(lsuCallback, port);
};
