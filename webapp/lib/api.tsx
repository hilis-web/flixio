import axios from "axios";

const API = axios.create({
  //baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  baseURL: "https://flixio-h9fc.onrender.com",
});

export default API;
