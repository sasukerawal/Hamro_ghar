import React from "react";

export default function Register({ navigate }) {
  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded">
      <h2 className="text-2xl font-bold mb-4 text-blue-600">Register</h2>
      <input className="border p-2 w-full mb-3" placeholder="Email" />
      <input className="border p-2 w-full mb-3" type="password" placeholder="Password" />
      <button className="bg-blue-600 text-white py-2 w-full">Register</button>
      <p className="mt-2 text-sm text-center cursor-pointer text-blue-500" onClick={() => navigate("login")}>Back to Login</p>
    </div>
  );
}
