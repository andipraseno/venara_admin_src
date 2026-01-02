// src/lib/api.js
import axios from "axios";

const api_actasys = axios.create({
  baseURL: import.meta.env.VITE_API_ACTASYS,
  timeout: 15000,
});

// Interceptor untuk sukses
api_actasys.interceptors.response.use(
  (response) => response,
  (error) => {
    // Jika server tidak bisa dihubungi (network error / offline)
    if (!error.response) {
      console.log("⚠️ Tidak ada koneksi ke server!");
    } else {
      // Kalau server balas error (500, 404, dsb)
      console.log("❌ Error API:", error.response.status, error.response.data);
    }
    return Promise.reject(error);
  }
);

export default api_actasys;
