import { useEffect, useState } from "react";
import axios from "axios";
import { FaCamera } from "react-icons/fa";
import { motion } from "framer-motion";
import api from "../api";
import toast, { Toaster } from "react-hot-toast";

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profilePic, setProfilePic] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    type: "expense",
    category: "",
    date: "",
  });

  // Totals
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = income - expenses;

  // ✅ Fetch transactions + user DP
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const txRes = await axios.get("http://localhost:4000/api/transactions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTransactions(txRes.data);

        const userRes = await axios.get("http://localhost:4000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (userRes.data.profilePic) {
          setProfilePic(userRes.data.profilePic);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Failed to load data!");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ✅ DP Upload
  const handleDPChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("photo", file);

      const res = await axios.post(
        "http://localhost:4000/api/users/upload-dp",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

  

      setProfilePic(res.data.profilePic);
      toast.success("Profile picture updated!");
    } catch (err) {
      console.error("Error uploading DP:", err);
      toast.error("Failed to upload profile picture!");
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.post(
        "http://localhost:4000/api/transactions",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTransactions([res.data, ...transactions]);
      setFormData({ title: "", amount: "", type: "expense", category: "", date: "" });
      toast.success("Transaction added successfully!");
    } catch (err) {
      console.error("Error adding transaction:", err);
      toast.error("Error adding transaction");
    }
  };

  if (loading)
    return (
      <p className="text-center mt-10 text-lg animate-pulse text-gray-600">
        Loading your dashboard...
      </p>
    );

        const handleDelete = async (id) => {
  try {
    await api.delete(`/transactions/${id}`);
    setTransactions(transactions.filter(t => t._id !== id)); // remove from UI
    toast.success("Transaction deleted successfully!");

  } catch (error) {
    console.error("Delete failed:", error);
  }
};

  return (
    <div className="min-h-screen bg-gray-100 p-6 transition-all duration-300">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold flex items-center gap-2"
        >
          📊 Dashboard
        </motion.h1>

        {/* Profile + Logout */}
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="relative group"
          >
            <img
              src={
                profilePic ||
                "https://cdn-icons-png.flaticon.com/512/847/847969.png"
              }
              alt="Profile"
              className="w-12 h-12 rounded-full border-2 border-blue-500 object-cover shadow-md transition-transform group-hover:scale-105"
            />
            <label
              htmlFor="dpUpload"
              className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-all"
            >
              <FaCamera size={14} />
            </label>
            <input
              type="file"
              id="dpUpload"
              accept="image/*"
              onChange={handleDPChange}
              className="hidden"
            />
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </motion.button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { title: "Income", value: income, color: "green" },
          { title: "Expenses", value: expenses, color: "red" },
          { title: "Balance", value: balance, color: "blue" },
        ].map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            className="bg-white p-4 rounded-xl shadow text-center transition-all"
          >
            <h2 className="text-lg font-semibold">{item.title}</h2>
            <p
              className={`text-${item.color}-600 text-2xl font-bold tracking-wide`}
            >
              {item.value} PKR
            </p>
          </motion.div>
        ))}
      </div>

      {/* Transactions */}
     <motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  className="bg-white p-6 rounded-xl shadow mb-6"
>
  <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>

  {transactions.length === 0 ? (
    <p className="text-gray-500">No transactions yet.</p>
  ) : (
    <div className="space-y-4">
      {transactions.map((tx) => (
        <motion.div
          key={tx._id}
          whileHover={{ scale: 1.02 }}
          className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:shadow-md transition"
        >
          <div>
            <h3 className="font-semibold">{tx.title}</h3>
            <p className="text-sm text-gray-500">
              {tx.category} • {new Date(tx.date).toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <p
              className={`font-bold ${
                tx.type === "income" ? "text-green-600" : "text-red-600"
              }`}
            >
              {tx.type === "income" ? "+" : "-"} {tx.amount} PKR
            </p>

            {/* ✅ Delete button INSIDE the map */}
            <button
              onClick={() => handleDelete(tx._id)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
            >
              Delete
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  )}
</motion.div>


      {/* Add Transaction */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-xl shadow"
      >
        <h2 className="text-xl font-bold mb-4">➕ Add Transaction</h2>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={formData.title}
            onChange={handleChange}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={formData.amount}
            onChange={handleChange}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={formData.category}
            onChange={handleChange}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition md:col-span-2"
          >
            Add Transaction
          </button>
        </form>
      </motion.div>

      {uploading && (
        <p className="text-center text-blue-600 mt-4 animate-pulse">
          Uploading profile picture...
        </p>
      )}
    </div>
  );
}
