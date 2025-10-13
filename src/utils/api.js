import axios from "./axios.customize";

export const getAllRooms = () => {
  return axios.get("/api/v1/rooms");
};

export const checkoutRoomApi = (roomId, bookingId) => {
  return axios.patch(`/api/v1/booking/checkout/${roomId}`, { bookingId });
};

export const getCurrentBookingByRoom = async (roomId) => {
  return axios.get(`/api/v1/booking/room/${roomId}`);
};

export const createBooking = (data) => {
    return axios.post('/api/v1/booking', data)
}

export const getBookingCheckedOut = () => {
  return axios.get("/api/v1/booking/checkedout");
};

export const loginApi = (name, password) => {
  return axios.post("/api/v1/auth/login", { name, password });
};
