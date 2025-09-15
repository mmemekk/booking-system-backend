const bookingServices = require('../services/bookingServices');

exports.testRoute = (req, res) => {
  return res.status(200).json({ message: 'Booking service is running' });
}