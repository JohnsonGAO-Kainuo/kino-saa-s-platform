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

    // 1. Aggressive Image Pre-processing
    const images = element.querySelectorAll('img')
    console.log(`Found ${images.length} images in document`);
    
    const imagePromises = Array.from(images).map(async (img) => {
      if (!img.src || img.src.startsWith('data:')) return;

      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (!img.complete) {
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            setTimeout(reject, 10000);
          });
        }

        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        ctx.drawImage(img, 0, 0);
        img.src = canvas.toDataURL('image/png');
      } catch (error) {
        console.warn(`Failed to convert image:`, error);
      }
    });

    await Promise.allSettled(imagePromises);
    
    // 2. Capture the element
    console.log("Capturing canvas...");

    const canvas = await html2canvas(element, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      logging: true,
      allowTaint: true,
      imageTimeout: 0,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.querySelector(".a4-paper-container") as HTMLElement;
        if (clonedElement) {
          // Reset styles that might break html2canvas
          clonedElement.style.transform = "none";
          clonedElement.style.margin = "0";
          clonedElement.style.padding = "20mm 15mm"; // Standard A4 padding
          clonedElement.style.position = "relative";
          clonedElement.style.width = "210mm";
          clonedElement.style.minHeight = "297mm";
          clonedElement.style.boxShadow = "none";
          clonedElement.style.borderRadius = "0";
          
          // Force standard colors on everything in the clone to avoid oklch/lab errors
          const all = clonedElement.querySelectorAll('*');
          all.forEach(el => {
            if (el instanceof HTMLElement) {
              // Extract computed colors and force them to RGB
              const style = window.getComputedStyle(el);
              if (style.color.includes('oklch') || style.color.includes('lab')) el.style.color = '#000000';
              if (style.backgroundColor.includes('oklch') || style.backgroundColor.includes('lab')) el.style.backgroundColor = 'transparent';
              if (style.borderColor.includes('oklch') || style.borderColor.includes('lab')) el.style.borderColor = '#e5e5e5';
            }
          });
        }
      }
    })

    console.log("Canvas captured successfully");

    const imgData = canvas.toDataURL("image/png")
    
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

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
    heightLeft -= pdfHeight

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
