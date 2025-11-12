import React from "react";
import { Search } from "lucide-react";
import ListingCard from "../components/ListingCard";
import { listings } from "../data/listings";

export default function Home({ navigate }) {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="w-full py-32 text-center">
        <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">
          Find Your Perfect Home.
        </h1>
        <p className="mt-3 text-lg text-slate-500 max-w-2xl mx-auto">
          Search properties for sale and rent across the country.
        </p>

        {/* Search Input */}
        <div className="mt-8 max-w-3xl mx-auto flex items-center gap-3 border border-slate-300 rounded-full px-6 py-3 shadow-sm hover:shadow-md transition">
          <Search className="text-slate-500" size={20} />
          <input
            type="text"
            placeholder="Enter city, neighborhood, or ZIP"
            className="flex-1 outline-none text-slate-700 placeholder-slate-400"
          />
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full transition">
            Search
          </button>
        </div>
      </section>

      {/* Listings */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Featured Listings</h2>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium" onClick={() => navigate("membership")}>
            View More →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {listings.map((home) => (
            <ListingCard key={home.id} home={home} />
          ))}
        </div>
      </section>
    </div>
  );
}
