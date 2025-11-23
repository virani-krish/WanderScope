const express = require("express");
const router = express.Router();
const Listing = require('../models/listing.js');
const wrapAsync = require('../utils/wrapAsync.js');
// Middleware
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");


// index route
router.get('/', wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

// Add Listing Form Route
router.get('/new', isLoggedIn, (req, res) => {
    res.render("listings/new.ejs");
});

// Show route
router.get('/:id', wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({ path: 'reviews', populate: { path: 'author' } }).populate('owner');
    if (!listing) {
        req.flash("error", "Listing doesn't exist!");
        res.redirect("/listings");
    }
    else {
        res.render("listings/show.ejs", { listing });
    }
}));

// Add Listing 
router.post('/', isLoggedIn, validateListing, wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New listing created successfully!");
    res.redirect("/listings");
}));

// Edit Form Listing
router.get('/:id/edit', isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing doesn't exist!");
        res.redirect("/listings");
    }
    else {
        res.render("listings/edit.ejs", { listing });
    }
}));

// update listing
router.put('/:id', isLoggedIn, isOwner, validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;

    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${id}`);
}));

// delete listing
router.delete('/:id', isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted successfully!");
    res.redirect("/listings");
}));

module.exports = router;