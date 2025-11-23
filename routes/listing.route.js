const express = require("express");
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.controller.js");

router.route("/")
    // index route
    .get(wrapAsync(listingController.index))
    // Add Listing 
    .post(isLoggedIn, validateListing, wrapAsync(listingController.createListing));


// Add Listing Form Route
router.get("/new", isLoggedIn, listingController.renderNewForm);


router.route("/:id")
    // Show route
    .get(wrapAsync(listingController.showListing))
    // update listing
    .put(isLoggedIn, isOwner, validateListing, wrapAsync(listingController.updateListing))
    // delete listing
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));


// Edit Form Listing
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));


module.exports = router;