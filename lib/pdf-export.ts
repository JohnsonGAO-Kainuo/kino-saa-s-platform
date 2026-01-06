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

    // SUPER NUCLEAR FIX: Override getComputedStyle to intercept and fix lab/oklch colors
    // html2canvas calls getComputedStyle on every element. If it receives a lab() string, it crashes.
    const originalGetComputedStyle = window.getComputedStyle;
    (window as any).getComputedStyle = function(el: Element, pseudoElt?: string | null) {
      const style = originalGetComputedStyle(el, pseudoElt);
      
      // Use a Proxy with binding to avoid "Illegal invocation"
      return new Proxy(style, {
        get(target, prop) {
          const value = Reflect.get(target, prop);
          // If it's a function (like getPropertyValue), we MUST bind it to the original target
          if (typeof value === 'function') {
            return value.bind(target);
          }
          // If it's a string containing lab/oklch, replace it
          if (typeof value === 'string' && (value.includes('lab(') || value.includes('oklch('))) {
            if (prop === 'color') return 'rgb(26, 31, 54)';
            if (prop === 'backgroundColor') return 'rgba(0, 0, 0, 0)';
            if (prop.includes('Color')) return 'rgb(229, 231, 235)';
            if (prop === 'boxShadow') return 'none';
            return 'rgb(0, 0, 0)';
          }
          return value;
        }
      }) as any;
    };

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        logging: true,
        allowTaint: false,
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector(".a4-paper-container") as HTMLElement;
          if (clonedElement) {
            clonedElement.style.transform = "none";
            clonedElement.style.margin = "0";
            clonedElement.style.padding = "20mm 15mm";
            clonedElement.style.position = "absolute";
            clonedElement.style.top = "0";
            clonedElement.style.left = "0";
            clonedElement.style.width = "210mm";
            clonedElement.style.minHeight = "297mm";
            clonedElement.style.boxShadow = "none";
            clonedElement.style.borderRadius = "0";
          }
        }
      });

      // Restore original getComputedStyle
      window.getComputedStyle = originalGetComputedStyle;
      
      console.log("Canvas captured successfully");
      const imgData = canvas.toDataURL("image/png")
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const imgWidth = pdfWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
      pdf.save(`${fileName}.pdf`)
      return true;

    } catch (err) {
      // Make sure to restore even on error
      window.getComputedStyle = originalGetComputedStyle;
      throw err;
    }
  } catch (error: any) {
    console.error("Critical error during PDF generation:", error)
    toast.error(`Export failed: ${error.message || 'Unknown error'}`);
    throw error
  }
}
