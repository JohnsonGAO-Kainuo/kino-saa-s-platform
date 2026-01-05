export async function generatePDF(documentType: string, formData: any, fileName: string) {
  try {
    // Try to find the A4 paper container
    const element = document.querySelector(".a4-paper-container") as HTMLElement;
    if (!element) throw new Error("A4 paper container not found for PDF export");

    const html2canvas = (await import("html2canvas")).default
    const { jsPDF } = await import("jspdf")

    // Optimization: Pre-load all images before capture
    const images = element.querySelectorAll('img')
    await Promise.all(Array.from(images).map(img => {
      if (img.complete) return Promise.resolve()
      return new Promise((resolve) => {
        img.onload = resolve
        img.onerror = resolve
      })
    }))

    // Wait a tiny bit for any layout shifts
    await new Promise(resolve => setTimeout(resolve, 100))

    // Capture the canvas with specific options to handle scaling
    const canvas = await html2canvas(element, {
      backgroundColor: "#ffffff",
      scale: 2, 
      useCORS: true,
      logging: true, // Enable logging for debugging
      allowTaint: false,
      // Critical: Reset transform during capture
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.querySelector(".a4-paper-container") as HTMLElement;
        if (clonedElement) {
          clonedElement.style.transform = "none";
          clonedElement.style.margin = "0";
          clonedElement.style.position = "absolute";
          clonedElement.style.top = "0";
          clonedElement.style.left = "0";
          clonedElement.style.width = "210mm";
          clonedElement.style.minHeight = "297mm";
          
          // Ensure all images in the clone are visible
          clonedElement.querySelectorAll('img').forEach(img => {
            img.style.visibility = 'visible';
            img.style.display = 'block';
          });
        }
      }
    })

    const imgData = canvas.toDataURL("image/png")
    
    // Create PDF with A4 dimensions (210mm x 297mm)
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    
    // The canvas represents the entire A4 content
    // We want to fit it to the PDF page width
    const imgWidth = pdfWidth
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    
    // If the content is longer than one A4 page, we need to handle pagination
    let heightLeft = imgHeight
    let position = 0

    // First page
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
    heightLeft -= pdfHeight

    // Additional pages
    while (heightLeft > 0) {
      position = heightLeft - imgHeight // Move the image up
      pdf.addPage()
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pdfHeight
    }
    
    pdf.save(`${fileName}.pdf`)
  } catch (error) {
    console.error("Error generating PDF:", error)
    throw error
  }
}
