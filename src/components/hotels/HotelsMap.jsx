import React, { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { MapPin, Star } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function HotelsMap({ hotels, onHotelClick }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    // Don't initialize if already exists
    if (mapInstanceRef.current || !mapRef.current) return;

    // Calculate center from hotels
    const center = hotels.length > 0 && hotels[0].coordinates
      ? [hotels[0].coordinates.lat, hotels[0].coordinates.lng]
      : [20.5937, 78.9629]; // India center

    // Initialize map
    const map = L.map(mapRef.current).setView(center, 12);
    mapInstanceRef.current = map;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add markers
    hotels.forEach((hotel) => {
      if (!hotel.coordinates) return;

      const marker = L.marker([hotel.coordinates.lat, hotel.coordinates.lng]).addTo(map);
      
      // Create popup content
      const popupContent = `
        <div style="padding: 8px; min-width: 250px;">
          <h3 style="font-weight: bold; font-size: 18px; margin-bottom: 8px;">${hotel.name}</h3>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #6b7280;"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <span style="font-size: 14px; color: #4b5563;">${typeof hotel.location === 'string' ? hotel.location : hotel.location?.city || ''}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #eab308;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            <span style="font-weight: 600;">${hotel.reviews_rating || hotel.rating || 'N/A'}</span>
          </div>
          <div style="margin-bottom: 12px;">
            <div style="font-size: 24px; font-weight: bold; color: #2563eb;">
              $${Number(hotel.price_per_night || hotel.price?.perNight || hotel.price_base || hotel.roomTypes?.[0]?.price || hotel.room_types?.[0]?.price || 0)}
              <span style="font-size: 12px; color: #6b7280; font-weight: normal;">/night</span>
            </div>
          </div>
          <button 
            onclick="window.handleHotelClick('${hotel.id || hotel.name}')"
            style="width: 100%; padding: 8px 16px; background: linear-gradient(to right, #2563eb, #4f46e5); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;"
          >
            View Details
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);
    });

    // Global function for hotel click
    window.handleHotelClick = (hotelId) => {
      const hotel = hotels.find(h => (h.id || h.name) === hotelId);
      if (hotel && onHotelClick) {
        onHotelClick(hotel);
      }
    };

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      delete window.handleHotelClick;
    };
  }, [hotels, onHotelClick]);

  return (
    <Card className="h-[600px] overflow-hidden border-0 shadow-2xl">
      <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
    </Card>
  );
}