/**
 * Created with JetBrains WebStorm.
 * User: xadillax
 * Date: 13-7-30
 * Time: 下午11:56
 * It's the problem object.
 */
function problemobject() {
    this.title = "";

    this.time = 1000;
    this.memo = 65536;

    this.timeJava = 2000;
    this.memoJava = 65536;

    this.description = "";
    this.input = "";
    this.output = "";
    this.sampleInput = "";
    this.sampleOutput = "";

    this.source = "";
    this.hint = "";

    this.id = "0000";

    this.submit = 0;
    this.accept = 0;
    this.ratio = 0.0;
    this.ratioString = "0.00%";
};

problemobject.prototype.unixify = function() {
    for(var key in this) {
        if(typeof(this[key]) === "string") {
            this[key] = this[key].replace(/\r\n/g, "\n");
        }
    }
};

module.exports = problemobject;
