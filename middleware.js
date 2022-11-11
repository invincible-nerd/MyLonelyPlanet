const ExpressError = require("./utils/ExpressError");
const Campground = require("./models/campground");
const Review = require("./models/review")
const { campgroundSchema, reviewSchema } = require("./schemas")



module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        //store the url they are requesting
        //req.path, req.originalUrl
        //req.session.returnTo = req.originalUrl;
        //console.log(req.session)
        req.flash("error", "Please sign in first")
        return res.redirect("/login")
    }
    next()
}

//middleware for validation
module.exports.validateCampground = (req, res, next) => {
    //define Joi schema, not mongoose schema!!
    // const campgroundSchema = Joi.object({
    //     campground: Joi.object({
    //         title: Joi.string().required(),
    //         price: Joi.number().required().min(0),
    //         image: Joi.string().required(),
    //         location: Joi.string().required(),
    //         description: Joi.string().required()
    //     }).required()
    // })
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!req.user || !campground.author.equals(req.user._id)) {
        req.flash("error", "You don't have permission to do that!")
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    console.log("REVIEW", review)
    console.log(req.user)
    if (!req.user || !review.author.equals(req.user._id)) {
        req.flash("error", "You don't have permission to do that!")
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}