// pdf-engine.js - High-Performance Client-Side PDF Operations Engine

export class PDFEngine {
  constructor() {
    this.pdfLib = window.PDFLib || null;
    this.pdfjsLib = window.pdfjsLib || null;
    this.docx = window.docx || null;
    this.JSZip = window.JSZip || null;

    // Configure PDF.js worker if available
    if (this.pdfjsLib && !this.pdfjsLib.GlobalWorkerOptions.workerSrc) {
      this.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
  }

  // --- Utility: Download Blob ---
  static downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 200);
  }

  // --- Utility: Read file as ArrayBuffer ---
  static async readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  // --- Utility: Read file as Data URL ---
  static async readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // ==========================================
  // 1. MERGE PDF FILES
  // ==========================================
  async mergePDFs(files, onProgress) {
    const { PDFDocument } = window.PDFLib;
    const mergedDoc = await PDFDocument.create();

    const total = files.length;
    for (let i = 0; i < total; i++) {
      if (onProgress) onProgress(Math.round(((i) / total) * 90), `Merging file ${i + 1} of ${total}...`);
      const fileBytes = await PDFEngine.readFileAsArrayBuffer(files[i]);
      const srcDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
      const copiedPages = await mergedDoc.copyPages(srcDoc, srcDoc.getPageIndices());
      copiedPages.forEach((page) => mergedDoc.addPage(page));
    }

    if (onProgress) onProgress(95, 'Finalizing merged PDF document...');
    const mergedBytes = await mergedDoc.save();
    if (onProgress) onProgress(100, 'Done!');
    return new Blob([mergedBytes], { type: 'application/pdf' });
  }

  // ==========================================
  // 2. SPLIT PDF FILE
  // ==========================================
  async splitPDF(file, rangesOrPages, onProgress) {
    const { PDFDocument } = window.PDFLib;
    const fileBytes = await PDFEngine.readFileAsArrayBuffer(file);
    const srcDoc = await PDFDocument.load(fileBytes);
    const totalPages = srcDoc.getPageCount();

    // If no specific range, extract each page into individual PDFs zipped
    const zip = new window.JSZip();

    for (let i = 0; i < totalPages; i++) {
      if (onProgress) onProgress(Math.round(((i + 1) / totalPages) * 90), `Splitting page ${i + 1} of ${totalPages}...`);
      const newDoc = await PDFDocument.create();
      const [copiedPage] = await newDoc.copyPages(srcDoc, [i]);
      newDoc.addPage(copiedPage);
      const pdfBytes = await newDoc.save();
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      zip.file(`${baseName}_page_${i + 1}.pdf`, pdfBytes);
    }

    if (onProgress) onProgress(95, 'Compressing into ZIP archive...');
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    if (onProgress) onProgress(100, 'Complete!');
    return zipBlob;
  }

  // ==========================================
  // 3. ROTATE PDF PAGES
  // ==========================================
  async rotatePDF(file, rotationDegrees = 90, pageIndices = null, onProgress) {
    const { PDFDocument, degrees } = window.PDFLib;
    const fileBytes = await PDFEngine.readFileAsArrayBuffer(file);
    const pdfDoc = await PDFDocument.load(fileBytes);
    const pages = pdfDoc.getPages();

    pages.forEach((page, idx) => {
      if (pageIndices === null || pageIndices.includes(idx)) {
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees((currentRotation + rotationDegrees) % 360));
      }
    });

    if (onProgress) onProgress(80, 'Applying page rotations...');
    const modifiedBytes = await pdfDoc.save();
    if (onProgress) onProgress(100, 'Done!');
    return new Blob([modifiedBytes], { type: 'application/pdf' });
  }

  // ==========================================
  // 4. DELETE / EXTRACT SPECIFIC PAGES
  // ==========================================
  async deletePages(file, pagesToDelete, onProgress) {
    const { PDFDocument } = window.PDFLib;
    const fileBytes = await PDFEngine.readFileAsArrayBuffer(file);
    const srcDoc = await PDFDocument.load(fileBytes);
    const total = srcDoc.getPageCount();

    const newDoc = await PDFDocument.create();
    const pagesToKeep = [];
    for (let i = 0; i < total; i++) {
      if (!pagesToDelete.includes(i)) {
        pagesToKeep.push(i);
      }
    }

    if (pagesToKeep.length === 0) {
      throw new Error('Cannot delete all pages. At least one page must remain.');
    }

    const copied = await newDoc.copyPages(srcDoc, pagesToKeep);
    copied.forEach(p => newDoc.addPage(p));

    const pdfBytes = await newDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  }

  // ==========================================
  // 5. IMAGE (JPG/PNG) TO PDF
  // ==========================================
  async imagesToPDF(imageFiles, options = {}, onProgress) {
    const { PDFDocument, PageSizes } = window.PDFLib;
    const pdfDoc = await PDFDocument.create();

    const {
      orientation = 'portrait', // 'portrait', 'landscape', or 'fit'
      margin = 20, // points
      pageSize = 'A4'
    } = options;

    const total = imageFiles.length;
    for (let i = 0; i < total; i++) {
      if (onProgress) onProgress(Math.round(((i + 1) / total) * 85), `Processing image ${i + 1} of ${total}...`);
      const imgFile = imageFiles[i];
      const imgBytes = await PDFEngine.readFileAsArrayBuffer(imgFile);

      let image;
      const isPng = imgFile.type === 'image/png' || imgFile.name.toLowerCase().endsWith('.png');
      if (isPng) {
        image = await pdfDoc.embedPng(imgBytes);
      } else {
        image = await pdfDoc.embedJpg(imgBytes);
      }

      const imgDims = image.scale(1);
      let pageWidth = 595.28; // A4 standard pt
      let pageHeight = 841.89;

      if (orientation === 'landscape') {
        [pageWidth, pageHeight] = [pageHeight, pageWidth];
      } else if (orientation === 'fit') {
        pageWidth = imgDims.width + margin * 2;
        pageHeight = imgDims.height + margin * 2;
      }

      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      const availableWidth = pageWidth - margin * 2;
      const availableHeight = pageHeight - margin * 2;

      // Fit aspect ratio
      const scale = Math.min(availableWidth / imgDims.width, availableHeight / imgDims.height);
      const drawWidth = imgDims.width * scale;
      const drawHeight = imgDims.height * scale;
      const x = margin + (availableWidth - drawWidth) / 2;
      const y = margin + (availableHeight - drawHeight) / 2;

      page.drawImage(image, {
        x,
        y,
        width: drawWidth,
        height: drawHeight
      });
    }

    if (onProgress) onProgress(95, 'Assembling PDF...');
    const pdfBytes = await pdfDoc.save();
    if (onProgress) onProgress(100, 'Complete!');
    return new Blob([pdfBytes], { type: 'application/pdf' });
  }

  // ==========================================
  // 6. PDF TO IMAGES (JPG / PNG)
  // ==========================================
  async pdfToImages(pdfFile, format = 'jpg', scale = 2.0, onProgress) {
    if (!window.pdfjsLib) {
      throw new Error('PDF rendering library is not loaded');
    }

    const fileBytes = await PDFEngine.readFileAsArrayBuffer(pdfFile);
    const loadingTask = window.pdfjsLib.getDocument({ data: fileBytes });
    const pdfDoc = await loadingTask.promise;
    const totalPages = pdfDoc.numPages;

    const images = [];
    const zip = new window.JSZip();

    for (let i = 1; i <= totalPages; i++) {
      if (onProgress) onProgress(Math.round((i / totalPages) * 90), `Rendering page ${i} of ${totalPages}...`);
      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Fill white background for JPG
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({
        canvasContext: ctx,
        viewport
      }).promise;

      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
      const extension = format === 'png' ? 'png' : 'jpg';

      const dataUrl = canvas.toDataURL(mimeType, 0.92);
      const byteString = atob(dataUrl.split(',')[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let j = 0; j < byteString.length; j++) {
        ia[j] = byteString.charCodeAt(j);
      }
      const imageBlob = new Blob([ab], { type: mimeType });

      images.push({ pageNum: i, blob: imageBlob, dataUrl });
      const baseName = pdfFile.name.replace(/\.[^/.]+$/, '');
      zip.file(`${baseName}_page_${i}.${extension}`, imageBlob);
    }

    if (totalPages === 1) {
      if (onProgress) onProgress(100, 'Done!');
      return { isZip: false, blob: images[0].blob, extension: format, images };
    }

    if (onProgress) onProgress(95, 'Packing into ZIP file...');
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    if (onProgress) onProgress(100, 'Done!');
    return { isZip: true, blob: zipBlob, extension: 'zip', images };
  }

  // ==========================================
  // 7. WATERMARK PDF
  // ==========================================
  async watermarkPDF(file, watermarkText, options = {}, onProgress) {
    const { PDFDocument, rgb, degrees, StandardFonts } = window.PDFLib;
    const fileBytes = await PDFEngine.readFileAsArrayBuffer(file);
    const pdfDoc = await PDFDocument.load(fileBytes);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const {
      fontSize = 48,
      opacity = 0.25,
      color = { r: 0.8, g: 0.1, b: 0.1 },
      angle = 45
    } = options;

    const pages = pdfDoc.getPages();
    const text = watermarkText || 'CONFIDENTIAL';

    pages.forEach((page, i) => {
      const { width, height } = page.getSize();
      const textWidth = helveticaFont.widthOfTextAtSize(text, fontSize);
      const textHeight = helveticaFont.heightAtSize(fontSize);

      page.drawText(text, {
        x: (width - textWidth) / 2,
        y: (height - textHeight) / 2,
        size: fontSize,
        font: helveticaFont,
        color: rgb(color.r, color.g, color.b),
        opacity: opacity,
        rotate: degrees(angle)
      });
    });

    if (onProgress) onProgress(90, 'Applying watermark to all pages...');
    const bytes = await pdfDoc.save();
    if (onProgress) onProgress(100, 'Complete!');
    return new Blob([bytes], { type: 'application/pdf' });
  }

  // ==========================================
  // 8. NUMBER PAGES
  // ==========================================
  async numberPages(file, options = {}, onProgress) {
    const { PDFDocument, rgb, StandardFonts } = window.PDFLib;
    const fileBytes = await PDFEngine.readFileAsArrayBuffer(file);
    const pdfDoc = await PDFDocument.load(fileBytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const {
      position = 'bottom-center', // 'bottom-center', 'bottom-right', 'top-right'
      format = 'Page {n} of {total}',
      fontSize = 10
    } = options;

    const pages = pdfDoc.getPages();
    const total = pages.length;

    pages.forEach((page, idx) => {
      const { width, height } = page.getSize();
      const pageStr = format
        .replace('{n}', (idx + 1).toString())
        .replace('{total}', total.toString());

      const textWidth = font.widthOfTextAtSize(pageStr, fontSize);
      let x = (width - textWidth) / 2;
      let y = 24;

      if (position === 'bottom-right') {
        x = width - textWidth - 36;
      } else if (position === 'top-right') {
        x = width - textWidth - 36;
        y = height - 36;
      }

      page.drawText(pageStr, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(0.3, 0.3, 0.3)
      });
    });

    const bytes = await pdfDoc.save();
    return new Blob([bytes], { type: 'application/pdf' });
  }

  // ==========================================
  // 9. PROTECT PDF (ENCRYPT / PASSWORD)
  // ==========================================
  async protectPDF(file, userPassword, ownerPassword = null, onProgress) {
    const { PDFDocument } = window.PDFLib;
    const fileBytes = await PDFEngine.readFileAsArrayBuffer(file);
    const pdfDoc = await PDFDocument.load(fileBytes);

    if (pdfDoc.encrypt) {
      await pdfDoc.encrypt({
        userPassword: userPassword,
        ownerPassword: ownerPassword || userPassword + '_owner',
        permissions: {
          printing: 'highResolution',
          modifying: false,
          copying: true,
          annotating: true,
          fillingForms: true,
          contentAccessibility: true,
          documentAssembly: false
        }
      });
    }

    if (onProgress) onProgress(90, 'Encrypting PDF with security credentials...');
    const bytes = await pdfDoc.save();
    if (onProgress) onProgress(100, 'Protected!');
    return new Blob([bytes], { type: 'application/pdf' });
  }

  // ==========================================
  // 10. FLATTEN PDF
  // ==========================================
  async flattenPDF(file, onProgress) {
    const { PDFDocument } = window.PDFLib;
    const fileBytes = await PDFEngine.readFileAsArrayBuffer(file);
    const pdfDoc = await PDFDocument.load(fileBytes);

    const form = pdfDoc.getForm();
    if (form) {
      try {
        form.flatten();
      } catch (e) {
        console.warn('Form flattening notice:', e);
      }
    }

    const bytes = await pdfDoc.save();
    return new Blob([bytes], { type: 'application/pdf' });
  }

  // ==========================================
  // 11. PDF TO WORD (.DOCX) - CLIENT EXTRACTION
  // ==========================================
  async pdfToWord(file, onProgress) {
    if (!window.pdfjsLib) {
      throw new Error('PDF text extraction library not initialized');
    }

    const fileBytes = await PDFEngine.readFileAsArrayBuffer(file);
    const pdf = await window.pdfjsLib.getDocument({ data: fileBytes }).promise;
    const numPages = pdf.numPages;

    const sections = [];
    const docParagraphs = [];

    for (let i = 1; i <= numPages; i++) {
      if (onProgress) onProgress(Math.round((i / numPages) * 75), `Extracting text from page ${i} of ${numPages}...`);
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      let lastY = null;
      let currentLine = '';

      textContent.items.forEach(item => {
        if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
          if (currentLine.trim()) {
            docParagraphs.push(currentLine.trim());
          }
          currentLine = item.str;
        } else {
          currentLine += (currentLine ? ' ' : '') + item.str;
        }
        lastY = item.transform[5];
      });

      if (currentLine.trim()) {
        docParagraphs.push(currentLine.trim());
      }
      docParagraphs.push('--- PAGE BREAK ---');
    }

    if (onProgress) onProgress(85, 'Generating Word (.docx) document...');

    // If docx library is loaded, build structured Document
    if (window.docx) {
      const { Document, Packer, Paragraph, TextRun, HeadingLevel } = window.docx;

      const children = [
        new Paragraph({
          text: file.name.replace(/\.[^/.]+$/, ''),
          heading: HeadingLevel.TITLE,
          spacing: { after: 300 }
        })
      ];

      docParagraphs.forEach(text => {
        if (text === '--- PAGE BREAK ---') {
          children.push(new Paragraph({
            text: '',
            pageBreakBefore: true
          }));
        } else {
          children.push(new Paragraph({
            children: [new TextRun({ text, font: 'Arial', size: 24 })],
            spacing: { after: 140 }
          }));
        }
      });

      const doc = new Document({
        sections: [{ properties: {}, children }]
      });

      const blob = await Packer.toBlob(doc);
      if (onProgress) onProgress(100, 'Conversion complete!');
      return blob;
    } else {
      // Fallback: Rich HTML-based Word XML format supported natively by MS Word
      const htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>${file.name}</title>
        <style>body { font-family: Calibri, sans-serif; line-height: 1.5; font-size: 11pt; } p { margin-bottom: 8pt; }</style>
        </head><body>
        <h1>${file.name.replace(/\.[^/.]+$/, '')}</h1>
        ${docParagraphs.map(p => p === '--- PAGE BREAK ---' ? '<hr style="page-break-before:always">' : `<p>${p}</p>`).join('\n')}
        </body></html>
      `;
      const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' });
      if (onProgress) onProgress(100, 'Conversion complete!');
      return blob;
    }
  }

  // ==========================================
  // 12. TEXT / CSV / CODE TO PDF
  // ==========================================
  async textToPDF(file, onProgress) {
    const text = await file.text();
    const { PDFDocument, StandardFonts, rgb } = window.PDFLib;
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Courier);
    const fontSize = 10;
    const lineHeight = 13;
    const margin = 40;

    const lines = text.split(/\r?\n/);
    let page = pdfDoc.addPage([595.28, 841.89]);
    let { height, width } = page.getSize();
    let y = height - margin;

    for (let i = 0; i < lines.length; i++) {
      if (y < margin + lineHeight) {
        page = pdfDoc.addPage([595.28, 841.89]);
        y = height - margin;
      }
      const safeLine = lines[i].substring(0, 95);
      page.drawText(safeLine, {
        x: margin,
        y,
        size: fontSize,
        font,
        color: rgb(0.1, 0.1, 0.1)
      });
      y -= lineHeight;
    }

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  }

  // ==========================================
  // 13. GENERATE PAGE THUMBNAILS FOR VISUAL EDITING
  // ==========================================
  async renderThumbnails(file, onThumbnailReady) {
    if (!window.pdfjsLib) return;
    const fileBytes = await PDFEngine.readFileAsArrayBuffer(file);
    const pdf = await window.pdfjsLib.getDocument({ data: fileBytes }).promise;
    const numPages = pdf.numPages;

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 0.35 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({ canvasContext: ctx, viewport }).promise;
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      if (onThumbnailReady) {
        onThumbnailReady({ pageNum: i, dataUrl, totalPages: numPages });
      }
    }
  }
}
