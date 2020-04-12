var express = require("express");
var router = express.Router({mergeParams:true});
var Campground = require("../models/campground");

router.get("/",isLoggedIn,function(req,res){
	//get all the campgrounds from the databsa
	Campground.find({},function(err,allCampgrounds){
		if(err){
			console.log(err);
		}else{
			res.render("campgrounds/list",{campgrounds:allCampgrounds,currentUser:req.user});
		}
	});
});

//CREATE ROUTE
router.post("/",isLoggedIn,function(req,res){
	
//get data from form
	var name = req.body.name;
	var price = req.body.price;
	var image = req.body.image;
	var description = req.body.description;
	var author = {
		id:req.user._id,
		username:req.user.username
	}
	var newCampground = {name:name,price:price,image:image,description:description,author:author};
	//create a new campground and save it to the database
	Campground.create(newCampground,function(err,newlyCreated){
		if(err){
			console.log(err);
		}else{
	    //redirect to the campgrounds page
	    res.redirect("/campgrounds");
		}
	});
});

//NEW ROUTE
router.get("/new",isLoggedIn,function(req,res){
	res.render("campgrounds/new");
});

//SHOW ROUTE -shows more info about one campground
router.get("/:id",function(req,res){
	//find the campground with provided id
	Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){
		if(err){
			console.log(err);
		}else{
			console.log(foundCampground);
			//render show template with that campground
	        res.render("campgrounds/show",{campground:foundCampground});  
		}
	});
});

//EDIT CAMPGROUND ROUTE

router.get("/:id/edit",checkCampgroundOwnership,function(req,res){
		Campground.findById(req.params.id,function(err,foundCampground){
			res.render("campgrounds/edit",{campground:foundCampground});
	   });
	});
	

//UPDATE CAMPGROUND ROUTES

router.put("/:id",checkCampgroundOwnership,function(req,res){
	//find and update the campgrounds
	Campground.findByIdAndUpdate(req.params.id,req.body.campground,function(err,update){
		if(err){
			console.log(err);
		}else{
			//redirect to the show page
			res.redirect("/campgrounds/"+req.params.id);
		}
	});
});

//DESTROY CAMPGROUND ROUTES
router.delete("/:id",checkCampgroundOwnership,function(req,res){
	Campground.findByIdAndRemove(req.params.id,function(err){
		if(err){
		res.redirect("/campgrounds");	
		}else{
			res.redirect("/campgrounds");
		}
	});
});

function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}else{
		req.flash("error","Please Log In First!");
		res.redirect("/login");
	}
}

function checkCampgroundOwnership(req,res,next){
	if(req.isAuthenticated()){
		Campground.findById(req.params.id,function(err,foundCampground){
		if(err){
			req.flash("error","Campground not found");
			res.redirect("back");
		}else{
			//Does the user own campground?
			if(foundCampground.author.id.equals(req.user._id)){
				next();
			}else{
				req.flash("error","You do  not have the Permission");
				req.flash
				res.redirect("back");
			}
         }
	});
		}else{
		req.flash("error","You need to be logged in to do that!");	
	    res.redirect("back");
	}
}

module.exports = router;
