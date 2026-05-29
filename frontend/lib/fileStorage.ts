// Utility functions for local file storage
// Images are saved to IndexedDB with metadata
// Later can be migrated to Cloudflare R2

interface StoredImage {
  id: string;
  filename: string;
  caption: string;
  data: string; // base64
  timestamp: number;
  listingId?: string;
}

interface StoredListing {
  id: string;
  data: any;
  images: StoredImage[];
  brochure?: StoredImage;
  timestamp: number;
}

const DB_NAME = "DreamKeyDB";
const STORE_NAME = "listings";
const IMAGE_STORE_NAME = "images";

// Initialize IndexedDB
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains(IMAGE_STORE_NAME)) {
        db.createObjectStore(IMAGE_STORE_NAME, { keyPath: "id" });
      }
    };
  });
};

// Save listing with images
export const saveListing = async (
  listingData: any,
  imagePreviews: { file: File; preview: string; caption: string }[],
  brochure: { file: File; preview: string } | null
): Promise<string> => {
  try {
    const db = await initDB();
    const listingId = `listing_${Date.now()}`;

    // Convert files to base64
    const imagePromises = imagePreviews.map((img) => fileToBase64(img.file));
    const brochureBase64 = brochure ? await fileToBase64(brochure.file) : null;

    const images = await Promise.all(imagePromises);

    // Create stored images with metadata
    const storedImages = images.map((data, index) => ({
      id: `img_${listingId}_${index}`,
      filename: imagePreviews[index].file.name,
      caption: imagePreviews[index].caption,
      data,
      timestamp: Date.now(),
      listingId,
    }));

    // Store images
    const tx = db.transaction([IMAGE_STORE_NAME, STORE_NAME], "readwrite");

    for (const image of storedImages) {
      tx.objectStore(IMAGE_STORE_NAME).add(image);
    }

    // Store listing
    const listing: StoredListing = {
      id: listingId,
      data: {
        ...listingData,
        imageCount: storedImages.length,
      },
      images: storedImages,
      brochure: brochureBase64
        ? {
            id: `br_${listingId}`,
            filename: brochure?.file.name ?? "brochure.pdf",
            caption: "Society Brochure",
            data: brochureBase64,
            timestamp: Date.now(),
            listingId,
          }
        : undefined,
      timestamp: Date.now(),
    };

    tx.objectStore(STORE_NAME).add(listing);

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(listingId);
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error("Error saving listing:", error);
    throw error;
  }
};

// Get listing by ID
export const getListing = async (listingId: string): Promise<StoredListing | null> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const request = db
        .transaction([STORE_NAME], "readonly")
        .objectStore(STORE_NAME)
        .get(listingId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error getting listing:", error);
    return null;
  }
};

// Get all listings
export const getAllListings = async (): Promise<StoredListing[]> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const request = db
        .transaction([STORE_NAME], "readonly")
        .objectStore(STORE_NAME)
        .getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error getting listings:", error);
    return [];
  }
};

// Delete listing
export const deleteListing = async (listingId: string): Promise<void> => {
  try {
    const db = await initDB();
    const tx = db.transaction([STORE_NAME, IMAGE_STORE_NAME], "readwrite");

    // Delete listing
    tx.objectStore(STORE_NAME).delete(listingId);

    // Delete all associated images
    const imageStore = tx.objectStore(IMAGE_STORE_NAME);
    const index = imageStore.index("listingId");
    const range = IDBKeyRange.only(listingId);
    imageStore.delete(range);

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error("Error deleting listing:", error);
    throw error;
  }
};

// Convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Export images to files (for download)
export const exportListingAsJSON = async (listingId: string): Promise<void> => {
  const listing = await getListing(listingId);
  if (!listing) return;

  const dataStr = JSON.stringify(listing, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `listing_${listingId}.json`;
  link.click();
  URL.revokeObjectURL(url);
};
