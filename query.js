var Url = require('url');
var querystring = require('querystring')
module.exports=function () {
    return function (req,res,reslove) {
        var url = req.url;
        var qyString = Url.parse(url).query;
        var qobj = querystring.parse(qyString);
        req.query={};
        for(var i in qobj){
            req.query[i] = qobj[i]
        }
        reslove();
    }
}