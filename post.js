var querystring = require('querystring')
module.exports=function () {
    return function (req,res,reslove) {
        var datas ='';
        req.body={};
        req.on('data',function (item) {
            datas += item;
        })
        req.on('end',function () {
            var qobj = querystring.parse(datas)
            for(var i in qobj){
                req.body[i] = qobj[i]
            }
            reslove();
        })
    }
}