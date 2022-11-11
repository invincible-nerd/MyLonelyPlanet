const mongoose = require("mongoose")
const Review = require("./review")
const Schema = mongoose.Schema

//https://res.cloudinary.com/ddu16a6yu/image/upload/w_300/v1667876174/Yelp/oq4efloy12ezegrhoyp8.jpg

const ImageSchema = new Schema({
    url: String,
    filename: String
})

ImageSchema.virtual("thumbnail").get(function () {
    return this.url.replace("/upload", "/upload/w_200")
})

const opts = { toJSON: { virtuals: true } }

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
}, opts)

CampgroundSchema.virtual("properties.popUpMarkup").get(function () {
    return `
    <a href="/campgrounds/${this.id}">${this.title}</a>
    <div class="text-muted"><em>${this.location}</em></div>`
})

CampgroundSchema.post("findOneAndDelete", async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

//save js object Campground in db.campgrounds
module.exports = mongoose.model("Campground", CampgroundSchema)