export async function generatePDF(documentType: string, formData: any, fileName: string) {
  try {
    console.log("Starting PDF export for:", documentType);
    
    // Try to find the A4 paper container
    const element = document.querySelector(".a4-paper-container") as HTMLElement;
    if (!element) {
      console.error("A4 paper container not found");
      throw new Error("A4 paper container not found for PDF export");
    }

    const html2canvas = (await import("html2canvas")).default
    const { jsPDF } = await import("jspdf")

    // Critical: Handle images with a more aggressive strategy
    const images = element.querySelectorAll('img')
    console.log(`Found ${images.length} images in document`);
    
    // Convert all images to data URLs to avoid CORS issues
    const imagePromises = Array.from(images).map(async (img) => {
      if (!img.src || img.src.startsWith('data:')) {
        console.log("Image already data URL or empty, skipping");
        return;
      }

      try {
        // Create a canvas to convert the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Wait for image to load
        if (!img.complete) {
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            setTimeout(reject, 10000); // 10 second timeout per image
          });
        }

        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        
        // Draw image to canvas
        ctx.drawImage(img, 0, 0);
        
        // Convert to data URL
        const dataUrl = canvas.toDataURL('image/png');
        img.src = dataUrl;
        console.log(`Converted image to data URL: ${dataUrl.substring(0, 50)}...`);
      } catch (error) {
        console.warn(`Failed to convert image, will try to proceed anyway:`, error);
      }
    });

    await Promise.allSettled(imagePromises);
    
    // Additional delay to ensure rendering
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log("Capturing canvas...");

    // Capture with simplified settings
    const canvas = await html2canvas(element, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      logging: true,
      allowTaint: true, // Allow tainted canvas since we pre-converted images
      imageTimeout: 0, // Disable timeout since we pre-loaded
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.querySelector(".a4-paper-container") as HTMLElement;
        if (clonedElement) {
          clonedElement.style.transform = "none";
          clonedElement.style.margin = "0";
          clonedElement.style.padding = "0";
          clonedElement.style.position = "relative";
          clonedElement.style.width = "210mm";
          clonedElement.style.minHeight = "297mm";
          clonedElement.style.boxShadow = "none";
          clonedElement.style.visibility = 'visible';
          clonedElement.style.display = 'block';
        }
      }
    })

    console.log("Canvas captured successfully", { width: canvas.width, height: canvas.height });

    const imgData = canvas.toDataURL("image/png")
    
    // Create PDF with A4 dimensions
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    
    const imgWidth = pdfWidth
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    
    let heightLeft = imgHeight
    let position = 0

    // First page
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
    heightLeft -= pdfHeight

    // Additional pages
    while (heightLeft > 0) {
      position = heightLeft - imgHeight 
      pdf.addPage()
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pdfHeight
    }
    
    pdf.save(`${fileName}.pdf`)
    console.log("PDF saved successfully");
  } catch (error) {
    console.error("Critical error during PDF generation:", error)
    throw error
  }
}
