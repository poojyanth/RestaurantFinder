const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Restaurant = require('./models/Restaurant');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors()); 

// Middleware
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb+srv://poojyanth2004:projectfotoflask@cluster0.q3pe61c.mongodb.net/zomatoData', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/api/restaurants', async (req, res) => {
    console.log('/api/restaurants');
    const { page = 1, limit = 12, latitude = 0, longitude = 0, range = 300000 } = req.query;
    console.log(page,limit, latitude, longitude, range);
    const earthRadius = 6371000; // Earth's radius in meters

    try {
        const lat = parseFloat(latitude);
        const lon = parseFloat(longitude);
        const radRange = parseFloat(range);

        if (isNaN(lat) || isNaN(lon) || isNaN(radRange)) {
            return res.status(400).json({ error: 'Invalid latitude, longitude, or range' });
        }

        // Calculate the bounding box
        const deltaLat = radRange / earthRadius;
        const deltaLon = radRange / (earthRadius * Math.cos(toRadians(lat)));

        const minLat = lat - toDegrees(deltaLat);
        const maxLat = lat + toDegrees(deltaLat);
        const minLon = lon - toDegrees(deltaLon);
        const maxLon = lon + toDegrees(deltaLon);

        // Fetch restaurants within bounding box
        const restaurants = await Restaurant.find({
            Latitude: { $gte: minLat, $lte: maxLat },
            Longitude: { $gte: minLon, $lte: maxLon }
        })
        .limit(parseInt(limit))
        .sort({
            Latitude: -1,
            Longitude: -1
        })
        .skip((parseInt(page) - 1) * limit);

        const count = await Restaurant.countDocuments({
            Latitude: { $gte: minLat, $lte: maxLat },
            Longitude: { $gte: minLon, $lte: maxLon }
        });

        res.json({
            restaurants,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function toDegrees(radians) {
    return radians * (180 / Math.PI);
}


app.get('/api/restaurants/:id', async (req, res) => {
    try {
        console.log('/api/restaurants',req.params.id);
        const restaurant = await Restaurant.findById(req.params.id);
        res.json(restaurant);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start Server
app.listen(port, () => console.log(`Server running on port ${port}`));
