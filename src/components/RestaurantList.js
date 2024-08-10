import React, { useState, useEffect } from 'react';
import axios from 'axios';
import restaurant_image_1 from '../assets/restaurantImages/restaurant_image_1.png';
import restaurant_image_2 from '../assets/restaurantImages/restaurant_image_2.png';
import restaurant_image_3 from '../assets/restaurantImages/restaurant_image_3.png';
import { useNavigate } from 'react-router-dom';

const RestaurantList = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(12);
    const [totalPages, setTotalPages] = useState(1);
    const [userLocation, setUserLocation] = useState(null);
    const navigate = useNavigate();
    const restaurantImages = [
        restaurant_image_2,
        restaurant_image_1,
        restaurant_image_3,
    ];

    const getImageForId = (id) => {
        const index = parseInt(id, 10) % restaurantImages.length;
        return restaurantImages[index];
    };

    const fetchRestaurants = (page) => {
        const locationParam = userLocation ? `&latitude=${userLocation.lat}&longitude=${userLocation.lon}` : '';
        axios.get(`http://localhost:5000/api/restaurants?page=${page}&limit=${limit}${locationParam}`)
            .then(response => {
                setRestaurants(response.data.restaurants);
                setTotalPages(response.data.totalPages);
            })
            .catch(error => {
                console.error('Error fetching restaurants:', error);
            });
    };

    const LocationSet = () => {
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
    }

    useEffect(() => {
        LocationSet();
    }, [window.location]);

    useEffect(() => {
        fetchRestaurants(currentPage);
    }, [currentPage, userLocation]);

    const handleCardClick = (id) => {
        navigate(`/restaurant/${id}`);
    };

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div className="restaurant-list">
            <div className='restaurant-header'>
                <p className='restaurant-header-h1'>Hot Restaurants in your Area</p>
                <div className='restaurant-header-options'>
                    <button onClick={LocationSet}>Location</button>
                    <button>Sort by</button>
                    <button>Filter</button>                    
                </div>
            </div>
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
                            <h2>{restaurant["Restaurant Name"]}</h2>
                            <p>{restaurant.Cuisines}</p>                    
                            <p>{restaurant["Average Cost for two"]}</p>
                            <p>{restaurant.Address}</p>
                            <p>{restaurant.distance} km</p>
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
