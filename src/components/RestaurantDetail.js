import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './RestaurantDetail.css'; // Make sure to create this CSS file for styling
import restaurant_image_1 from '../assets/restaurantImages/restaurant_image_1.png';
import restaurant_image_2 from '../assets/restaurantImages/restaurant_image_2.png';
import restaurant_image_3 from '../assets/restaurantImages/restaurant_image_3.png';

const RestaurantDetail = () => {
    const { id } = useParams();
    const [restaurant, setRestaurant] = useState(null);

    const restaurantImages = [
        restaurant_image_2,
        restaurant_image_1,
        restaurant_image_3,
    ];

    const getImageForId = (id) => {
        // Assuming `_id` is numeric or can be converted to a number
        const index = parseInt(id, 10) % restaurantImages.length;
        return restaurantImages[index];
    };

    useEffect(() => {
        fetch(`http://localhost:5000/api/restaurants/${id}`)
            .then(res => res.json())
            .then(data => setRestaurant(data))
            .catch(err => console.error('Error fetching restaurant details:', err));
    }, [id]);

    return (
        <div className="restaurant-detail">
            {restaurant ? (
                <div className="restaurant-content">
                    {restaurant.imageUrl ? (
                            <img src={restaurant.imageUrl} alt={restaurant["Restaurant Name"]} />
                        ) : (
                            <div className="placeholder-image">
                                <img
                                    width="100%" 
                                    height="100%"
                                    style={{ objectFit: 'cover' }}
                                    src={getImageForId(restaurant["Restaurant ID"])}
                                    alt={restaurant["Restaurant Name"]}
                                />
                            </div>
                        )}
                    <h1>{restaurant["Restaurant Name"]}</h1>
                    <div className="restaurant-info">
                        <p><strong>Address:</strong> {restaurant.Address}</p>
                        <p><strong>Cuisines:</strong> {restaurant.Cuisines}</p>
                        <p><strong>Average Cost for Two:</strong> {restaurant["Average Cost for two"]}</p>
                        <p><strong>Rating:</strong> {restaurant["Aggregate rating"]} ({restaurant["Votes"]} votes)</p>
                        <p><strong>Price Range:</strong> {restaurant["Price range"]}</p>
                        <p><strong>Online Delivery:</strong> {restaurant["Has Online delivery"]}</p>
                        <p><strong>Table Booking:</strong> {restaurant["Has Table booking"]}</p>
                    </div>
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default RestaurantDetail;
