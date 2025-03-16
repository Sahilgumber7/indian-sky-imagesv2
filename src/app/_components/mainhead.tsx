"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { extractGeoData, uploadImage } from "@/lib/imageUtils";

export default function Mainhead({ isDialogOpen, setIsDialogOpen }: { isDialogOpen: boolean; setIsDialogOpen: (open: boolean) => void }) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [geoData, setGeoData] = useState<{ lat: number; lon: number } | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const resetDialog = () => {
    setSelectedImage(null);
    setPreview(null);
    setGeoData(null);
    setUploadStatus(null);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedImage(file);
    setPreview(URL.createObjectURL(file));
    setGeoData(null);
    extractGeoData(file, setGeoData, () => {}); // Error handling function is passed but not used here
  };

  const handleUpload = async () => {
    await uploadImage(
      selectedImage,
      geoData,
      setUploadStatus,
      setSelectedImage,
      setPreview,
      setGeoData,
      () => {}, // Placeholder for error handling
      closeDialog // Add the closeDialog function here
    );
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    resetDialog();
  };

  return (
    <div className="flex justify-between items-center p-4 shadow-lg border border-b-2">
      <h1 className="font-bold text-3xl">indianskyimages.</h1>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="text-md font-semibold" onClick={() => setIsDialogOpen(true)}>
            Upload a sky
          </Button>
        </DialogTrigger>
        <DialogContent className="z-[9999] fixed bg-white">
          <DialogHeader>
            <DialogTitle>Upload a sky image</DialogTitle>
          </DialogHeader>
          <Input type="file" accept="image/*" onChange={handleImageChange} />
          {preview && (
            <div className="mt-4 flex flex-col items-center">
              <img src={preview} alt="Preview" className="w-64 h-64 object-cover rounded-lg border" />
              {geoData ? (
                <p className="text-green-600 mt-2">
                  🌍 Location: {geoData.lat.toFixed(6)}, {geoData.lon.toFixed(6)}
                </p>
              ) : (
                <p className="text-red-500 mt-2">⚠️ No location data found</p>
              )}
            </div>
          )}
          {uploadStatus && (
            <p className={`mt-2 text-sm ${uploadStatus.includes("✅") ? "text-green-600" : "text-red-500"}`}>{uploadStatus}</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpload} disabled={!geoData}>Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
