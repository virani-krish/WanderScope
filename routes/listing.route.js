const express = require("express");
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.controller.js");

// index route
router.get('/', wrapAsync(listingController.index));

// Add Listing Form Route
router.get('/new', isLoggedIn, listingController.renderNewForm);

// Show route
router.get('/:id', wrapAsync(listingController.showListing));

// Add Listing 
router.post('/', isLoggedIn, validateListing, wrapAsync(listingController.createListing));

// Edit Form Listing
router.get('/:id/edit', isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

// update listing
router.put('/:id', isLoggedIn, isOwner, validateListing, wrapAsync(listingController.updateListing));

// delete listing
router.delete('/:id', isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

module.exports = router;