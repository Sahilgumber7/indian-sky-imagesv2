"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabaseClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import "leaflet/dist/leaflet.css";

type SkyImage = {
  id: number;
  image_url: string;
  latitude: number;
  longitude: number;
};

// Dynamically import MapContainer to ensure it runs only on the client side
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });

const createCustomIcon = (imageUrl: string) => {
  return L.divIcon({
    html: `<div style="
      width: 80px;
      height: 80px;
      border-radius: 10%;
      overflow: hidden;
      border: 2px solid gray;
      box-shadow: 0 4px 4px rgba(128, 128, 128, 0.2);
      
      background: url('${imageUrl}') center/cover no-repeat;">
    </div>`,
    className: "custom-marker",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

export default function MapView() {
  const [images, setImages] = useState<SkyImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<SkyImage | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await supabase
        .from("images")
        .select("id, image_url, latitude, longitude");

      if (error) {
        console.error("Error fetching images:", error);
        return;
      }

      setImages(data || []);
    };

    fetchImages();
  }, []);

  return (
    <div>
      {/* Map Container */}
      <MapContainer center={[20.5937, 78.9629]} zoom={5} className="h-screen w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {images.map((image) =>
          image.latitude && image.longitude ? (
            <Marker
              key={image.id}
              position={[image.latitude, image.longitude]}
              icon={createCustomIcon(image.image_url)}
              eventHandlers={{
                click: () => setSelectedImage(image),
              }}
            />
          ) : null
        )}
      </MapContainer>

      {/* Image Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogTitle>Sky Image</DialogTitle>
        <DialogContent className="max-w-lg z-9999">
          <DialogHeader>Sky Image</DialogHeader>
          {selectedImage && (
            <img
              src={selectedImage.image_url}
              alt="Sky"
              className="w-full h-auto object-cover rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
