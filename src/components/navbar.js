import React from 'react';
import './Navbar.css'; // Make sure to create this CSS file for styling
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-logo" onClick={()=> navigate('/')}>
                    <h1>Potato</h1>
                </div>
                <div className='navbar-options'>
                    <ul className="navbar-menu">
                        <li><a href="#home">Home</a></li>
                        <li><a href="#restaurants">Restaurants</a></li>
                    </ul>                    
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
