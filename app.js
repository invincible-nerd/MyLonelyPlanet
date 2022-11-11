if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
//const Joi = require("joi");
//const { campgroundSchema, reviewSchema } = require("./schemas")
//const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
//const Campground = require("./models/campground");
//const Review = require("./models/review");

const passport = require("passport")
const LocalStrategy = require("passport-local")
const mongoSanitize = require("express-mongo-sanitize")
const helmet = require("helmet")

const MongoStore = require('connect-mongo');

const User = require("./models/user")

const campgroundRoutes = require("./routes/campgrounds")
const reviewRoutes = require("./routes/reviews")
const UserRoutes = require("./routes/users")

const secret = process.env.SECRET || "thisshouldbeabettersecret!"

const dbURL = process.env.DB_URL || "mongodb://localhost:27017/yelp"
//"mongodb://localhost:27017/yelp"
//process.env.DB_URL
mongoose.connect(dbURL, {
    useNewUrlParser: true,
    //useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});


const app = express()

app.engine("ejs", ejsMate)

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

//for every request
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, "public")))

app.use(mongoSanitize({
    replaceWith: '_'
}))
// app.use(
//     helmet({
//         contentSecurityPolicy: false,
//         crossOriginEmbedderPolicy: false
//     })
// );
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit-free.fontawesome.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`, //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
                "https://free4kwallpapers.com"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

const store = MongoStore.create({
    mongoUrl: dbURL,
    secret,
    touchAfter: 24 * 60 * 60 // time period in seconds
})


const sessionConfig = {
    store,
    //by default, cookie name is connect.sid
    name: "lp_session",
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure: true,
        //milliseconds; expires in a week
        //expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))

app.use(flash())

app.use(passport.initialize())
//persistent login session; make sure session is used before passport.session()
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
//how to store a user in the session
passport.serializeUser(User.serializeUser())
//how to get a user out of the session
passport.deserializeUser(User.deserializeUser())


app.use((req, res, next) => {
    //console.log(req.session)
    if (!["/login", "/"].includes(req.originalUrl)) {
        req.session.returnTo = req.originalUrl;
    }
    //after passport authentication, the login session will have req.user
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success")
    res.locals.error = req.flash("error")
    next()
})

// app.get("/fakeUser", async (req, res) => {
//     const user = new User({ email: "coltttt@gmail.com", username: "coltttt" })
//     //hashing function: PBKDF2
//     const newUser = await User.register(user, "monkey")//instance of the model, and the password
//     res.send(newUser)
// })

app.use("/campgrounds", campgroundRoutes)
app.use("/campgrounds/:id/reviews", reviewRoutes)
app.use("/", UserRoutes)

const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log("Serving on port 3000")
})

app.get("/", (req, res) => {
    //res.send("Hello from Yelp Camp!!")
    res.render("home")
})

// app.get("/makecampground", async (req, res) => {
//     const camp = new Campground({ title: "My Backyard", description: "cheap camping!" });
//     await camp.save();
//     res.send(camp)
// })



app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404))
})

//basic error handler
app.use((err, req, res, next) => {
    //const { message = "Something went wrong", statusCode = 500 } = err;
    //res.status(statusCode).send(message);
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Oh No, Something Went Wrong!";
    res.status(statusCode).render("error", { err })
})