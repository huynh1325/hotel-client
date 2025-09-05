import axios from "./axios.customize";

export const createBooking = (data) => {
    return axios.post('/api/v1/booking', data)
}

export const getAllRooms = () => {
  return axios.get("/api/v1/rooms");
};

export const checkoutRoomApi = (roomId, bookingId) => {
  return axios.post(`/api/v1/booking/checkout/${roomId}`, { bookingId });
};

export const getCurrentBookingByRoom = async (roomId) => {
  return axios.get(`/api/v1/booking/room/${roomId}`);
};
