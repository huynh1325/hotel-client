import axios from "./axios.customize";

const bookingRoom = (name, gender, email, phone, password) => {
    return axios.post('/api/v1/booking', {
        name, gender, email, phone, password
    })
}
