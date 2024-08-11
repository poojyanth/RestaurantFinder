const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Restaurant = require('./models/Restaurant');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();
const multer = require('multer');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors()); 
app.use(bodyParser.json());

mongoose.connect('mongodb+srv://poojyanth2004:projectfotoflask@cluster0.q3pe61c.mongodb.net/zomatoData', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const upload = multer({ 
    dest: 'uploads/',
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
    }
}).single('file');

function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType
    },
  };
}

// Unified search function
async function searchRestaurants(params) {
    const { page = 1, limit = 12, latitude, longitude, range, cuisineT, averageCost , searchKey } = params;
    let query = {};
    console.log('searchRestaurants',params)

    if (latitude && longitude && range) {
        const earthRadius = 6371000; // Earth's radius in meters
        const lat = parseFloat(latitude);
        const lon = parseFloat(longitude);
        const radRange = parseFloat(range);

        const deltaLat = radRange / earthRadius;
        const deltaLon = radRange / (earthRadius * Math.cos(toRadians(lat)));
        const minLat = lat - toDegrees(deltaLat);
        const maxLat = lat + toDegrees(deltaLat);
        const minLon = lon - toDegrees(deltaLon);
        const maxLon = lon + toDegrees(deltaLon);

        query.Latitude = { $gte: minLat, $lte: maxLat };
        query.Longitude = { $gte: minLon, $lte: maxLon };
        
    }
    
    if(searchKey){
        query['Restaurant Name'] = { $regex: searchKey, $options: 'i' };
    }

    if (cuisineT && cuisineT.length > 0) {
        query.Cuisines = { $in: cuisineT[0]}; // 'i' for case-insensitive
    }
    
    console.log('Query:', query);
    const rest = await Restaurant
        .find(query)
        .limit(parseInt(limit))

    console.log('rest',rest.length)

    const restaurants = await Restaurant.find(query)
        .limit(parseInt(limit))
        .sort({ Latitude: -1, Longitude: -1 })
        .skip((parseInt(page) - 1) * limit);
    
    const count = await Restaurant.countDocuments(query);
    console.log(count, 'restaurants found');

    return {
        restaurants,
        totalPages: Math.ceil(count / limit),
        currentPage: page
    };
}

// API Endpoints

// 1. Image Analysis
app.post('/api/analyze-image', (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: `Upload error: ${err.message}` });
        }
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No image file uploaded' });
            }
            const imagePath = req.file.path;
            const mimeType = req.file.mimetype;
            const imagePart = fileToGenerativePart(imagePath, mimeType);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const result = await model.generateContent([
                "tell me what this food image represents among the top 3 types from the list. (give me only the types as array string): [French, Japanese, Desserts, Seafood, Asian, Filipino, Indian, Sushi, Korean, Chinese, European, Mexican, American, Ice Cream, Cafe, Italian, Pizza, Bakery, Mediterranean, Fast Food, Brazilian, Arabian, Bar Food, Grill, International, Peruvian, Latin American, Burger, Juices, Healthy Food, Beverages, Lebanese, Sandwich, Steak, BBQ, Gourmet Fast Food, Mineira, North Eastern, , Coffee and Tea, Vegetarian, Tapas, Breakfast, Diner, Southern, Southwestern, Spanish, Argentine, Caribbean, German, Vietnamese, Thai, Modern Australian, Teriyaki, Cajun, Canadian, Tex-Mex, Middle Eastern, Greek, Bubble Tea, Tea, Australian, Fusion, Cuban, Hawaiian, Salad, Irish, New American, Soul Food, Turkish, Pub Food, Persian, Continental, Singaporean, Malay, Cantonese, Dim Sum, Western, Finger Food, British, Deli, Indonesian, North Indian, Mughlai, Biryani, South Indian, Pakistani, Afghani, Hyderabadi, Rajasthani, Street Food, Goan, African, Portuguese, Gujarati, Armenian, Mithai, Maharashtrian, Modern Indian, Charcoal Grill, Malaysian, Burmese, Chettinad, Parsi, Tibetan, Raw Meats, Kerala, Belgian, Kashmiri, South American, Bengali, Iranian, Lucknowi, Awadhi, Nepalese, Drinks Only, Oriya, Bihari, Assamese, Andhra, Mangalorean, Malwani, Cuisine Varies, Moroccan, Naga, Sri Lankan, Peranakan, Sunda, Ramen, Kiwi, Asian Fusion, Taiwanese, Fish and Chips, Contemporary, Scottish, Curry, Patisserie, South African, Durban, Kebab, Turkish Pizza, Izgara, World Cuisine]",
                imagePart
            ]);

            const response = await result.response;
            const text = response.text();
            const types = text.split(',').map(type => type.trim().replace(/[\[\]"']/g, ''));
            console.log('Cuisine types:', types);
            console.log('api/analyze-image',req.body)

            fs.unlinkSync(imagePath);

            const searchResult = await searchRestaurants({ cuisineT: types, ...req.body });
            console.log('Search result:', searchResult.restaurants.length, 'restaurants found');
            res.json({ cuisineTypes: types, ...searchResult });
        } catch (error) {
            console.error('Error analyzing image:', error);
            res.status(500).json({ error: 'Error analyzing image: ' + error.message });
        }
    });
});

// 2. Restaurant Lists
app.get('/api/restaurants', async (req, res) => {
    try {
        const {cuisineTypes } = req.query;
        const cuisineT = cuisineTypes ? cuisineTypes.split(',') : [];
        console.log('/api/restaurants',cuisineT)
        console.log('/api/restaurants',req.query)  
        const result = await searchRestaurants({cuisineT, ...req.query});
        console.log(result.restaurants.length, 'restaurants found');
        console.log(req.query);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } 
});

// 3. Restaurant by ID
app.get('/api/restaurants/:id', async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        res.json(restaurant);
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

app.listen(port, () => console.log(`Server running on port ${port}`));