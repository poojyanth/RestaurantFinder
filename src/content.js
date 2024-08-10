import React, { useState } from 'react';
import { Products } from './components/products';
import productData from './cardata.json';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useEffect } from 'react';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortCriteria, setSortCriteria] = useState('relevance'); // Default sorting criteria
  const [sortOrder, setSortOrder] = useState('asc'); // Default sorting order
  const itemsPerPage = 6;

  // Function to sort the product list based on the selected criteria and order
  const sortProducts = (products) => {
    return products.sort((a, b) => {
      if (sortCriteria === 'price') {
        return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
      } else if (sortCriteria === 'mileage') {
        return sortOrder === 'asc' ? a.mileage - b.mileage : b.mileage - a.mileage;
      } else if (sortCriteria === 'year') {
        return sortOrder === 'asc' ? a.year - b.year : b.year - a.year;
      }
      // Default sorting by relevance
      return 0;
    });
  };

  const filteredProducts = productData
    .filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice();

  const sortedProducts = sortProducts(filteredProducts);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Function to handle sorting criteria change
  const handleSortChange = (event) => {
    const selectedSortCriteria = event.target.value;
    setSortCriteria(selectedSortCriteria);
  };

  // Function to handle sorting order change
  const handleSortOrderChange = (event) => {
    const selectedSortOrder = event.target.value;
    setSortOrder(selectedSortOrder);
  };

  useEffect(() => {
    setCurrentPage(1);
    window.history.pushState(null, null, `/page/1`);
  }, [searchQuery, sortCriteria, sortOrder]);

  return (
    <Router>
      <div>
        <nav className="navbar">
          <div className="navbar__search">
            <input
              className="navbar__search__input"
              type="text"
              placeholder="Search by product name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <i className="navbar__search__icon fi fi-br-search"></i>
          </div>
          {/* Sorting dropdowns */}
          <div className="dropdown">
            <select
              value={sortCriteria}
              onChange={handleSortChange}
              className="sort-dropdown"
            >
              <option value="relevance">Relevance</option>
              <option value="price">Price</option>
              <option value="mileage">Mileage</option>
              <option value="year">Year</option>
            </select>
          </div>
          <div className="dropdown">
            <select
              value={sortOrder}
              onChange={handleSortOrderChange}
              className="sort-order-dropdown"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </nav>

        <div className="App">
          {currentProducts.map((product) => (
            <Products
              key={product.id}
              image={product.image}
              name={product.name}
              year={product.year}
              people={product.people}
              fueltype={product.fuelType}
              drivetype={product.driveType}
              mileage={product.mileage}
              price={product.price}
            />
          ))}x
        </div>

        <div className="pagination">
          <div className="pagination__text">
            {currentPage * 6} from {sortedProducts.length}
          </div>
          <div className="navigators">
            <Link to={`/page/${currentPage > 1 ? currentPage - 1 : currentPage}`}>
              <button
                className="pagination-button paginationIcon"
                disabled={currentPage === 1}
                onClick={() => {
                  if (currentPage > 0) handlePageChange(currentPage - 1);
                }}
              >
                <i className="fi fi-rr-angle-small-left"></i>
              </button>
            </Link>
            {Array.from({ length: Math.min(totalPages, 10) }).map((_, index) => (
              <Link key={index} to={`/page/${index + 1}`}>
                <button
                  className={`pagination-button paginationIcon ${
                    currentPage === index + 1 ? 'active' : ''
                  }`}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </button>
              </Link>
            ))}
            <Link to={`/page/${currentPage < totalPages ? currentPage + 1 : currentPage}`}>
              <button
                className="pagination-button paginationIcon"
                disabled={currentPage === totalPages}
                onClick={() => {
                  if (currentPage < totalPages) handlePageChange(currentPage + 1);
                }}
              >
                <i className="fi fi-rr-angle-small-right"></i>
              </button>
            </Link>
          </div>
          <Routes>
            <Route
              path="/page/:page"
              render={({ match }) => {
                const page = parseInt(match.params.page);
                if (page >= 1 && page <= totalPages) {
                  setCurrentPage(page);
                }
                return null;
              }}
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;



// mongodb+srv://poojyanth2004:projectfotoflask@cluster0.q3pe61c.mongodb.net/Fotoflask