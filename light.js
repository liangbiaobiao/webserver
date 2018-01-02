var http = require("http");
var path = require("path");
var fs = require("fs");
var config = require("./config");
var ejs = require('./ejs');
class light{
    constructor(){
        this.getInfo=[]
        this.postInfo=[]
        this.useInfo=[];
        this.rootUrl=process.cwd();
    }
    listen(port,fn){
        if(arguments.length==0){
            var port = config.port;
            var fn = function(){
                console.log(port)
            }
        }else if(arguments.length==1){
            if(typeof port=="number"){
                var port = port;
                var fn = function(){
                    console.log(port)
                }
            }else if(typeof port=="function"){
                var fn = port;
                var port = config.port;
            }else{
                var port = config.port;
                var fn = function(){
                    console.log(port)
                }
            }
        }else if(arguments.length==2){
            if(typeof port=='number'&& typeof fn=="function"){
                var port = port;
                var fn = fn;
            }else{
                var port = config.port;
                var fn = function(){
                    console.log(port)
                }
            }
        }

        this.port = port;

        http.createServer((req,res)=>{
            var methods =(req.method);
            var ext = path.extname(req.url);
            if(ext&&config.staticType.indexOf(ext)>-1){
                var dir = path.join(path.resolve(config.staticDir),req.url)
                res.setHeader("content-type",config.type[ext]+";charset=utf8");
                fs.stat(dir,function (err) {
                    if(err){
                        res.writeHead(404);
                        res.end("err");
                    }else{
                        fs.createReadStream(dir).pipe(res)
                    }
                })
            }else{
                this.run(methods,req,res)
            }
        }).listen(port,function(){
            if(fn){
                fn();
            }
        })
    }
    run(type,req,res){
        var url = req.url;
        if(url=='/favicon.ico'){
            res.end();
        }else{
            /*保证中间插件的完成*/
            new Promise((reslove,reject)=>{
                var num=0;
                if(this.useInfo.length==0){
                    var num = -1;
                    reslove();
                }
                for(var i =0;i<this.useInfo.length;i++){
                   new Promise((reslove1,reject1)=>{
                       this.useInfo[i](req,res,reslove1)
                   }).then(()=>{
                       num++;
                       if(num==i){
                           reslove();
                       }
                   })
                }
            }).then(()=>{
                this.extend(req,res);
                this.request(type,req,res,url);
            })
            /*post data 异步 promise 异步按顺序执行 保证访问中间件的内容的时候，保证中间件都加载成功*/
        }
    }
    request(type,req,res,url){
        res.sendState="ok";
        if(type =="GET"){
            var arr = this.getInfo;
        } else{
            var arr = this.postInfo;
        }
        var flag = true;
        for(var i=0;i<arr.length;i++){
            var reg = eval(arr[i].url);
            if(reg.test(url)){
                this.current = i;
                flag=false;
                req.params={};
                var result = reg.exec(url);
                for(let j =0;j<result.length;j++){
                    req.params[arr[i].attr[j]]=result[j+1]
                }
                arr[i].callback(req, res,()=>{
                    this.next(req,res)
                });
                break;
            }
        }
        if(flag){
            res.send('err')
        }
    }
    next(req,res){
        var nextIndex=this.current+1;
        var nextInfo=this.getInfo[nextIndex];
        res.writeHead(302,{location:nextInfo.originUrl});
        res.end();
    }
    get(url,fn){
        this.saveInfo(url,fn,'GET')
    }
    post(url,fn){
        this.saveInfo(url,fn,'POST')
    }
    all(url,fn){
        this.saveInfo(url,fn,'GET')
        this.saveInfo(url,fn,'POST')
    }
    saveInfo(url,fn,type){
        var infoArr= type=="GET"?this.getInfo:this.postInfo;
        var arr=url.match(/:([^\/]+)/g)||[];
        arr=arr.map(function (item) {
            return item.substr(1);
        });

        var str=url.replace(/:[^\/]+/g,"([^\/]+)");
        str=str.replace(/\//g,'\\/');
        str = "/^" + (str) + '[\\/]?(?:\\?.*)?$/';
        var obj={};
        obj["url"]=str;
        obj.callback=fn;
        obj.attr=arr;
        obj["originUrl"]=url;
        infoArr.push(obj);
    }
    extend(req,res){
        res.redirect=function(url){
            res.writeHead(302,{
                "location":url
            })
            res.end();
        }
        res.send=(message)=>{
            res.setHeader("content-type","text/html;charset=utf-8")
            res.end(message)
        }
        res.sendFile=(url)=>{
            var fullpath = path.join(this.rootUrl,url)
            fs.stat(fullpath,function (err) {
                if(err){
                    res.end(err.toString())
                }else{
                    fs.createReadStream(fullpath).pipe(res)
                }
            })
        }
        res.render=function(url,data){
            var url=path.join(path.resolve(config.views),url);
            fs.readFile(url,function(err,data1){
                if(err){
                    res.writeHead(404);
                    res.end();
                }else{
                    res.end(ejs(data1.toString(),data))
                }

            })
        }
        res.download=(url,name="download"+Math.random())=>{
            var url = path.join(this.rootUrl,url);
            res.setHeader("Content-Disposition","attachment;filename="+name);
            res.setHeader("Content-Type","octet-stream");
            fs.createReadStream(url).pipe(res)
        }
    }
    use(fn){
        this.useInfo.push(fn)
    }
}


var obj=new light();

function fn(){
    return obj;
}

fn.Router=function(){
    return obj;
}

module.exports =fn;