const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({ path: 'reviews', populate: { path: 'author' } }).populate('owner');
    if (!listing) {
        req.flash("error", "Listing doesn't exist!");
        res.redirect("/listings");
    }
    else {
        res.render("listings/show.ejs", { listing });
    }
};

module.exports.createListing = async (req, res) => {
    let url = req.file.path;
    let filename = req.file.filename;
    // console.log(url, "---", fileName);

    const newListing = new Listing(req.body.listing);
    newListing.image = { url, filename };
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New listing created successfully!");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing doesn't exist!");
        res.redirect("/listings");
    }
    else {
        let originalImageUrl = listing.image.url;
        originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
        listing.image.url = originalImageUrl;
        res.render("listings/edit.ejs", { listing });
    }
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });


    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }

    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted successfully!");
    res.redirect("/listings");
};