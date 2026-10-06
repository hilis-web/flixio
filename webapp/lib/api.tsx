import axios from "axios";

const API = axios.create({
  //baseURL: "http://localhost:5000", // رابط الـ backend المحلي
  baseURL: "https://flixio-h9fc.onrender.com", // LIVE
});

export default API;
