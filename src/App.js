import React, { Component } from 'react';
import Bookings from './components/bookings';
import debounce from './utils/debounce';
import './App.css';

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      searchText: ''
    }
    this.onSearchInput = this.onSearchInput.bind(this);
    this.applySearch = debounce(this.applySearch, 500);
  }
  applySearch(searchText) {
    this.setState({ searchText });
  }
  onSearchInput(event) {
    this.applySearch(event.target.value.toLowerCase());
  }
  render() {
    const { searchText } = this.state;
    return (
      <div className="App">        
        <div className="container">
          <h2 className="brand-logo mt-2 mb-3">Acme Inc.</h2>
          <div className="page-header mt-2 mb-3">
            <span className="page-heading">Bookings</span>
            <input 
              className="search-bar float-right"
              type="search"
              placeholder="Search for booking by product name"
              onChange={this.onSearchInput} />
          </div>
          <Bookings searchText={searchText} />
        </div>
      </div>
    );
  }
}

export default App;
