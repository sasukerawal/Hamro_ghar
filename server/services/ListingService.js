import Listing from "../models/Listing.js";
import User from "../models/User.js";
import sanitizeHtml from "sanitize-html";

// Strip all HTML — plain text only
const sanitize = (str) =>
    typeof str === "string"
        ? sanitizeHtml(str, { allowedTags: [], allowedAttributes: {} }).trim()
        : str;

/**
 * ListingService - Encapsulates business logic for property listings.
 */
class ListingService {
    /**
     * Safe number conversion utility.
     */
    toNumber(value, fallback = undefined) {
        if (value === undefined || value === null || value === "") return fallback;
        const n = Number(value);
        return Number.isFinite(n) ? n : fallback;
    }

    /**
     * Fetches similar listings based on type, area, and price proximity.
     */
    async getSimilarListings(listingId) {
        const targetListing = await Listing.findById(listingId);
        if (!targetListing) return [];

        const { type, propertyType, price, location, city } = targetListing;
        const districtArea = location?.district || city;

        const query = {
            _id: { $ne: listingId },
            status: "active",
            type,
        };

        if (propertyType) query.propertyType = propertyType;
        if (districtArea) {
            query.$or = [{ "location.district": districtArea }, { city: districtArea }];
        }

        const candidates = await Listing.find(query)
            .select("-description -contact")
            .limit(15);

        return candidates
            .map(c => {
                const priceDiff = Math.abs(c.price - price);
                return { ...c.toObject(), proximityScore: priceDiff / price };
            })
            .sort((a, b) => a.proximityScore - b.proximityScore)
            .slice(0, 4);
    }

    /**
     * Sanitizes and prepares listing data for save/update.
     */
    prepareListingData(data, userId) {
        const {
            type, propertyType, title, description, price,
            location, specs, facilities, amenities, nearby, highlights,
            videoUrl, mapsUrl, contact
        } = data;

        return {
            ownerId: userId,
            type: type || "sale",
            propertyType: propertyType || "house",
            title: sanitize(title),
            description: sanitize(description),
            price: this.toNumber(price),
            location: location || {},
            specs: specs || {},
            facilities: facilities || {},
            amenities: Array.isArray(amenities) ? amenities.map(a => sanitize(a)) : [],
            nearby: Array.isArray(nearby) ? nearby.map(n => ({
                facility: sanitize(n.facility),
                distance: sanitize(n.distance)
            })) : [],
            highlights: Array.isArray(highlights) ? highlights.map(h => sanitize(h)) : [],
            videoUrl: videoUrl || "",
            mapsUrl: mapsUrl || "",
            contact: {
                phone: sanitize(contact?.phone || ""),
                email: sanitize(contact?.email || ""),
                whatsapp: sanitize(contact?.whatsapp || ""),
                socialMedia: sanitize(contact?.socialMedia || "")
            },
            status: "active"
        };
    }

    /**
     * Fetches the owner details for a set of listings.
     */
    async attachOwnersToListings(listings) {
        const ownerIds = [...new Set(listings.map(l => l.ownerId?.toString()).filter(Boolean))];
        const owners = await User.find({ _id: { $in: ownerIds } }).select("name socials");
        const ownerMap = owners.reduce((map, o) => ({ ...map, [o._id.toString()]: o }), {});

        return listings.map(l => {
            const obj = l.toObject ? l.toObject() : l;
            const ow = ownerMap[l.ownerId?.toString()];
            obj.owner = ow ? { name: ow.name, socials: ow.socials || {} } : {};
            return obj;
        });
    }

    /**
     * Complex filter and search for listings.
     */
    async getAllListings(filters) {
        const {
            type, propertyType, city, province, district, municipality,
            minPrice, maxPrice, minLandArea, maxLandArea, roadAccess,
            facing, beds, baths, furnished, internet, parking, petsAllowed,
            status, amenities, limit, page
        } = filters;

        const query = { status: status || "active" };

        if (type) query.type = type;
        if (propertyType) query.propertyType = propertyType;

        // Location Filters
        if (province) query["location.province"] = new RegExp(`^${province.trim()}$`, "i");
        if (district) query["location.district"] = new RegExp(`^${district.trim()}$`, "i");
        if (municipality) query["location.municipality"] = new RegExp(`^${municipality.trim()}$`, "i");

        if (city?.trim()) {
            const pattern = new RegExp(city.trim(), "i");
            query.$or = [
                { city: pattern }, { address: pattern },
                { "location.district": pattern }, { "location.municipality": pattern }
            ];
        }

        // Range Filters
        const priceQuery = {};
        if (minPrice) priceQuery.$gte = Number(minPrice);
        if (maxPrice) priceQuery.$lte = Number(maxPrice);
        if (Object.keys(priceQuery).length > 0) query.price = priceQuery;

        // Pagination
        const limitN = Math.min(Number(limit || 12), 50);
        const pageN = Math.max(Number(page || 1), 1);
        const skip = (pageN - 1) * limitN;

        const [listings, totalCount] = await Promise.all([
            Listing.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitN),
            Listing.countDocuments(query)
        ]);

        const listingsWithOwner = await this.attachOwnersToListings(listings);

        return {
            listings: listingsWithOwner,
            totalPages: Math.max(Math.ceil(totalCount / limitN), 1),
            page: pageN,
            totalCount
        };
    }

    /**
     * Create a new listing with geocoding.
     */
    async createListing(data, userId) {
        const preparedData = this.prepareListingData(data, userId);

        // Auto-title if missing
        if (!preparedData.title) {
            preparedData.title = `${preparedData.propertyType} in ${preparedData.location?.district || "Nepal"}`;
        }

        const listing = new Listing(preparedData);
        listing.priceHistory = [{ price: listing.price, changedAt: new Date() }];

        await listing.save();
        return listing;
    }
}

export default new ListingService();
