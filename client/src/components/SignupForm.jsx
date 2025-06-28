
import React, { useState } from "react";
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

function LocationMarker({ setLocation }) {
  useMapEvents({
    click(e) {
      setLocation(e.latlng);
    },
  });
  return null;
}

export default function SignupForm() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });
  const [location, setLocation] = useState(null);
  const [otpSent, setOtpSent] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSendOtp = () => {
    if (!form.email) return alert("Enter email first");
    setOtpSent(true);
    alert("Mock OTP sent to email");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return alert("Passwords do not match");
    }
    console.log("Signup form submitted", { ...form, location });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 w-full max-w-sm animate-fade-in"
    >
      <h2 className="text-3xl font-bold text-center text-blue-600">Register</h2>
      <div className="flex items-center border px-4 py-2 rounded-lg border-gray-300 focus-within:ring-2 ring-blue-400 transition">
        <FaUser className="mr-3 text-gray-500" />
        <input
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="Username"
          required
          className="w-full outline-none bg-transparent"
        />
      </div>
      <div className="flex items-center border px-4 py-2 rounded-lg border-gray-300 focus-within:ring-2 ring-blue-400 transition">
        <FaEnvelope className="mr-3 text-gray-500" />
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          required
          className="w-full outline-none bg-transparent"
        />
      </div>
      {otpSent && (
        <input
          name="otp"
          type="text"
          value={form.otp}
          onChange={handleChange}
          placeholder="Enter OTP"
          required
          className="w-full px-4 py-2 border rounded-lg outline-none"
        />
      )}
      <button
        type="button"
        onClick={handleSendOtp}
        className="w-full text-sm text-blue-600 hover:underline"
      >
        {otpSent ? "Resend OTP" : "Send OTP"}
      </button>
      <div className="flex items-center border px-4 py-2 rounded-lg border-gray-300 focus-within:ring-2 ring-blue-400 transition">
        <FaLock className="mr-3 text-gray-500" />
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          required
          className="w-full outline-none bg-transparent"
        />
      </div>
      <div className="flex items-center border px-4 py-2 rounded-lg border-gray-300 focus-within:ring-2 ring-blue-400 transition">
        <FaLock className="mr-3 text-gray-500" />
        <input
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm Password"
          required
          className="w-full outline-none bg-transparent"
        />
      </div>
      <p className="text-sm text-gray-600">Select your location:</p>
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        style={{ height: "150px", borderRadius: "0.5rem" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {location && <Marker position={location} />}
        <LocationMarker setLocation={setLocation} />
      </MapContainer>
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Register
      </button>
      <div className="text-center text-sm text-gray-600">or sign up with</div>
      <div className="flex justify-center gap-3">
        {["G", "f", "GH", "in"].map((icon, i) => (
          <button
            key={i}
            className="w-10 h-10 flex items-center justify-center bg-white border rounded-full shadow hover:scale-105 transition"
            type="button"
          >
            {icon}
          </button>
        ))}
      </div>
    </form>
  );
}
