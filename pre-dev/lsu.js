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
            var prob = util.createProblemObject();

            var titleSign = "<font color=blue size=5>";
            var pos1 = data.indexOf(titleSign);
            var pos2 = data.indexOf("</font>", pos1);
            prob["title"] = data.substring(pos1 + titleSign.length, pos2);

            var timeSign = "Time Limit:";
            var pos3 = data.indexOf(timeSign, pos2);
            var pos4 = data.indexOf("MS", pos3);
            prob["time"] = parseInt(data.substring(pos3 + timeSign.length, pos4));
            prob["timeJava"] = NaN;

            var memoSign = "Memory Limit:";
            var pos5 = data.indexOf(memoSign, pos4);
            var pos6 = data.indexOf("K", pos5);
            prob["memo"] = parseInt(data.substring(pos5 + memoSign.length, pos6));
            prob["memoJava"] = NaN;

            var subSign = "Total Submit:";
            var pos7 = data.indexOf(subSign, pos6);
            var pos8 = data.indexOf(" Accepted:", pos7);
            prob["submit"] = parseInt(data.substring(pos7 + subSign.length, pos8));

            var acSign = "Accepted:";
            var pos9 = data.indexOf(acSign, pos8);
            var pos10 = data.indexOf("\n", pos9);
            prob["accept"] = parseInt(data.substring(pos9 + acSign.length, pos10));

            if(prob["submit"] === 0) prob["ratio"] = 0.0;
            else prob["ratio"] = prob["accept"] / prob["submit"];

            prob["ratioString"] = ((prob["ratio"] * 100).toFixed(2)) + "%";

            var desSign1 = '<p><font face="Times New Roman" size="3">';
            var desSign2 = '</font></p>\r\n<p align="left"><b><font color="#333399" size="5">Input</font>';
            var pos11 = data.indexOf(desSign1, pos10);
            var pos12 = data.indexOf(desSign2, pos11);
            prob["description"] = data.substring(pos11 + desSign1.length, pos12).trim();

            var iptSign = '</font></p>\r\n<p align="left"><b><font color="#333399" size="5">Output</font>';
            var pos13 = data.indexOf(desSign1, pos12);
            var pos14 = data.indexOf(iptSign, pos13);
            prob["input"] = data.substring(pos13 + desSign1.length, pos14).trim();

            var optSign = '</font></p>\r\n<p align="left"><b><font color="#333399" size="5">Sample Input</font>';
            var pos15 = data.indexOf(desSign1, pos14);
            var pos16 = data.indexOf(optSign, pos15);
            prob["output"] = data.substring(pos15 + desSign1.length, pos16).trim();

            var preSign = desSign1 + "<pre>\r\n";
            var siptSign = '</pre></font></p>\r\n<p align="left"><b><font color="#333399" size="5">Sample Output</font>';
            var pos17 = data.indexOf(preSign, pos16);
            var pos18 = data.indexOf(siptSign, pos17);
            prob["sampleInput"] = data.substring(pos17 + preSign.length, pos18);

            var soptSign = '</pre></font></p>\r\n<p align="left"><b><font color="#333399" size="5">Source</font>';
            var pos19 = data.indexOf(preSign, pos18);
            var pos20 = data.indexOf(soptSign, pos19);
            prob["sampleOutput"] = data.substring(pos19 + preSign.length, pos20);

            var srcSign = '</font></p>\r\n</td></tr></table>';
            var pos21 = data.indexOf(desSign1, pos20);
            var pos22 = data.indexOf(srcSign, pos21);
            prob["source"] = data.substring(pos21 + desSign1.length, pos22).trim();

            prob["id"] = parseInt(id);
            prob.unixify();

            serverCallback("LSUOJ", prob, resp);

            console.log(prob);
        }, "gbk");
    }, "gbk");
}

exports.start = function(port) {
    var server = require("./util/server");
    server.start(lsuCallback, port);
}
