import { z } from "zod";

export const propertyListingSchema = z.object({
  // Basic Information
  propertyType: z.string()
    .min(1, "Property type is required")
    .refine((val) => ["Flat", "Land", "Warehouse", "Commercial", "other"].includes(val.toLowerCase()), 
      "Invalid property type"),
  
  buildingName: z.string()
    .min(2, "Building name must be at least 2 characters")
    .max(100, "Building name must be less than 100 characters"),
  
  location: z.string()
    .min(3, "Location must be at least 3 characters")
    .max(100, "Location must be less than 100 characters"),
  
  pinCode: z.string()
    .length(6, "Pin code must be exactly 6 digits")
    .regex(/^\d+$/, "Pin code must contain only digits"),

  // Technical Specifications
  floorNumber: z.string()
    .optional(),
  
  totalFloors: z.string()
    .regex(/^\d+$/, "Total floors must be a number")
    .optional()
    .or(z.literal("")),
  
  bedrooms: z.string()
    .regex(/^\d+(\.\d+)?$/, "Bedrooms must be a valid number")
    .optional()
    .or(z.literal("")),
  
  bathrooms: z.string()
    .regex(/^\d+(\.\d+)?$/, "Bathrooms must be a valid number")
    .optional()
    .or(z.literal("")),
  
  balconies: z.string()
    .regex(/^\d+$/, "Balconies must be a number")
    .optional()
    .or(z.literal("")),
  
  carpetArea: z.string()
    .regex(/^\d+(\.\d+)?$/, "Carpet area must be a valid number")
    .refine((val) => val === "" || parseFloat(val) > 0, "Carpet area must be greater than 0")
    .optional()
    .or(z.literal("")),
  
  superBuiltUpArea: z.string()
    .regex(/^\d+(\.\d+)?$/, "Super built-up area must be a valid number")
    .refine((val) => val === "" || parseFloat(val) > 0, "Super built-up area must be greater than 0")
    .optional()
    .or(z.literal("")),

  // Pricing & Status
  askingPrice: z.string()
    .regex(/^\d+$/, "Asking price must be a valid number")
    .refine((val) => val === "" || parseInt(val) > 0, "Asking price must be greater than 0"),
  
  availabilityStatus: z.string()
    .min(1, "Availability status is required")
    .refine((val) => ["Available", "Rented", "Sold", "Upcoming"].includes(val.toLowerCase()), 
      "Invalid availability status"),
  
  availabilityDate: z.string()
    .optional()
    .or(z.literal(""))
    .refine((val) => {
      if (!val) return true;
      return !isNaN(Date.parse(val));
    }, "Invalid date format"),

  // Owner Details
  ownerName: z.string()
    .min(2, "Owner name must be at least 2 characters")
    .max(100, "Owner name must be less than 100 characters"),
  
  ownerPhone: z.string()
    .length(10, "Owner phone must be exactly 10 digits")
    .regex(/^\d+$/, "Owner phone must contain only digits"),
  
  ownerEmail: z.string()
    .email("Please enter a valid owner email address"),
  
  accessType: z.string()
    .min(1, "Access type is required")
    .optional()
    .or(z.literal("")),

  // Source & Notes
  sourcePartner: z.string()
    .optional()
    .or(z.literal("")),
  
  remarks: z.string()
    .max(500, "Remarks must be less than 15000 characters")
    .optional()
    .or(z.literal("")),

  // Society Insights
  builderName: z.string()
    .max(100, "Builder name must be less than 100 characters")
    .optional()
    .or(z.literal("")),
  
  yearBuilt: z.string()
    .regex(/^\d{4}$|^$/, "Year built must be a valid 4-digit year")
    .optional()
    .or(z.literal("")),
  
  totalUnits: z.string()
    .regex(/^\d+$|^$/, "Total units must be a number")
    .optional()
    .or(z.literal("")),
  
  reraNumber: z.string()
    .optional()
    .or(z.literal("")),

  // Amenities
  amenities: z.object({
    parking: z.boolean().default(false),
    gym: z.boolean().default(false),
    lift: z.boolean().default(false),
    security: z.boolean().default(false),
    powerBackup: z.boolean().default(false),
    swimmingPool: z.boolean().default(false),
    clubhouse: z.boolean().default(false),
  }).default({}),

  // Media
  images: z.array(z.instanceof(File))
    .min(1, "At least one image is required")
    .max(20, "Maximum 20 images allowed")
    .refine((files) => files.every(file => file.size <= 5 * 1024 * 1024), 
      "Each image must be less than 5MB"),
  
  societyBrochure: z.instanceof(File)
    .nullable()
    .refine((file) => file === null || file.size <= 10 * 1024 * 1024, 
      "Brochure must be less than 10MB")
    .optional(),
}).strict();

export type PropertyListingFormData = z.infer<typeof propertyListingSchema>;
