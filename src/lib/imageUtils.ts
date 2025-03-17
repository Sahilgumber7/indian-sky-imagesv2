import EXIF from "exif-js";
import { supabase } from "@/lib/supabaseClient";

// Convert DMS (Degree, Minute, Second) to Decimal Degrees
export const convertDMSToDD = (dms: number[], direction: string): number => {
  let decimal = dms[0] + dms[1] / 60 + dms[2] / 3600;
  if (direction === "S" || direction === "W") decimal *= -1;
  return decimal;
};

// Define the type for EXIF data
interface EXIFData {
  GPSLatitude?: number[];
  GPSLongitude?: number[];
  GPSLatitudeRef?: string;
  GPSLongitudeRef?: string;
}

// Extract GeoData from image EXIF metadata
export const extractGeoData = (
  file: File,
  setGeoData: (data: { lat: number; lon: number } | null) => void,
  setError: (error: string) => void
) => {
  const reader = new FileReader();

  reader.onload = function () {
    const arrayBuffer = reader.result;
    
    EXIF.getData(arrayBuffer as any, function (this: EXIFData) {
      const lat = EXIF.getTag(this, "GPSLatitude") as number[] | undefined;
      const lon = EXIF.getTag(this, "GPSLongitude") as number[] | undefined;
      const latRef = EXIF.getTag(this, "GPSLatitudeRef") as string | undefined;
      const lonRef = EXIF.getTag(this, "GPSLongitudeRef") as string | undefined;

      if (lat && lon && latRef && lonRef) {
        const latitude = convertDMSToDD(lat, latRef);
        const longitude = convertDMSToDD(lon, lonRef);
        setGeoData({ lat: latitude, lon: longitude });
      } else {
        setError("⚠️ This image does not contain location data.");
      }
    });
  };

  reader.readAsArrayBuffer(file);
};

// Handle Image Upload to Supabase
export const uploadImage = async (
  file: File | null,
  geoData: { lat: number; lon: number } | null,
  setUploadStatus: (status: string | null) => void,
  setSelectedImage: (file: File | null) => void,
  setPreview: (url: string | null) => void,
  setGeoData: (data: { lat: number; lon: number } | null) => void,
  setError: (error: string) => void,
  closeDialog: () => void
) => {
  if (!file || !geoData) {
    setError("⚠️ Cannot upload an image without location data.");
    return;
  }

  setUploadStatus(null);
  setError("");

  const fileName = `sky-images/${Date.now()}-${file.name}`;

  try {
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("sky-images")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Fetch the public URL
    const { data: publicUrlData } = supabase.storage.from("sky-images").getPublicUrl(fileName);
    const imageUrl = publicUrlData.publicUrl;

    // Insert metadata into Supabase database
    const { error: dbError } = await supabase.from("images").insert([
      {
        image_url: imageUrl,
        latitude: geoData.lat,
        longitude: geoData.lon,
      },
    ]);

    if (dbError) throw dbError;

    setUploadStatus("✅ Image uploaded successfully!");
    setSelectedImage(null);
    setPreview(null);
    setGeoData(null);

    // Close the dialog after 1 second
    setTimeout(() => closeDialog(), 1000);
  } catch (error) {
    console.error("Upload Failed:", error);
    setUploadStatus("❌ Upload failed. Try again.");
  }
};
