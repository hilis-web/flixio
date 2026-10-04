import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000", // رابط الـ backend المحلي
});

export default API;
