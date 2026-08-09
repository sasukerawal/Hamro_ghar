// src/SafetyTips.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import {
    Shield, AlertTriangle, CheckCircle, Eye, Phone,
    MapPin, CreditCard, Users, ChevronLeft, Lock
} from "lucide-react";

// Tailwind's content scanner only picks up class names it can find as
// complete literal strings in source — `bg-${color}-50` never matches,
// so any color not already used elsewhere verbatim silently compiles to
// nothing (this is exactly what had happened to "purple" and "amber"
// here: the icon tiles rendered with no background/color at all). A
// static map keeps every variant's full class strings visible to Tailwind.
const TIP_COLOR_CLASSES = {
    blue: { bg: "bg-blue-50", icon: "text-blue-600" },
    purple: { bg: "bg-purple-50", icon: "text-purple-600" },
    green: { bg: "bg-green-50", icon: "text-green-600" },
    amber: { bg: "bg-amber-50", icon: "text-amber-600" },
    red: { bg: "bg-red-50", icon: "text-red-600" },
    slate: { bg: "bg-slate-50", icon: "text-slate-600" },
};

const TipCard = ({ icon: Icon, title, tips, color = "blue" }) => {
    const tone = TIP_COLOR_CLASSES[color] || TIP_COLOR_CLASSES.blue;
    return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow`}>
        <div className={`flex items-center gap-3 mb-4`}>
            <div className={`p-2 rounded-xl ${tone.bg}`}>
                <Icon className={`w-5 h-5 ${tone.icon}`} />
            </div>
            <h3 className="font-bold text-slate-900">{title}</h3>
        </div>
        <ul className="space-y-2.5">
            {tips.map((tip, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-600 leading-relaxed">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                </li>
            ))}
        </ul>
    </div>
    );
};

const WarningCard = ({ title, description }) => (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-red-900">{title}</h3>
        </div>
        <p className="text-sm text-red-700 leading-relaxed">{description}</p>
    </div>
);

export default function SafetyTips() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            <Helmet>
                <title>Safety Tips - HamroGhar</title>
                <meta name="description" content="Stay safe while searching for homes on HamroGhar. Learn how to identify scams and protect yourself." />
            </Helmet>

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-gold-700 mb-6 font-semibold text-sm transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" /> Back
                </button>

                {/* Header — icon sits beside the heading, not stacked
                    above it in its own tile */}
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="shrink-0 inline-flex p-2.5 bg-blue-100 rounded-2xl">
                            <Shield className="w-6 h-6 text-gold-700" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900">
                            Safety Tips
                        </h1>
                    </div>
                    <p className="text-slate-500 max-w-lg">
                        Protecting yourself from scams is important. Follow these guidelines to have a safe experience on HamroGhar.
                    </p>
                </div>

                {/* Common Scams Warning */}
                <div className="mb-8">
                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        Common Scams to Watch For
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <WarningCard
                            title="Advance Deposit Scams"
                            description="Never send money or deposits before visiting the property in person. Scammers often ask for advance payments via mobile banking and then disappear."
                        />
                        <WarningCard
                            title="Fake Listing Photos"
                            description="If a listing seems too good to be true (very low price, luxury photos), it probably is. Always visit the property before making any commitment."
                        />
                        <WarningCard
                            title="Identity Theft"
                            description="Never share your citizenship card, passport, or bank details via WhatsApp or email before verifying the landlord's identity in person."
                        />
                        <WarningCard
                            title="Duplicate Key Scams"
                            description="Some scammers 'rent' a property they don't own by showing the space when the real owner is away. Always verify ownership documents."
                        />
                    </div>
                </div>

                {/* Safety Tips */}
                <div className="mb-8">
                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        How to Stay Safe
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <TipCard
                            icon={Eye}
                            title="Visit In Person"
                            color="blue"
                            tips={[
                                "Always visit the property before paying any money",
                                "Take a friend or family member with you",
                                "Visit during daylight hours",
                                "Check the neighborhood and surroundings",
                            ]}
                        />
                        <TipCard
                            icon={Users}
                            title="Verify the Owner"
                            color="purple"
                            tips={[
                                "Ask for ownership documents (Lalpurja)",
                                "Verify the owner's identity with their citizenship card",
                                "Check with neighbors to confirm ownership",
                                "Meet at the property, not a separate location",
                            ]}
                        />
                        <TipCard
                            icon={CreditCard}
                            title="Payment Safety"
                            color="green"
                            tips={[
                                "Never pay rent or deposit without a written agreement",
                                "Get a receipt for every payment you make",
                                "Avoid paying large sums in cash — use bank transfer",
                                "Be wary of anyone requesting payment via gift cards or crypto",
                            ]}
                        />
                        <TipCard
                            icon={Phone}
                            title="Communication Safety"
                            color="amber"
                            tips={[
                                "Keep communication within HamroGhar when possible",
                                "Be cautious of listings that rush you into quick decisions",
                                "Don't click suspicious links in messages",
                                "Report any suspicious behavior to us immediately",
                            ]}
                        />
                        <TipCard
                            icon={MapPin}
                            title="Location Red Flags"
                            color="red"
                            tips={[
                                "Be suspicious if the owner won't show you the exact address",
                                "Verify the property matches the listing photos",
                                "Check if the area matches the district/municipality listed",
                                "Google Maps can help verify the location exists",
                            ]}
                        />
                        <TipCard
                            icon={Lock}
                            title="Account Security"
                            color="slate"
                            tips={[
                                "Use a strong, unique password for HamroGhar",
                                "Never share your login credentials",
                                "Be cautious of phishing emails pretending to be HamroGhar",
                                "Report any unauthorized access to your account",
                            ]}
                        />
                    </div>
                </div>

                {/* Report Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
                    <h2 className="text-lg font-bold text-blue-900 mb-2">
                        Encountered something suspicious?
                    </h2>
                    <p className="text-sm text-gold-700 mb-4 max-w-md mx-auto">
                        Help us keep HamroGhar safe. Use the <strong>"Report"</strong> button on any listing to flag suspicious activity.
                        Our team reviews every report.
                    </p>
                    <button
                        onClick={() => navigate("/")}
                        className="bg-gold-500 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-gold-600 transition-colors text-sm"
                    >
                        Browse Listings Safely
                    </button>
                </div>
            </div>
        </div>
    );
}
