export async function generatePDF(documentType: string, formData: any, fileName: string) {
  try {
    // Try to find the A4 paper container first, then fall back to other selectors
    const element = document.querySelector(".a4-paper-container") || 
                    document.getElementById("document-preview-card") || 
                    document.getElementById("document-preview")
    if (!element) throw new Error("Document preview not found")

    const targetElement = element
    
    const html2canvas = (await import("html2canvas")).default
    const { jsPDF } = await import("jspdf")

    // Optimization: Pre-load all images before capture
    const images = targetElement.querySelectorAll('img')
    await Promise.all(Array.from(images).map(img => {
      if (img.complete) return Promise.resolve()
      return new Promise((resolve) => {
        img.onload = resolve
        img.onerror = resolve
      })
    }))

    const canvas = await html2canvas(targetElement as HTMLElement, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: false, // Set to false when useCORS is true
      windowWidth: targetElement.scrollWidth,
      windowHeight: targetElement.scrollHeight
    })

    const imgData = canvas.toDataURL("image/png")
    
    // Create PDF with A4 dimensions
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    
    // Calculate aspect ratio to fit width
    const imgWidth = 210 // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    
    // Add first page
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
    
    // Handle multi-page if content is longer than A4
    let heightLeft = imgHeight - pdfHeight
    let position = -pdfHeight

    while (heightLeft > 0) {
      pdf.addPage()
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pdfHeight
      position -= pdfHeight
    }
    
    pdf.save(`${fileName}.pdf`)
  } catch (error) {
    console.error("Error generating PDF:", error)
    throw error
  }
}
