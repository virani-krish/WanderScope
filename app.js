if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// routes
const listingRouter = require("./routes/listing.route.js");
const reviewRouter = require("./routes/review.route.js");
const userRouter = require("./routes/user.route.js");

// mongoDB connection
// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderScope";
const ATLASDB_URL = process.env.ATLASDB_URL;

main()
    .then(async () => {
        console.log("connect to DB");

        const store = MongoStore.create({
            mongoUrl: ATLASDB_URL,
            // crypto: {
            //     secret: "mysupersecretcode"
            // },
            touchAfter: 24 * 3600,
            collectionName: 'sessions',
            stringify: false, 
            // autoRemove: 'native',
            // autoRemoveInterval: 10 
        });

        store.on("error", (err) => {
            console.log("ERROR in MONGO SESSION STORE", err);
        });


        // session option
        const sessionOptions = {
            store: store,
            secret: process.env.SECRET,
            resave: false,
            saveUninitialized: false,
            cookie: {
                expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
                maxAge: 7 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                secure: false
            }
        };



        app.use(session(sessionOptions));
        app.use(flash());

        app.use(passport.initialize());
        app.use(passport.session());

        passport.use(new LocalStrategy(User.authenticate()));
        passport.serializeUser(User.serializeUser());
        passport.deserializeUser(User.deserializeUser());


        app.use((req, res, next) => {
            // store flash value to locals
            res.locals.success = req.flash("success");
            res.locals.error = req.flash("error");
            // store user login data to locals
            res.locals.currUser = req.user;
            next();
        });

        app.get("/", (req, res) => {
            res.redirect("/listings");
        });

        app.use("/listings", listingRouter);
        app.use("/listings/:id/reviews", reviewRouter);
        app.use("/", userRouter);




        // 404 Page not found
        app.use((req, res, next) => {
            // next(new ExpressError(404, "Page Not Found!"));
            next(new ExpressError(404, "Page Not Found"));
        });

        // error handling middelware
        app.use((err, req, res, next) => {
            if (res.headersSent) {
                // If headers are already sent, let Express handle the error
                return next(err);
            }

            let { statusCode = 500, message = "Something went wrong!" } = err;
            res.render("error.ejs", { message });

        });

        app.listen(8080, () => {
            console.log("server is start at http://localhost:8080");
        });

    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(ATLASDB_URL);
};


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "public")));

// app.get('/', (req, res) => {
//     res.redirect("/listings");
// });


