import React from "react";

export default function Header({ navigate, loggedIn, setLoggedIn }) {
  return (
    <header className="w-full bg-blue-600 text-white p-4 flex justify-between">
      <h1 onClick={() => navigate("home")} className="font-bold text-xl cursor-pointer">
        HamroGhar
      </h1>
      <nav className="flex gap-4">
        <button onClick={() => navigate("home")}>Home</button>
        {!loggedIn && <button onClick={() => navigate("login")}>Login</button>}
        {!loggedIn && <button onClick={() => navigate("register")}>Register</button>}
        {loggedIn && <button onClick={() => { setLoggedIn(false); navigate("home"); }}>Logout</button>}
      </nav>
    </header>
  );
}
