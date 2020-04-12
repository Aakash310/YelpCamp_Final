var express = require("express");
var router = express.Router({mergeParams:true});
var passport = require("passport");
var User = require("../models/user");

//INDEX ROUTE
router.get("/",function(req,res){
	res.render("landing");
});

//==================
//AUTH ROUTES
//==================

router.get("/register",function(req,res){
	res.render("register");
});

router.post("/register",function(req,res){
	req.body.username
	req.body.password
	User.register(new User({username:req.body.username}),req.body.password,function(err,user){
		if(err){
			req.flash("error",err.message);
			return res.render("register");
		}else{
			passport.authenticate("local")(req,res,function(){
				req.flash("success","Welcome to YelpCamp "+user.username);
				res.redirect("/campgrounds");
			});
		}
	});
});

router.get("/login",function(req,res){
	res.render("login");
});
router.post("/login",passport.authenticate("local",{
	successRedirect:"/campgrounds",
	failureRedirect:"/login"
}),function(req,res){	
});

router.get("/logout",function(req,res){
	req.logout();
	req.flash("success","Logged You Out!");
	res.redirect("/campgrounds");
});

function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next;
	}else{
		req.flash("error","Please Log In First!");
		res.redirect("/login");
	}
}

module.exports = router;