var os=require("os")
function compile(str) {
    var obj = {name: "zhansgan", age: 12, sex: "man"};
    var reg=new RegExp(os.EOL,"g");
    str = str.replace(/'/, '"').replace(reg, "");

    str = str.replace(/<%=(((?!%>).)*)%>/g, function (a, b) {
        return "'+" + b + "+'";
    })

    str = str.replace(/<%(((?!%>).)*)%>/g, function (a, b) {
        return "';\n" + b + "\n tpl+=' "
    })


    str = ("'" + str + "'");

    return new Function("obj", "var tpl='';with(obj){ tpl=" + str + "}\n return tpl");
}

function render(str,data){
    return compile(str)(data)
}

module.exports=render;