// import axios from "axios";

// const API = axios.create({
//   //baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
//   baseURL: "https://flixio-h9fc.onrender.com",
// });

// export default API;

import axios from "axios";
// const API = axios.create({
// baseURL:
// process.env.NEXT_PUBLIC_API_URL ||
// "http://localhost:5000",
// });

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
});

// Attach the latest token to every request when available.
API.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        delete config.headers.Authorization;
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default API;
