"use client";
import { useState } from "react";
import MainHead from "./_components/mainhead";
import MapView from "./_components/mapview";

export default function Home() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="relative">
      <MainHead isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />

      {/* Map Section - Blurs when the dialog is open */}
      <div className={`relative w-full h-screen transition-all duration-300 ${isDialogOpen ? "blur-sm" : ""}`}>
        <MapView />
      </div>
    </div>
  );
}