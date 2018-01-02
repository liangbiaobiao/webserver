var light=require("./light");
var router=light.Router();
router.get("/",function(req,res){
    res.render("index.html",{name:"light"});
})