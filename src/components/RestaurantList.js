import React, { useState, useEffect } from 'react';
import axios from 'axios';
import restaurant_image_1 from '../assets/restaurantImages/restaurant_image_1.png';
import restaurant_image_2 from '../assets/restaurantImages/restaurant_image_2.png';
import restaurant_image_3 from '../assets/restaurantImages/restaurant_image_3.png';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapLocationDot, faRoute, faStar, faLocationCrosshairs } from '@fortawesome/free-solid-svg-icons';

const RestaurantList = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(12);
    const [totalPages, setTotalPages] = useState(1);
    const [cuisineTypes, setCuisineTypes] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [averageCost, setAverageCost] = useState(0);
    const [country, setCountry] = useState('');
    const [searchKey, setSearchKey] = useState('');
    const [range, setRange] = useState(100000); // Default range in meters
    const navigate = useNavigate();
    const restaurantImages = [
        restaurant_image_2,
        restaurant_image_1,
        restaurant_image_3,
    ];

    const cuisines = [
        "French", "Japanese", "Desserts", "Seafood", "Asian", "Filipino", "Indian", 
        "Sushi", "Korean", "Chinese", "European", "Mexican", "American", "Ice Cream", 
        "Cafe", "Italian", "Pizza", "Bakery", "Mediterranean", "Fast Food", 
        "Brazilian", "Arabian", "Bar Food", "Grill", "International", "Peruvian", 
        "Latin American", "Burger", "Juices", "Healthy Food", "Beverages", "Lebanese", 
        "Sandwich", "Steak", "BBQ", "Gourmet Fast Food", "Mineira", "North Eastern", 
        "Coffee and Tea", "Vegetarian", "Tapas", "Breakfast", "Diner", "Southern", 
        "Southwestern", "Spanish", "Argentine", "Caribbean", "German", "Vietnamese", 
        "Thai", "Modern Australian", "Teriyaki", "Cajun", "Canadian", "Tex-Mex", 
        "Middle Eastern", "Greek", "Bubble Tea", "Tea", "Australian", "Fusion", 
        "Cuban", "Hawaiian", "Salad", "Irish", "New American", "Soul Food", "Turkish", 
        "Pub Food", "Persian", "Continental", "Singaporean", "Malay", "Cantonese", 
        "Dim Sum", "Western", "Finger Food", "British", "Deli", "Indonesian", 
        "North Indian", "Mughlai", "Biryani", "South Indian", "Pakistani", "Afghani", 
        "Hyderabadi", "Rajasthani", "Street Food", "Goan", "African", "Portuguese", 
        "Gujarati", "Armenian", "Mithai", "Maharashtrian", "Modern Indian", 
        "Charcoal Grill", "Malaysian", "Burmese", "Chettinad", "Parsi", "Tibetan", 
        "Raw Meats", "Kerala", "Belgian", "Kashmiri", "South American", "Bengali", 
        "Iranian", "Lucknowi", "Awadhi", "Nepalese", "Drinks Only", "Oriya", "Bihari", 
        "Assamese", "Andhra", "Mangalorean", "Malwani", "Cuisine Varies", "Moroccan", 
        "Naga", "Sri Lankan", "Peranakan", "Sunda", "Ramen", "Kiwi", "Asian Fusion", 
        "Taiwanese", "Fish and Chips", "Contemporary", "Scottish", "Curry", 
        "Patisserie", "South African", "Durban", "Kebab", "Turkish Pizza", "Izgara", 
        "World Cuisine"
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
        const locationParam = userLocation ? `&latitude=${userLocation.lat}&longitude=${userLocation.lon}&range=${range}` : '';
        const cuisineParam = cuisineTypes.length > 0 ? `&cuisineTypes=${cuisineTypes.join(',')}` : '';
        const searchKeyParam = searchKey ? `&searchKey=${searchKey}` : '';
        const averageCostParam = averageCost ? `&averageCost=${averageCost}` : '';
        console.log('averageCost', averageCost)
        const countryParam = country ? `&country=${country}` : '';        
        axios.get(`http://localhost:5000/api/restaurants?page=${page}&limit=${limit}${locationParam}${cuisineParam}${searchKeyParam}${averageCostParam}${countryParam}`)
            .then(response => {
                setRestaurants(response.data.restaurants);
                setTotalPages(response.data.totalPages);                
            })
            .catch(error => {
                console.error('Error fetching restaurants:', error);
            });
    };

    const LocationSet = () => {
        console.log(selectedLocation)
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
            console.log('predefinedLocations', predefinedLocations[selectedLocation])
            setUserLocation(predefinedLocations[selectedLocation]);
        }
    };

    useEffect(() => {
        LocationSet();
    }, [window.location]);

    const handleLocationChange = (event) => {        
        setSelectedLocation(event.target.value);
        console.log('selectedLocation', selectedLocation)
    };

    useEffect(() => {
        fetchRestaurants(currentPage);
    }, [currentPage, userLocation, range]);

    useEffect(() => {
        fetchRestaurants(0);
    },[selectedLocation])

    const handleCardClick = (id) => {
        navigate(`/restaurant/${id}`);
    };

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleFilterButtonClick = () => {
        setMenuOpen(!isMenuOpen);
    };

    const handleImageUpload = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        try {
            const response = await axios.post('http://localhost:5000/api/analyze-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }).then(response => {
                setRestaurants(response.data.restaurants);
                setTotalPages(response.data.totalPages);
                setCuisineTypes(response.data.cuisineTypes);
            })
            .catch(error => {
                console.error('Error fetching restaurants:', error);
            });        
        }
        catch (error) {
            console.error('Error uploading image:', error);
        }
    };

    const handleFilterSearch = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        setAverageCost(formData.get('avgCost'));
        setCountry(formData.get('country'));
        setSearchKey(formData.get('nameSearch'));
        
        fetchRestaurants(1);
    };    


    const getCurrencySymbol = (currencyString) => {
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
                <button className="filter-button" onClick={handleFilterButtonClick}>Filter</button>
            </div>
            {/* Sliding side menu */}
            <div className={`side-menu ${isMenuOpen ? 'open' : ''}`}>
                <h2 className="filter-title">Filters</h2>
                <button className="close-menu" onClick={handleFilterButtonClick}>&times;</button>
                <div className='restaurant-header-options'>
                    <div className='LocationFilters'>
                        <select onChange={handleLocationChange}>
                            {locationOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <button onClick={LocationSet}><FontAwesomeIcon icon={faLocationCrosshairs} /></button>
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
                    {/* form to take inputs for name search, average spend, country */}
                    <form onSubmit={handleFilterSearch}>
                        <input type="text" placeholder="Search by name" name='nameSearch' />
                        <input type="text" placeholder="Average Cost for two" name="avgCost" />
                        <input type="text" placeholder="Country" name="country" />
                        {/* select multiple cuisines with search with checkbox and searchbar */}
                        <button>Search</button>
                    </form>
                
                    {/* create a form to take an input image from the user and send to backend */}
                    <form onSubmit={handleImageUpload} method="post" encType="multipart/form-data">
                        <input type="file" name="file" />
                        <input type="hidden" name="page" value={currentPage} />
                        <input type="hidden" name="limit" value={limit} />
                        <input type="hidden" name="latitude" value={userLocation?.lat} />
                        <input type="hidden" name="longitude" value={userLocation?.lon} />
                        <input type="hidden" name="range" value={100000000} />
                        <button type="submit">Upload</button>
                    </form>
                </div>                
            </div>
            <div className={`overlay ${isMenuOpen ? 'show' : ''}`} onClick={handleFilterButtonClick}></div>

            <div className='restaurants-lists'>
                {restaurants.map(restaurant => (
                    <div className="restaurant-card" key={restaurant._id} onClick={() => handleCardClick(restaurant._id)}>
                        <div className="restaurant-image">
                            {restaurant.imageUrl ? (
                                <img src={restaurant.imageUrl} alt={restaurant["Restaurant Name"]} />
                            ) : (
                                <div className="placeholder-image">
                                    <img
                                        src={getImageForId(restaurant["Restaurant ID"])}
                                        alt={restaurant["Restaurant Name"]}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="restaurant-info">
                            <div className="restaurant-info-header">
                                <h2>{restaurant["Restaurant Name"]}</h2>
                                <p className="restaurant-rating">{restaurant["Aggregate rating"]}<FontAwesomeIcon className='fontAwesomeIcon' icon={faStar} style={{color: "gold",}} /></p>
                            </div>
                            <div className='restaurant-info-footer'>
                                <p style={{width: '70%', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}}>{restaurant.Cuisines}</p>                    
                                <p style={{color: 'green', fontWeight: 'bold', width: '20%'}}>{`${restaurant["Average Cost for two"]} ${getCurrencySymbol(restaurant["Currency"])}`}</p>
                            </div>
                            <div className="restaurant-info-footer">
                                <p><FontAwesomeIcon className="fontAwesomeIcon" icon={faMapLocationDot} />
                                {restaurant["City"]}</p>
                                <p><FontAwesomeIcon className='fontAwesomeIcon' icon={faRoute} />{calculateDistance(userLocation?.lat, userLocation?.lon, restaurant.Latitude, restaurant.Longitude)} km</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="pagination">
                <button 
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                >
                    Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button 
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default RestaurantList;
