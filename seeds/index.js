const mongoose = require("mongoose")
const Campground = require("../models/campground");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelper");

mongoose.connect("mongodb://localhost:27017/yelp", {
    useNewUrlParser: true,
    //useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

//array[Math.floor(Math.random() * array.length)]
const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});//delete everything in db.campgrounds first
    // const c = new Campground({ title: "purple field" });
    // await c.save();
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10
        const camp = new Campground({
            author: "635c7398d55479f99d531cc6",
            location: `${cities[random1000].city}, ${cities[random1000].state} `,
            title: `${sample(descriptors)} ${sample(places)}`,
            //image: "https://source.unsplash.com/collection/483251",
            description: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sed numquam modi nam praesentium. Consequatur quos voluptatibus aperiam quis beatae assumenda tempora facilis architecto sed vero provident maiores sit, aliquam tempore.",
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/ddu16a6yu/image/upload/v1667878477/Yelp/jk5ztzv8vyjb5lwxqmes.jpg',
                    filename: 'Yelp/jk5ztzv8vyjb5lwxqmes'
                }
            ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})