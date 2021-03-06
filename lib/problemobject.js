/**
 * Created with JetBrains WebStorm.
 * User: xadillax
 * Date: 13-7-30
 * Time: 下午11:56
 * It's the problem object.
 */
function problemobject(baseurl) {
    this.cache = "";

    this.title = "";

    this.time = 0;
    this.memo = 0;

    this.timeJava = 0;
    this.memoJava = 0;

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

    this.specialJudge = false;

    if(undefined !== baseurl)
    {
        this.baseurl = baseurl;
        if(baseurl[baseurl.length - 1] !== "/") baseurl += "/";
    }
    else this.baseurl = "/";

    this.url = this.baseurl;
};

function create(baseurl) {
    return new problemobject(baseurl);
};

/**
 * Set one problem url
 * @param url
 */
problemobject.prototype.setProblemUrl = function(url) {
    this.url = url;
};

/**
 * Set one problem whether is special judge.
 * @param yes
 */
problemobject.prototype.setSpecialJudge = function(yes) {
    if(undefined === yes || true === yes) {
        this.specialJudge = true;
    } else if(!yes) {
        this.specialJudge = false;
    }
}

/**
 * Set the original HTML code for parsing.
 * @param html
 */
problemobject.prototype.setHtml = function(html) {
    this.cache = html;
};

/**
 * Clear the HTML to save memo space.
 */
problemobject.prototype.clearHtml = function() {
    this.cache = "";
};

/**
 * Set the ID regex to get ID or set ID directly.
 *
 * @param id
 */
problemobject.prototype.setID = function(regex) {
    if(typeof(regex) !== "object") this.id = regex.toString();
    else {
        var result = regex.exec(this.cache);
        if(result === null || result[1] === null) return;

        this.id = result[1].trim();
    }
};

/**
 * Set the title regex to get the title.
 * The regex will parse (bar) in \foo(bar)andbar\
 *
 * @param regex
 */
problemobject.prototype.setTitle = function(regex) {
    if(typeof(regex) !== "object") this.title = regex.toString();
    else {
        var result = regex.exec(this.cache);
        if(result === null || result[1] === null) return;

        this.title = result[1].trim();
    }
};

/**
 * Set the time or time regex.
 *
 * @param regex
 * @param mul
 */
problemobject.prototype.setTime = function(regex, mul) {
    if(typeof(regex) !== "object") this.time = parseInt(regex);
    else {
        var result = regex.exec(this.cache);
        if(result === null || result[1] === null) return;

        this.time = parseInt(result[1].trim());
    }

    if(mul !== undefined) this.time *= mul;
};

/**
 * Set the memo or memo regex.
 *
 * @param regex
 * @param mul
 */
problemobject.prototype.setMemo = function(regex, mul) {
    if(typeof(regex) !== "object") this.memo = parseInt(regex);
    else {
        var result = regex.exec(this.cache);
        if(result === null || result[1] === null) return;

        this.memo = parseInt(result[1].trim());
    }

    if(mul !== undefined) this.time *= mul;
};

/**
 * Set the timeJava or timeJava regex.
 *
 * @param regex
 * @param mul
 */
problemobject.prototype.setTimeJava = function(regex, mul) {
    if(typeof(regex) !== "object") this.timeJava = parseInt(regex);
    else {
        var result = regex.exec(this.cache);
        if(result === null || result[1] === null) return;

        this.timeJava = parseInt(result[1].trim());
    }

    if(mul !== undefined) this.time *= mul;
};

/**
 * Set the memoJava or memoJava regex.
 *
 * @param regex
 * @param mul
 */
problemobject.prototype.setMemoJava = function(regex, mul) {
    if(typeof(regex) !== "object") this.memoJava = parseInt(regex);
    else {
        var result = regex.exec(this.cache);
        if(result === null || result[1] === null) return;

        this.memoJava = parseInt(result[1].trim());
    }

    if(mul !== undefined) this.time *= mul;
};

/**
 * Set the description or description regex.
 *
 * @param regex
 */
problemobject.prototype.setDescription = function(regex) {
    if(typeof(regex) !== "object") this.description = regex.toString();
    else {
        var result = regex.exec(this.cache);
        if(result === null || result[1] === null) return;

        this.description = result[1].trim();
    }
};

/**
 * Set the input or input regex.
 *
 * @param regex
 */
problemobject.prototype.setInput = function(regex) {
    if(typeof(regex) !== "object") this.input = regex.toString();
    else {
        var result = regex.exec(this.cache);
        if(result === null || result[1] === null) return;

        this.input = result[1].trim();
    }
};

