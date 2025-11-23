const express = require("express");
const router = express.Router({ mergeParams: true });
const Review = require('../models/review.js');
const Listing = require('../models/listing.js');
const wrapAsync = require('../utils/wrapAsync.js');
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware.js');


// Review post route
router.post('/', isLoggedIn, validateReview, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    let newReview = new Review(req.body.review);

    newReview.author = req.user._id;

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    req.flash("success", "New review added successfully!");
    res.redirect(`/listings/${id}`);
}));

// Review delete route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review deleted successfully!");
    res.redirect(`/listings/${id}`);
}));

module.exports = router;