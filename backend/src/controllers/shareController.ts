import { prisma } from "../lib/prisma.js";
import type { Response, Request as ExpressRequest } from "express";
import PDFDocument from "pdfkit";

interface JwtPayload {
  userId: string;
}

interface AuthRequest extends ExpressRequest {
  user?: JwtPayload;
}

// Generate secure 10-char alphanumeric random token
const generateToken = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 10; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

// Helper to format currency
const formatPrice = (value?: number | bigint | null): string => {
  if (!value) return "N/A";
  const numValue = Number(value);
  if (numValue >= 10000000) return `₹${(numValue / 10000000).toFixed(2)} Cr`;
  if (numValue >= 100000) return `₹${(numValue / 100000).toFixed(2)} L`;
  return `₹${numValue.toLocaleString("en-IN")}`;
};

// Helper to fetch image buffer for PDFKit
const fetchImageBuffer = async (url: string): Promise<Buffer | null> => {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (err) {
    console.error("Failed to fetch image buffer for PDF:", err);
    return null;
  }
};

// POST /api/leads/:id/share
export const createPropertyShare = async (req: AuthRequest, res: Response) => {
  const timestamp = new Date().toISOString();
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id: leadId } = req.params as { id: string };
    const { propertyId } = req.body as { propertyId?: string };

    if (!leadId) {
      return res.status(400).json({ success: false, message: "Lead ID is required" });
    }
    if (!propertyId) {
      return res.status(400).json({ success: false, message: "Property ID is required" });
    }

    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    const property = await prisma.propertyListing.findUnique({ where: { id: propertyId } });
    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    const token = generateToken();
    const createdShare = await prisma.propertyShare.create({
      data: {
        token,
        leadId,
        propertyId,
      },
    });

    // Automatically create a LeadInteraction log
    await prisma.leadInteraction.create({
      data: {
        leadId,
        type: "PROPERTY_SHARED",
        subject: "Property Shared",
        notes: `Shared ${property.buildingName} property with lead.`,
      },
    });

    const trustedOrigin = process.env.TRUSTED_ORIGIN || "https://dreamkey.in";
    const shareLink = `${trustedOrigin}/share/${token}`;

    return res.status(201).json({
      success: true,
      data: {
        token,
        link: shareLink,
        property: {
          buildingName: property.buildingName,
          location: property.location,
          askingPrice: Number(property.askingPrice),
        },
      },
    });
  } catch (error) {
    console.error(`[${timestamp}] Error creating property share:`, error);
    return res.status(500).json({
      success: false,
      message: "Failed to share property",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// GET /api/share/:token
export const getSharedProperty = async (req: ExpressRequest, res: Response) => {
  const timestamp = new Date().toISOString();
  try {
    const { token } = req.params as { token: string };
    if (!token) {
      return res.status(400).json({ success: false, message: "Token is required" });
    }

    const share = await prisma.propertyShare.findUnique({
      where: { token },
      include: {
        property: {
          include: {
            images: true,
            amenities: true,
          },
        },
      },
    });

    if (!share || !share.property) {
      return res.status(404).json({ success: false, message: "Share link invalid or expired" });
    }

    const p = share.property;
    // Exclude owner, broker, user, and other sensitive metrics
    const serializedProperty = {
      propertyType: p.propertyType,
      buildingName: p.buildingName,
      location: p.location,
      pinCode: p.pinCode,
      floorNumber: p.floorNumber,
      totalFloors: p.totalFloors,
      bedrooms: p.bedrooms ? Number(p.bedrooms) : null,
      bathrooms: p.bathrooms ? Number(p.bathrooms) : null,
      balconies: p.balconies,
      carpetArea: p.carpetArea ? Number(p.carpetArea) : null,
      superBuiltUpArea: p.superBuiltUpArea ? Number(p.superBuiltUpArea) : null,
      askingPrice: Number(p.askingPrice),
      availabilityStatus: p.availabilityStatus,
      remarks: p.remarks,
      builderName: p.builderName,
      yearBuilt: p.yearBuilt,
      totalUnits: p.totalUnits,
      reraNumber: p.reraNumber,
      images: p.images.map((img) => ({
        id: img.id,
        url: img.url,
        caption: img.caption,
        order: img.order,
      })),
      amenities: p.amenities ? {
        parking: p.amenities.parking,
        gym: p.amenities.gym,
        lift: p.amenities.lift,
        security: p.amenities.security,
        powerBackup: p.amenities.powerBackup,
        swimmingPool: p.amenities.swimmingPool,
        clubhouse: p.amenities.clubhouse,
      } : null,
    };

    return res.status(200).json({
      success: true,
      data: {
        token: share.token,
        property: serializedProperty,
      },
    });
  } catch (error) {
    console.error(`[${timestamp}] Error fetching shared property:`, error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch shared property",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// GET /api/share/:token/pdf
export const generateSharedPropertyPdf = async (req: ExpressRequest, res: Response) => {
  const timestamp = new Date().toISOString();
  try {
    const { token } = req.params as { token: string };
    if (!token) {
      return res.status(400).json({ success: false, message: "Token is required" });
    }

    const share = await prisma.propertyShare.findUnique({
      where: { token },
      include: {
        property: {
          include: {
            images: true,
            amenities: true,
          },
        },
      },
    });

    if (!share || !share.property) {
      return res.status(404).json({ success: false, message: "Share link invalid or expired" });
    }

    const p = share.property;

    // Create PDFkit document
    const doc = new PDFDocument({ margin: 40 });
    
    // Set headers to download PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${p.buildingName.replace(/\s+/g, "_")}_details.pdf"`
    );
    
    doc.pipe(res);

    // Header Branding
    doc.fontSize(22).fillColor("#EAB308").text("DreamKey Realty", { align: "center" });
    doc.fontSize(9).fillColor("#737373").text("Premium Real Estate Solutions", { align: "center" });
    doc.moveDown(1);

    // Title / Building Details
    doc.fontSize(16).fillColor("#FFFFFF").rect(40, doc.y, 515, 28).fill("#171717");
    doc.fillColor("#EAB308").text(`  ${p.buildingName}`, 45, doc.y - 22, { baseline: "middle" });
    
    doc.y = doc.y + 6; // offset
    doc.moveDown(0.8);

    // Property Image (optional)
    if (p.images && p.images.length > 0) {
      const sortedImages = [...p.images].sort((a, b) => (a.order || 0) - (b.order || 0));
      const mainImage = sortedImages[0];
      if (mainImage?.url) {
        const buffer = await fetchImageBuffer(mainImage.url);
        if (buffer) {
          try {
            doc.image(buffer, {
              fit: [515, 180],
              align: "center",
            });
            doc.moveDown(1);
          } catch (err) {
            console.error("Failed to render main image inside PDF:", err);
          }
        }
      }
    }

    // Specifications Grid
    doc.fontSize(12).fillColor("#EAB308").text("Property Details", 40);
    doc.strokeColor("#262626").lineWidth(1).moveTo(40, doc.y + 3).lineTo(555, doc.y + 3).stroke();
    doc.moveDown(0.8);

    doc.fontSize(9).fillColor("#A3A3A3");
    
    const details = [
      { label: "Property Type", value: p.propertyType },
      { label: "Location", value: p.location },
      { label: "Pin Code", value: p.pinCode },
      { label: "Asking Price", value: formatPrice(p.askingPrice) },
      { label: "Bedrooms", value: p.bedrooms ? `${p.bedrooms} BHK` : "N/A" },
      { label: "Bathrooms", value: p.bathrooms ? `${p.bathrooms} Bath` : "N/A" },
      { label: "Floor", value: p.floorNumber ? `${p.floorNumber} (of ${p.totalFloors || "N/A"})` : "N/A" },
      { label: "Carpet Area", value: p.carpetArea ? `${p.carpetArea} Sq.Ft.` : "N/A" },
      { label: "Builder", value: p.builderName || "N/A" },
      { label: "RERA Number", value: p.reraNumber || "N/A" },
    ];

    let startY = doc.y;
    details.forEach((item, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = col === 0 ? 50 : 290;
      const y = startY + row * 18;

      doc.fillColor("#737373").text(`${item.label}:`, x, y);
      doc.fillColor("#FFFFFF").text(` ${item.value}`, x + 85, y);
    });

    doc.y = startY + Math.ceil(details.length / 2) * 18 + 10;
    doc.moveDown(0.8);

    // Amenities Section
    if (p.amenities) {
      const amenityLabels: string[] = [];
      if (p.amenities.parking) amenityLabels.push("🚗 Parking");
      if (p.amenities.gym) amenityLabels.push("💪 Gym");
      if (p.amenities.lift) amenityLabels.push("🛗 Lift");
      if (p.amenities.security) amenityLabels.push("🛡️ Security");
      if (p.amenities.powerBackup) amenityLabels.push("⚡ Power Backup");
      if (p.amenities.swimmingPool) amenityLabels.push("🏊 Swimming Pool");
      if (p.amenities.clubhouse) amenityLabels.push("🏢 Clubhouse");

      if (amenityLabels.length > 0) {
        doc.fontSize(12).fillColor("#EAB308").text("Amenities", 40);
        doc.strokeColor("#262626").lineWidth(1).moveTo(40, doc.y + 3).lineTo(555, doc.y + 3).stroke();
        doc.moveDown(0.8);
        
        doc.fontSize(9).fillColor("#FFFFFF");
        doc.text(amenityLabels.join("   |   "), 50);
        doc.moveDown(1.5);
      }
    }

    // Remarks / Description
    if (p.remarks) {
      doc.fontSize(12).fillColor("#EAB308").text("Description", 40);
      doc.strokeColor("#262626").lineWidth(1).moveTo(40, doc.y + 3).lineTo(555, doc.y + 3).stroke();
      doc.moveDown(0.8);
      
      let descriptionText = p.remarks;
      if (descriptionText.length > 800) {
        descriptionText = descriptionText.substring(0, 800) + "...";
      }
      doc.fontSize(9).fillColor("#D4D4D4").text(descriptionText, 50, doc.y, { align: "justify", width: 495 });
      doc.moveDown(1.5);
    }

    // Footer Contact Details (Dynamic position but fixed bottom limit to ensure single-page layout is respected)
    const footerY = Math.max(doc.y + 10, 735);
    doc.strokeColor("#EAB308").lineWidth(1).moveTo(40, footerY).lineTo(555, footerY).stroke();
    doc.fontSize(8).fillColor("#737373").text("For further details or to schedule a visit, contact us at:", 40, footerY + 10, { align: "center" });
    doc.fontSize(9).fillColor("#EAB308").text("DreamKey Realty Support Team", 40, footerY + 22, { align: "center" });

    doc.end();
  } catch (error) {
    console.error(`[${timestamp}] Error generating shared PDF:`, error);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate PDF",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
};