/**
 * Set the output or output regex.
 *
 * @param regex
 */
problemobject.prototype.setOutput = function(regex) {
    if(typeof(regex) !== "object") this.output = regex.toString();
    else {
        var result = regex.exec(this.cache);
        if(result === null || result[1] === null) return;

        this.output = result[1].trim();
    }
};

/**
 * Set the sample input or sample input regex.
 *
 * @param regex
 */
problemobject.prototype.setSampleInput = function(regex) {
    if(typeof(regex) !== "object") this.sampleInput = regex.toString();
    else {
        var result = regex.exec(this.cache);
        if(result === null || result[1] === null) return;

        this.sampleInput = result[1];
    }
};

/**
 * Set the sample output or sample output regex.
 *
 * @param regex
 */
problemobject.prototype.setSampleOutput = function(regex) {
    if(typeof(regex) !== "object") this.sampleOutput = regex.toString();
    else {
        var result = regex.exec(this.cache);
        if(result === null || result[1] === null) return;

        this.sampleOutput = result[1];
    }
};

/**
 * Set the source or source regex.
 *
 * @param regex
 */
problemobject.prototype.setSource = function(regex) {
    if(typeof(regex) !== "object") this.source = regex.toString();
    else {
        var result = regex.exec(this.cache);
        if(result === null || result[1] === null) return;

        this.source = result[1].trim();
    }
};

/**
 * Set the hint or hint regex.
 *
 * @param regex
 */
problemobject.prototype.setHint = function(regex) {
    if(typeof(regex) !== "object") this.hint = regex.toString();
    else {
        var result = regex.exec(this.cache);
        if(result === null || result[1] === null) return;

        this.hint = result[1].trim();
    }
};

/**
 * Set the submit or submit regex.
 *
 * @param regex
 */
problemobject.prototype.setSubmitCount = function(regex) {
    if(typeof(regex) !== "object") this.submit = parseInt(regex);
    else {
        var result = regex.exec(this.cache);
        if(result === null || result[1] === null) return;

        this.submit = parseInt(result[1].trim());
    }
};

/**
 * Set the accepted or accepted regex.
 *
 * @param regex
 */
problemobject.prototype.setAcceptedCount = function(regex) {
    if(typeof(regex) !== "object") this.accept = parseInt(regex);
    else {
        var result = regex.exec(this.cache);
        if(result === null || result[1] === null) return;

        this.accept = parseInt(result[1].trim());
    }
};

/**
 * Calculate the ratio.
 */
problemobject.prototype.calcRatio = function() {
    if(this.submit === 0) {
        this.ratio = 0;
        this.ratioString = "0.00%";
    } else {
        this.ratio = this.accept / this.submit;
        this.ratioString = ((this.ratio * 100).toFixed(2)) + "%";
    }
};

/**
 * Remotify the urls such as `src`
 */
problemobject.prototype.remotify = function() {
    this.description = this._remotify(this.description);
    this.input = this._remotify(this.input);
    this.output = this._remotify(this.output);
    this.hint = this._remotify(this.hint);
    this.source = this._remotify(this.source);
};

/**
 * To make the resource valid.
 * @param text
 * @returns string
 * @private
 */
problemobject.prototype._remotify = function(text) {
    var reg = new RegExp("<([^>]*) src=\"(?!http://)([^\"]*)\"([^>]*)>", "g");
    var rep = "<$1 src=\"" + this.baseurl + "$2\" $3>";
    text = text.replace(reg, rep);

    reg = new RegExp("<([^>]*) src='(?!http://)([^']*)'([^>]*)>", "g");
    rep = "<$1 src=\"" + this.baseurl + "$2\" $3>";
    text = text.replace(reg, rep);

    reg = new RegExp("<([^>]*) href=\"(?!http://)([^\"]*)\"([^>]*)>", "g");
    rep = "<$1 href=\"" + this.baseurl + "$2\" $3>";
    text = text.replace(reg, rep);

    reg = new RegExp("<([^>]*) href='(?!http://)([^']*)'([^>]*)>", "g");
    rep = "<$1 href=\"" + this.baseurl + "$2\" $3>";
    text = text.replace(reg, rep);

    return text;
};

/**
 * To unixify the whole content.
 * replace "\r\n" by "\n"
 */
problemobject.prototype.unixify = function() {
    for(var key in this) {
        if(typeof(this[key]) === "string") {
            this[key] = this[key].replace(/\r\n/g, "\n");
        }
    }
};

exports.create = create;
