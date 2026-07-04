import React from 'react';
import { Facebook, Instagram, Phone, ExternalLink } from 'lucide-react';

/**
 * OwnerSocials - Renders a collection of social media/contact buttons for a property owner.
 * 
 * @param {Object} props
 * @param {Object} props.socials - Social profiles (facebook, instagram, whatsapp, tiktok).
 */
const OwnerSocials = ({ socials }) => {
    if (!socials) {
        return (
            <p className="text-xs text-slate-400 italic">
                The owner hasn't added any contact info yet.
            </p>
        );
    }

    const { facebook, instagram, whatsapp, tiktok } = socials;
    const hasAny = facebook || instagram || whatsapp || tiktok;

    if (!hasAny) {
        return (
            <p className="text-xs text-slate-400 italic">
                The owner hasn't added any contact info yet.
            </p>
        );
    }

    const links = [
        {
            key: "facebook",
            href: facebook?.startsWith("http") ? facebook : `https://facebook.com/${facebook}`,
            label: "Facebook",
            icon: <Facebook className="h-4 w-4" />,
            bg: "bg-gold-500 hover:bg-gold-600",
        },
        {
            key: "instagram",
            href: instagram?.startsWith("http") ? instagram : `https://instagram.com/${instagram?.replace(/^@/, "")}`,
            label: "Instagram",
            icon: <Instagram className="h-4 w-4" />,
            bg: "bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
        },
        {
            key: "whatsapp",
            href: whatsapp?.startsWith("http") ? whatsapp : `https://wa.me/${whatsapp?.replace(/\D/g, "")}`,
            label: "WhatsApp",
            icon: <Phone className="h-4 w-4" />,
            bg: "bg-green-500 hover:bg-green-600",
        },
        {
            key: "tiktok",
            href: tiktok?.startsWith("http") ? tiktok : `https://www.tiktok.com/@${tiktok?.replace(/^@/, "")}`,
            label: "TikTok",
            icon: <ExternalLink className="h-4 w-4" />,
            bg: "bg-slate-900 hover:bg-slate-700",
        },
    ].filter(l => !!l.href);

    return (
        <div className="flex flex-wrap gap-2">
            {links.map((link) => (
                <a
                    key={link.key}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-[11px] font-semibold transition-all shadow-sm ${link.bg}`}
                >
                    {link.icon}
                    {link.label}
                </a>
            ))}
        </div>
    );
};

export default React.memo(OwnerSocials);
