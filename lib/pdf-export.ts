export async function generatePDF(documentType: "quotation" | "invoice" | "receipt", formData: any, fileName: string) {
  try {
    // Using a lightweight approach with HTML to canvas to PDF
    const element = document.getElementById("document-preview")
    if (!element) throw new Error("Document preview not found")

    // Dynamic import for html2canvas and jsPDF
    const html2canvas = (await import("html2canvas")).default
    const jsPDF = (await import("jspdf")).jsPDF

    // Convert HTML to canvas
    const canvas = await html2canvas(element, {
      backgroundColor: "#ffffff",
      scale: 2,
    })

    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = pageWidth - 20
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    let heightLeft = imgHeight
    let position = 10

    pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight)
    heightLeft -= pageHeight - 20

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    pdf.save(`${fileName}.pdf`)
  } catch (error) {
    console.error("Error generating PDF:", error)
    throw error
  }
}
