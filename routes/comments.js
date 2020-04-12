var express = require("express");
var router = express.Router({mergeParams:true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");

//====================
//COMMENT ROUTES
//====================

router.get("/new",isLoggedIn,function(req,res){
	//find campground by ID
	Campground.findById(req.params.id,function(err,campground){
		if(err){
			console.log(err);
		}else{
			res.render("comments/new",{campground:campground});
		}
	});
});

router.post("/",function(req,res){
	//lookup campgrounds usingID
	Campground.findById(req.params.id,function(err,campground){
		if(err){
			console.log(eerr);
		    res.redirect("/campgrounds");
		}else{
			//create new comments
			Comment.create(req.body.comment,function(err,comment){
				if(err){
					req.flash("error","Something Went Wrong!");
					console.log(err);
				}else{
					//add username and id to the comment
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					//save comment
					comment.save();
					//connect new comments to campgrounds
					campground.comments.push(comment);
					campground.save();
					//redirect to campgrounds/:id page
					req.flash("success","Successfully Added Comment!");
					res.redirect("/campgrounds/"+campground._id);
				}
			});
		}
	});
});

router.get("/:comment_id/edit",checkCommentOwnership,function(req,res){
	Comment.findById(req.params.comment_id,function(err,comment){
		if(err){
			res.redirect("/campgrounds/"+req.params.id);
		}else{
			res.render("comments/edit",{campground_id:req.params.id,comment:comment});
		}
	});
});

router.put("/:comment_id",checkCommentOwnership,function(req,res){
	Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,updatedComment){
		if(err){
			res.redirect("back");
		}else{
			res.redirect("/campgrounds/"+req.params.id);
		}
	});
});

router.delete("/:comment_id",checkCommentOwnership,function(req,res){
	Comment.findByIdAndRemove(req.params.comment_id,function(err){
		if(err){
			res.redirect("back");
		}else{
			req.flash("success","Comment Deleted!");
			res.redirect("/campgrounds/"+req.params.id);
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

function checkCommentOwnership(req,res,next){
	if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id,function(err,foundComment){
		if(err){
			res.redirect("back");
		}else{
			//Does the user own comment?
			if(foundComment.author.id.equals(req.user._id)){
				next();
			}else{
				req.flash("error","You do not have the permissions!");
				res.redirect("back");
			}
         }
	});
		}else{
		req.flash("error","You need to logged in to do that!");	
	    res.redirect("back");
	}
}


module.exports = router;