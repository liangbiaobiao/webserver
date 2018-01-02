var obj={
    port:9999,
    views:"views",
    staticDir:'static',
    staticType:".jpg,.png,.gif,.css,.js,.jpeg",
    type:{
        ".jpg":"image/jpeg",
        ".jpeg":"image/jpeg",
        ".png":"image/png",
        ".gif":"image/gif",
        ".css":"text/css",
        ".js":"application/x-javascript"
    }
}
module.exports=obj;