import axios from "axios";

const api = axios.create({
  baseURL: "finance-tracker-7vg51zwyf-farhan-bukharis-projects-5f032396.vercel.app",
});

// ✅ Automatically attach token (if logged in)
api.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// 🧠 Auth Routes
export const signup = (data) => api.post("/auth/signup", data);
export const login = (data) => api.post("/auth/login", data);

// 💰 Transaction Routes
export const addTransaction = (data) => api.post("/transactions/add", data);
export const getTransactions = () => api.get("/transactions");
export const deleteTransaction = (id) => api.delete(`/transactions/${id}`);

// 🖼️ Upload Profile Picture
export const uploadProfilePic = (formData) =>
  api.post("/users/upload-dp", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// ✅ Correct default export
export default api;
