const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
    "Restaurant ID": String,
    "Restaurant Name": String,
    "Country Code": String,
    "City": String,
    "Address": String,
    "Locality": String,
    "Locality Verbose": String,
    "Longitude": String,
    "Latitude": String,
    "Cuisines": String,
    "Average Cost for two": String,
    "Currency": String,
    "Has Table booking": String,
    "Has Online delivery": String,
    "Is delivering now": String,
    "Switch to order menu": String,
    "Price range": String,
    "Aggregate rating": String,
    "Rating color": String,
    "Rating text": String,
    "Votes": String
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);
