import React, { useState } from "react";

export default function Login({ navigate, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded">
      <h2 className="text-2xl font-bold mb-4 text-blue-600">Login</h2>
      <input className="border p-2 w-full mb-3" placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input className="border p-2 w-full mb-3" type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <button className="bg-blue-600 text-white py-2 w-full" onClick={onLogin}>Login</button>
      <p className="mt-2 text-sm text-center cursor-pointer text-blue-500" onClick={() => navigate("register")}>Create Account</p>
    </div>
  );
}
