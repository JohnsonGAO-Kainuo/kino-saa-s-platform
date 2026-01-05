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

    // Optimization: Pre-load all images before capture and handle potential errors
    const images = element.querySelectorAll('img')
    console.log(`Pre-loading ${images.length} images...`);
    
    await Promise.all(Array.from(images).map(img => {
      if (img.complete && img.naturalHeight !== 0) return Promise.resolve()
      return new Promise((resolve) => {
        img.onload = () => {
          console.log(`Image loaded: ${img.src.substring(0, 50)}...`);
          resolve(true);
        };
        img.onerror = () => {
          console.warn(`Image failed to load: ${img.src.substring(0, 50)}...`);
          resolve(false); // Resolve anyway to not block export
        };
        // Trigger reload if not complete
        if (!img.complete) {
          const src = img.src;
          img.src = '';
          img.src = src;
        }
      })
    }))

    // Small delay to ensure browser rendering catches up
    await new Promise(resolve => setTimeout(resolve, 500));

    // Capture the canvas with specific options to handle scaling
    const canvas = await html2canvas(element, {
      backgroundColor: "#ffffff",
      scale: 2, 
      useCORS: true,
      logging: true,
      allowTaint: false,
      imageTimeout: 30000, // Increase to 30 seconds
      // Critical: Reset transform during capture
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.querySelector(".a4-paper-container") as HTMLElement;
        if (clonedElement) {
          // Force reset all potential interfering styles in the clone
          clonedElement.style.transform = "none";
          clonedElement.style.margin = "0";
          clonedElement.style.padding = "0";
          clonedElement.style.position = "fixed"; // Use fixed to avoid scroll issues
          clonedElement.style.top = "0";
          clonedElement.style.left = "0";
          clonedElement.style.width = "210mm";
          clonedElement.style.minHeight = "297mm";
          clonedElement.style.boxShadow = "none";
          clonedElement.style.zIndex = "9999";
          
          // Ensure container visibility
          clonedElement.style.visibility = 'visible';
          clonedElement.style.display = 'block';
          
          // Force all children to be visible and handle transparent images
          const allChildren = clonedElement.querySelectorAll('*');
          allChildren.forEach(child => {
            if (child instanceof HTMLElement) {
              child.style.visibility = 'visible';
            }
          });

          // Pre-process images in the clone for better compatibility
          const cloneImages = clonedElement.querySelectorAll('img');
          cloneImages.forEach(img => {
            img.crossOrigin = "anonymous";
          });
        }
      }
    })

    console.log("Canvas captured successfully", { width: canvas.width, height: canvas.height });

    const imgData = canvas.toDataURL("image/png")
    
    // Create PDF with A4 dimensions (210mm x 297mm)
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
