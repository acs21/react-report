import React, { Component } from 'react';
import moment from 'moment';
import './bookings.css';

class Bookings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sellerBookings: null,
      isLoading: false,
      isError: null,
    };
  }

  formatResults(response) {
    const allBookings = response[0].data;
    const allProducts = response[1].data;
    const allSellers = response[2].data;
    const today = moment();
    const bookingsMerged = allBookings
      .map(booking => {
        // get product details
        const product = allProducts.filter(product => booking.productId === product.id);
        return {
          ...booking,
          productName: product[0].name,
          sellerId: product[0].sellerId,
          rate: parseFloat(product[0].rate/100).toFixed(2),
          cost: Math.round(booking.quantity/1000*(product[0].rate/100)),
          live: today.isBetween(booking.startDate, booking.endDate),
          visible: true,
          past: moment(booking.endDate).isSameOrBefore(today)
        }
    });
    // relevant sellers based on booking
    const sellersWithBooking = [...new Set(bookingsMerged.map(b => b.sellerId))];
    const sellerBookings = sellersWithBooking
        .map(sellerId => {
          const seller = allSellers.filter(s => sellerId === s.id);
          const filteredBookings = bookingsMerged
                                   .filter(b => sellerId === b.sellerId)
                                   .sort((a, b) => moment(a.startDate) - moment(b.startDate));
          return {
            sellerId: seller[0].id,
            sellerName: seller[0].name,
            bookings: filteredBookings,
            noMatchFound: false,
            allPast: (filteredBookings.length === filteredBookings.filter(b => b.past === true).length),
          };
        });        
    return sellerBookings;
  }
  
  searchResults(searchText) {
    const filteredResults = this.state.sellerBookings.map(sb => {
      const filteredBookings = sb.bookings.map(b => {
        const productName = b.productName.toLowerCase();
        const allProductWords = productName.split(' ');
        return {
          ...b, 
          visible: searchText.length > 3 ? productName.includes(searchText) : allProductWords.some(w => w.startsWith(searchText))
        };
      });
      return {
        ...sb,
        bookings: filteredBookings,
        noMatchFound: (filteredBookings.length === filteredBookings.filter(b => b.visible === false).length),
      };
    });
    this.setState({ sellerBookings: filteredResults });
  }

  componentDidMount() {
    this.setState({ isLoading: true });
    const apiEndPoint = 'http://localhost:3001';
    const apiBookings = fetch(`${apiEndPoint}/bookings`)
      .then(response => response.json());

    const apiProducts = fetch(`${apiEndPoint}/products`)
      .then(response => response.json());

    const apiSellers = fetch(`${apiEndPoint}/sellers`)
      .then(response => response.json());

    Promise.all([apiBookings, apiProducts, apiSellers]).then(response => {
      const sellerBookings = this.formatResults(response);
      this.setState({ sellerBookings, isLoading: false });
    })
    .catch(err => {
      console.log(err.message);
      this.setState({ isError: err.message, isLoading: false });
    });
  }

  componentDidUpdate(prevProps) {
    if (this.props.searchText !== prevProps.searchText) {
      this.searchResults(this.props.searchText);
    }
  }

  render() {
    const { sellerBookings, isLoading, isError } = this.state;
    const { searchText } = this.props;
    
    if (isLoading) {
      return <p>Loading ...</p>;
    }

    if (isError) {
      return (<div className="alert alert-danger" role="alert">
                An error occured!
              </div>);
    }

    return (
      <div>
        {sellerBookings && sellerBookings.map(sellerBooking =>
        <div key={sellerBooking.sellerId}>
          {(sellerBooking.bookings.length > 0 || !sellerBooking.noMatchFound) &&
            <div className="booking-table mb-3">
              <h5>{sellerBooking.sellerName}</h5>
              {(sellerBooking.bookings.length > 0 && !sellerBooking.noMatchFound && !sellerBooking.allPast) &&
              <table className="table table-bordered">
                <thead className="thead-light">
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Product Name</th>
                    <th scope="col" className="text-right">Quantity</th>
                    <th scope="col" className="text-right">Rate</th>
                    <th scope="col" className="text-right">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {sellerBooking.bookings.map(booking =>
                    booking.visible && !booking.past &&
                    <tr key={booking.id} className={booking.live ? 'live-booking': ''}>
                      <th scope="row">{booking.id.substring(0,5).toUpperCase()}</th>
                      <td>{booking.productName}</td>
                      <td className="text-right">{booking.quantity.toLocaleString()}</td>
                      <td className="text-right">{`$${booking.rate}`}</td>
                      <td className="text-right">{`$${booking.cost.toLocaleString()}`}</td>
                    </tr>
                    )
                  }
                </tbody>
              </table>
              }
              {sellerBooking.allPast && !sellerBooking.noMatchFound &&
                <div className="message-container">No active bookings.</div>
              }
            </div>
          }
        <div>                  
          {(sellerBooking.bookings.length > 0 && sellerBooking.noMatchFound) &&
            <div className="message-container">{`No bookings match your search term '${searchText}'.`}</div>     
          }
        </div>
        </div>
        )}
      </div>
    );
  }
}

export default Bookings;