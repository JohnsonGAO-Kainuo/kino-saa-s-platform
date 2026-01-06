import { toast } from "sonner";

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

    // 1. Aggressive Image Pre-processing (Wait for images and convert to Data URLs)
    const images = element.querySelectorAll('img')
    console.log(`Found ${images.length} images in document`);
    
    const imagePromises = Array.from(images).map(async (img) => {
      if (!img.src || img.src.startsWith('data:')) return;

      try {
        // Wait for image to load if not complete
        if (!img.complete) {
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            setTimeout(() => reject(new Error("Image timeout")), 15000);
          });
        }

        // Fetch image as blob to avoid canvas tainting
        const response = await fetch(img.src, { mode: 'cors' });
        const blob = await response.blob();
        
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

        // Set the src to Data URL
        img.src = dataUrl;
      } catch (error) {
        console.warn(`Failed to convert image to Data URL:`, img.src, error);
        // Fallback: If fetch fails, try adding crossOrigin and hope html2canvas can handle it
        img.crossOrigin = "anonymous";
      }
    });

    await Promise.allSettled(imagePromises);
    
    // Give the browser a moment to update the DOM with new src
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 2. Capture the element
    console.log("Capturing canvas...");

    const canvas = await html2canvas(element, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      logging: true,
      allowTaint: false, // Don't allow tainting, we want high quality
      imageTimeout: 15000,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.querySelector(".a4-paper-container") as HTMLElement;
        if (clonedElement) {
          // Reset styles that might break html2canvas
          clonedElement.style.transform = "none";
          clonedElement.style.margin = "0";
          clonedElement.style.padding = "20mm 15mm"; // Standard A4 padding
          clonedElement.style.position = "absolute";
          clonedElement.style.top = "0";
          clonedElement.style.left = "0";
          clonedElement.style.width = "210mm";
          clonedElement.style.minHeight = "297mm";
          clonedElement.style.boxShadow = "none";
          clonedElement.style.borderRadius = "0";
          
          // Aggressively clean ALL styles in the cloned document
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach(el => {
            if (el instanceof HTMLElement) {
              // 1. Force override common properties that html2canvas struggles with
              const styles = window.getComputedStyle(el);
              
              const fixColor = (val: string) => {
                if (!val) return null;
                if (val.includes('lab') || val.includes('oklch')) {
                  return '#000000'; // Default fallback
                }
                return null;
              };

              // Check a wide range of properties
              const colorProps = [
                'color', 'backgroundColor', 'borderColor', 'borderTopColor', 
                'borderRightColor', 'borderBottomColor', 'borderLeftColor',
                'outlineColor', 'fill', 'stroke', 'boxShadow'
              ];

              colorProps.forEach(prop => {
                const currentVal = (styles as any)[prop];
                const fixed = fixColor(currentVal);
                if (fixed) {
                  if (prop === 'backgroundColor') el.style.backgroundColor = 'transparent';
                  else if (prop === 'boxShadow') el.style.boxShadow = 'none';
                  else (el.style as any)[prop] = fixed;
                }
              });

              // 2. Remove any problematic attributes
              if (el.hasAttribute('style')) {
                let styleAttr = el.getAttribute('style') || '';
                if (styleAttr.includes('lab(') || styleAttr.includes('oklch(')) {
                  styleAttr = styleAttr.replace(/lab\([^)]+\)/g, '#000000').replace(/oklch\([^)]+\)/g, '#000000');
                  el.setAttribute('style', styleAttr);
                }
              }
            }
          });

          // 3. NUCLEAR OPTION: Remove all external stylesheets that might contain modern CSS
          // html2canvas will still use the styles already applied to elements
          clonedDoc.querySelectorAll('link[rel="stylesheet"], style').forEach(s => {
            try {
              const content = s.textContent || '';
              if (content.includes('lab(') || content.includes('oklch(')) {
                s.remove();
              }
            } catch (e) {}
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
    return true;
  } catch (error: any) {
    console.error("Critical error during PDF generation:", error)
    toast.error(`Export failed: ${error.message || 'Unknown error'}`);
    throw error
  }
}
