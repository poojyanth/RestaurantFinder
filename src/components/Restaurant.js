import React, { useState, useEffect } from 'react';
import axios from 'axios';
import restaurant_image_1 from '../assets/restaurantImages/restaurant_image_1.png';
import restaurant_image_2 from '../assets/restaurantImages/restaurant_image_2.png';
import restaurant_image_3 from '../assets/restaurantImages/restaurant_image_3.png';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapLocationDot, faRoute, faStar, faLocationCrosshairs } from '@fortawesome/free-solid-svg-icons';
import Restaurant from '../server/models/Restaurant';

const RestaurantL = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(12);
    const [totalPages, setTotalPages] = useState(1);
    const [cuisineTypes, setCuisineTypes] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [range, setRange] = useState(100000); // Default range in meters
    const [averageSpend, setAverageSpend] = useState(0); // Default average spend
    const [nameSearch, setNameSearch] = useState(''); // Default name search string
    const navigate = useNavigate();
    const country = 'India'; // Hardcoded country
    const restaurantImages = [
        restaurant_image_2,
        restaurant_image_1,
        restaurant_image_3,
    ];
    
    const locationOptions = [
        { label: "Current Location", value: 0 },
        { label: "Singapore", value: 1 },
        { label: "Dubai", value: 2 },
        { label: "Agra", value: 3 },
        { label: "Bangalore", value: 4}
    ];
    const [selectedLocation, setSelectedLocation] = useState(locationOptions[0].value);
    
    const getImageForId = (id) => {
        const index = parseInt(id, 10) % restaurantImages.length;
        return restaurantImages[index];
    };

    const fetchRestaurants = (page) => {
        const locationParam = userLocation ? `&lat=${userLocation.lat}&lon=${userLocation.lon}&range=${range}` : '';
        const cuisineParam = cuisineTypes.length > 0 ? `&cuisineTypes=${cuisineTypes.join(',')}` : '';
        const averageSpendParam = averageSpend > 0 ? `&averageSpend=${averageSpend}` : '';
        const nameSearchParam = nameSearch ? `&nameSearch=${nameSearch}` : '';
        const apiUrl = `http://localhost:5000/api/restaurants?page=${page}&limit=${limit}&country=${country}${locationParam}${cuisineParam}${averageSpendParam}${nameSearchParam}`;

        axios.get(apiUrl)
            .then(response => {
                setRestaurants(response.data.restaurants);
                setTotalPages(response.data.totalPages);                
            })
            .catch(error => {
                console.error('Error fetching restaurants:', error);
            });
    };

    const LocationSet = () => {
        if (selectedLocation === 0) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setUserLocation({
                            lat: position.coords.latitude,
                            lon: position.coords.longitude,
                        });
                    },
                    (error) => {
                        console.error('Error getting location:', error);
                    }
                );
            } else {
                console.error('Geolocation is not supported by this browser.');
            }
        } else {
            // Set predefined locations based on selectedLocation
            const predefinedLocations = {
                1: { lat : 1.3521, lon: 103.8198},
                2: { lat: 25.2048, lon: 55.2708 },
                3: { lat: 27.1767, lon: 78.0081 },
                4: { lat: 12.9716, lon: 77.5946 },
                // Add more predefined locations with lat/lon here
            };
            setUserLocation(predefinedLocations[selectedLocation]);
        }
    };

    useEffect(() => {
        LocationSet();
    }, [window.location]);

    const handleLocationChange = (event) => {        
        setSelectedLocation(event.target.value);
    };

    useEffect(() => {
        fetchRestaurants(currentPage);
    }, [currentPage, userLocation, range, averageSpend, nameSearch]);

    useEffect(() => {
        fetchRestaurants(currentPage);
    },[selectedLocation]);

    const handleCardClick = (id) => {
        navigate(`/restaurant/${id}`);
    };

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleImageUpload = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const locationParam = userLocation ? `&lat=${userLocation.lat}&lon=${userLocation.lon}&range=${range}` : '';
        const cuisineParam = cuisineTypes.length > 0 ? `&cuisineTypes=${cuisineTypes.join(',')}` : '';
        const averageSpendParam = averageSpend > 0 ? `&averageSpend=${averageSpend}` : '';
        const nameSearchParam = nameSearch ? `&nameSearch=${nameSearch}` : '';
        const apiUrl = `http://localhost:5000/api/analyze-image?country=${country}${locationParam}${cuisineParam}${averageSpendParam}${nameSearchParam}`;

        try {
            const response = await axios.post(apiUrl, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setRestaurants(response.data.restaurants);
            setTotalPages(response.data.totalPages);
            setCuisineTypes(response.data.cuisineTypes);
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };

    const getCurrencySymbol = (currencyString) => {
        if (!currencyString) return ''; // Return an empty string if currencyString is undefined
        const match = currencyString.match(/\(([^)]+)\)/);
        return match ? match[1] : '';
    };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return 'N/A';
        const toRad = (value) => value * Math.PI / 180;
        const R = 6371; // Radius of Earth in kilometers
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return (R * c).toFixed(2);
    };

    return (
        <div className="restaurant-list">
            <div className='restaurant-header'>
                <p className='restaurant-header-h1'>Hot Restaurants in your Area</p>
                <div className='restaurant-header-options'>
                    <select onChange={handleLocationChange}>
                        {locationOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <button onClick={LocationSet}><FontAwesomeIcon icon={faLocationCrosshairs} /></button>
                    <button>Sort by</button>
                    <button>Filter</button>     
                    {/* Create a form to take an input image from the user and send to backend */}
                    <form onSubmit={handleImageUpload} method="post" encType="multipart/form-data">
                        <input type="file" name="file" />
                        <input type="hidden" name="page" value={currentPage} />
                        <input type="hidden" name="limit" value={limit} />
                        <input type="hidden" name="latitude" value={userLocation?.lat} />
                        <input type="hidden" name="longitude" value={userLocation?.lon} />
                        <input type="hidden" name="range" value={range} />
                        <input type="hidden" name="country" value={country} />
                        <input type="hidden" name="averageSpend" value={averageSpend} />
                        <input type="hidden" name="nameSearch" value={nameSearch} />
                        <button type="submit">Upload</button>
                    </form>
                </div>
                <div className="range-slider">
                    <label>
                        Distance: {range / 1000} km
                        <input 
                            type="range" 
                            min="1000" 
                            max="300000" 
                            step="1000" 
                            value={range} 
                            onChange={(e) => setRange(e.target.value)} 
                        />
                    </label>
                </div>
            </div>
            <div className='restaurants-lists'>
                {restaurants.map(restaurant => (
                    <div className="restaurant-card" key={restaurant._id} onClick={() => handleCardClick(restaurant._id)}>
                        <div className="restaurant-image">
                            <img src={getImageForId(restaurant._id)} alt="Restaurant" />
                        </div>
                        <div className="restaurant-details">
                            <div className='restaurant-location'>
                                <FontAwesomeIcon icon={faMapLocationDot} />
                                <p>{restaurant.city}, {restaurant.state}</p>
                            </div>
                            <div className='restaurant-location'>
                                <FontAwesomeIcon icon={faRoute} />
                                <p>{calculateDistance(userLocation?.lat, userLocation?.lon, restaurant.latitude, restaurant.longitude)} km away</p>
                            </div>
                            <p className="restaurant-name">{restaurant.name}</p>
                            <div className='restaurant-rating'>
                                <FontAwesomeIcon icon={faStar} />
                                <p>{restaurant.avgRating}</p>
                            </div>
                            <p className="restaurant-spend">{getCurrencySymbol(restaurant.currency)}{restaurant.averageSpend} for two</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="pagination">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                        key={page}
                        className={page === currentPage ? 'active' : ''}
                        onClick={() => handlePageChange(page)}
                    >
                        {page}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default RestaurantL;
