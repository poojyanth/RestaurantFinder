import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import RestaurantList from './components/RestaurantList';
import RestaurantDetail from './components/RestaurantDetail';
import RestaurantL from './components/Restaurant';
import Navbar from './components/navbar';

function App() {
    return (
        <Router>
          <Navbar/>
            <Routes>
                <Route path="/" exact element={<RestaurantList/>} />
                <Route path="/restaurant/:id" element={<RestaurantDetail/>} />
                <Route path="/restaurant" element={<RestaurantL/>} />
            </Routes>
        </Router>
    );
}

export default App;
