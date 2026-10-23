// app.js - Main Application Orchestrator

import { TOOL_CATEGORIES, PDF_TOOLS } from './tools-data.js';
import { PDFEngine } from './pdf-engine.js';

class PDFMasterApp {
  constructor() {
    this.engine = new PDFEngine();
    this.activeCategory = 'all';
    this.searchQuery = '';
    this.currentTool = null;
    this.selectedFiles = [];
    this.renderedThumbnails = [];
    this.scannerStream = null;
    this.scannedImages = [];

    // Signature Pad State
    this.isDrawing = false;
    this.signatureData = null;

    this.initDOM();
    this.initEvents();
    this.renderCategoryPills();
    this.renderToolsGrid();
    this.checkBackendStatus();
    this.initPWA();
    
    // Feather icons replacement
    if (window.feather) window.feather.replace();
  }

  initDOM() {
    this.dom = {
      catalogView: document.getElementById('catalogView'),
      studioView: document.getElementById('studioView'),
      toolsGrid: document.getElementById('toolsGrid'),
      categoryPills: document.getElementById('categoryPills'),
      toolSearchInput: document.getElementById('toolSearchInput'),
      themeToggleBtn: document.getElementById('themeToggleBtn'),
      themeIcon: document.getElementById('themeIcon'),
      installAppBtn: document.getElementById('installAppBtn'),
      logoBtn: document.getElementById('logoBtn'),
      backToCatalogBtn: document.getElementById('backToCatalogBtn'),
      resetStudioBtn: document.getElementById('resetStudioBtn'),

      // Studio Header
      studioToolIcon: document.getElementById('studioToolIcon'),
      studioToolTitle: document.getElementById('studioToolTitle'),
      studioToolDesc: document.getElementById('studioToolDesc'),

      // Dropzone & Workspace
      dropzone: document.getElementById('dropzone'),
      fileInput: document.getElementById('fileInput'),
      browseFilesBtn: document.getElementById('browseFilesBtn'),
      dropzoneFileTypes: document.getElementById('dropzoneFileTypes'),
      workspaceGrid: document.getElementById('workspaceGrid'),
      thumbnailGrid: document.getElementById('thumbnailGrid'),
      pageCountBadge: document.getElementById('pageCountBadge'),
      dynamicToolOptions: document.getElementById('dynamicToolOptions'),
      processActionBtn: document.getElementById('processActionBtn'),
      processActionBtnText: document.getElementById('processActionBtnText'),
      addMoreFilesBtn: document.getElementById('addMoreFilesBtn'),

      // Scanner
      quickScanBtn: document.getElementById('quickScanBtn'),
      scannerOverlay: document.getElementById('scannerOverlay'),
      scannerVideo: document.getElementById('scannerVideo'),
      shutterBtn: document.getElementById('shutterBtn'),
      closeScannerBtn: document.getElementById('closeScannerBtn'),
      finishScanBtn: document.getElementById('finishScanBtn'),
      scannerPageCount: document.getElementById('scannerPageCount'),

      // Signature Modal
      signModalOverlay: document.getElementById('signModalOverlay'),
      signatureCanvas: document.getElementById('signatureCanvas'),
      clearSignatureBtn: document.getElementById('clearSignatureBtn'),
      saveSignatureBtn: document.getElementById('saveSignatureBtn'),

      // Progress Modal & Toast
      progressModal: document.getElementById('progressModal'),
      progressModalTitle: document.getElementById('progressModalTitle'),
      progressBarFill: document.getElementById('progressBarFill'),
      progressStatusText: document.getElementById('progressStatusText'),
      toastContainer: document.getElementById('toastContainer'),
      backendStatusBtn: document.getElementById('backendStatusBtn'),
      backendStatusText: document.getElementById('backendStatusText')
    };
  }

  initEvents() {
    // Theme toggle
    this.dom.themeToggleBtn.addEventListener('click', () => this.toggleTheme());

    // Navigation back
    this.dom.logoBtn.addEventListener('click', () => this.showCatalog());
    this.dom.backToCatalogBtn.addEventListener('click', () => this.showCatalog());
    this.dom.resetStudioBtn.addEventListener('click', () => this.resetStudio());

    // Search
    this.dom.toolSearchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this.renderToolsGrid();
    });

    // File Input & Dropzone
    this.dom.browseFilesBtn.addEventListener('click', () => this.dom.fileInput.click());
    this.dom.fileInput.addEventListener('change', (e) => this.handleFiles(Array.from(e.target.files)));

    this.dom.dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.dom.dropzone.classList.add('dragover');
    });

    this.dom.dropzone.addEventListener('dragleave', () => {
      this.dom.dropzone.classList.remove('dragover');
    });

    this.dom.dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.dom.dropzone.classList.remove('dragover');
      if (e.dataTransfer.files.length) {
        this.handleFiles(Array.from(e.dataTransfer.files));
      }
    });

    this.dom.addMoreFilesBtn.addEventListener('click', () => this.dom.fileInput.click());

    // Action button
    this.dom.processActionBtn.addEventListener('click', () => this.executeCurrentTool());

    // Scanner
    this.dom.quickScanBtn.addEventListener('click', () => this.startScanner());
    this.dom.closeScannerBtn.addEventListener('click', () => this.stopScanner());
    this.dom.shutterBtn.addEventListener('click', () => this.snapScannerPhoto());
    this.dom.finishScanBtn.addEventListener('click', () => this.finishScannerSession());

    // Signature Pad
    this.setupSignatureCanvas();

    // Backend test
    this.dom.backendStatusBtn.addEventListener('click', () => {
      this.checkBackendStatus(true);
    });
  }

  // --- Theme Switching ---
  toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    this.dom.themeIcon.setAttribute('data-feather', next === 'dark' ? 'moon' : 'sun');
    if (window.feather) window.feather.replace();
    this.showToast(`Switched to ${next} theme`, 'info');
  }

  // --- Category Pills ---
  renderCategoryPills() {
    this.dom.categoryPills.innerHTML = '';
    TOOL_CATEGORIES.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = `category-tab ${cat.id === this.activeCategory ? 'active' : ''}`;
      btn.innerHTML = `<i data-feather="${cat.icon}"></i><span>${cat.name}</span>`;
      btn.addEventListener('click', () => {
        this.activeCategory = cat.id;
        this.renderCategoryPills();
        this.renderToolsGrid();
      });
      this.dom.categoryPills.appendChild(btn);
    });
    if (window.feather) window.feather.replace();
  }

  // --- Tool Grid ---
  renderToolsGrid() {
    this.dom.toolsGrid.innerHTML = '';

    const filtered = PDF_TOOLS.filter(tool => {
      // Category filter
      let matchesCategory = false;
      if (this.activeCategory === 'all') matchesCategory = true;
      else if (this.activeCategory === 'popular') matchesCategory = !!tool.popular;
      else matchesCategory = tool.category === this.activeCategory;

      // Search filter
      const matchesSearch = !this.searchQuery ||
        tool.title.toLowerCase().includes(this.searchQuery) ||
        tool.description.toLowerCase().includes(this.searchQuery);

      return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
      this.dom.toolsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-secondary);">
          <i data-feather="inbox" style="width: 48px; height: 48px; margin-bottom: 1rem;"></i>
          <p>No tools matched your search query. Try typing 'Word', 'Image', 'Merge', or 'Sign'.</p>
        </div>
      `;
      if (window.feather) window.feather.replace();
      return;
    }

    filtered.forEach(tool => {
      const card = document.createElement('div');
      card.className = 'tool-card';
      card.innerHTML = `
        <div class="tool-card-header">
          <div class="tool-icon-box" style="background: ${tool.iconColor}">
            <i data-feather="${tool.icon}"></i>
          </div>
          ${tool.badge ? `<span class="tool-badge">${tool.badge}</span>` : ''}
        </div>
        <h3 class="tool-title">${tool.title}</h3>
        <p class="tool-desc">${tool.description}</p>
        <div class="tool-footer">
          <span>${tool.mode === 'hybrid' ? 'Smart Converter' : 'Client-Side'}</span>
          <span class="tool-action-arrow">
            Open <i data-feather="chevron-right" style="width: 14px; height: 14px; margin-left: 2px;"></i>
          </span>
        </div>
      `;

      card.addEventListener('click', () => this.openToolStudio(tool));
      this.dom.toolsGrid.appendChild(card);
    });

    if (window.feather) window.feather.replace();
  }

  // --- Open Specific Tool Studio ---
  openToolStudio(tool) {
    this.currentTool = tool;
    this.selectedFiles = [];
    this.renderedThumbnails = [];

    // Special case: Camera Scanner
    if (tool.id === 'pdf-scanner') {
      this.startScanner();
      return;
    }

    // Special case: Sign PDF
    if (tool.id === 'sign-pdf') {
      // Allow uploading PDF first or opening sign pad
    }

    // Update Studio Header
    this.dom.studioToolTitle.textContent = tool.title;
    this.dom.studioToolDesc.textContent = tool.description;
    this.dom.studioToolIcon.style.background = tool.iconColor;
    this.dom.studioToolIcon.innerHTML = `<i data-feather="${tool.icon}"></i>`;
    
    // Configure File Input
    this.dom.fileInput.accept = tool.accept || '*/*';
    this.dom.fileInput.multiple = !!tool.multiFile || tool.id === 'merge-pdf' || tool.id === 'jpg-to-pdf';
    this.dom.dropzoneFileTypes.textContent = `Supported formats: ${tool.accept || 'PDF, Images, Documents'}`;
    this.dom.processActionBtnText.textContent = `Process with ${tool.title}`;

    // Switch view
    this.dom.catalogView.classList.add('hidden');
    this.dom.studioView.classList.add('active');
    this.resetStudio();

    this.renderToolOptions(tool);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.feather) window.feather.replace();
  }

  showCatalog() {
    this.dom.studioView.classList.remove('active');
    this.dom.catalogView.classList.remove('hidden');
    this.currentTool = null;
    this.selectedFiles = [];
    if (window.feather) window.feather.replace();
  }

  resetStudio() {
    this.selectedFiles = [];
    this.renderedThumbnails = [];
    this.dom.fileInput.value = '';
    this.dom.dropzone.style.display = 'block';
    this.dom.workspaceGrid.style.display = 'none';
    this.dom.thumbnailGrid.innerHTML = '';
    this.dom.pageCountBadge.textContent = '0 Pages';
  }

  // --- Dynamic Options Panel based on tool ---
  renderToolOptions(tool) {
    const container = this.dom.dynamicToolOptions;
    container.innerHTML = '';

    if (tool.id === 'watermark-pdf') {
      container.innerHTML = `
        <div class="option-group">
          <label class="option-label">Watermark Text</label>
          <input type="text" id="watermarkText" class="option-input" value="CONFIDENTIAL" placeholder="e.g. DRAFT, COPY">
        </div>
        <div class="option-group">
          <label class="option-label">Opacity</label>
          <input type="range" id="watermarkOpacity" min="0.05" max="0.9" step="0.05" value="0.25">
        </div>
        <div class="option-group">
          <label class="option-label">Font Size</label>
          <input type="number" id="watermarkFontSize" class="option-input" value="48" min="14" max="120">
        </div>
        <div class="option-group">
          <label class="option-label">Rotation Angle</label>
          <select id="watermarkAngle" class="option-select">
            <option value="45">45° Diagonal</option>
            <option value="0">0° Horizontal</option>
            <option value="90">90° Vertical</option>
          </select>
        </div>
      `;
    } else if (tool.id === 'protect-pdf') {
      container.innerHTML = `
        <div class="option-group">
          <label class="option-label">Set Document Password</label>
          <input type="password" id="protectPassword" class="option-input" placeholder="Enter strong password">
        </div>
        <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem;">
          Protected using client-side AES-256 standard encryption.
        </p>
      `;
    } else if (tool.id === 'rotate-pdf') {
      container.innerHTML = `
        <div class="option-group">
          <label class="option-label">Rotation Angle</label>
          <select id="rotateAngle" class="option-select">
            <option value="90">90° Clockwise</option>
            <option value="180">180° Flip Upside-Down</option>
            <option value="270">90° Counter-Clockwise</option>
          </select>
        </div>
        <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
          <button class="btn-pill" id="quickRotateAllBtn" style="flex: 1; justify-content: center;">
            <i data-feather="rotate-cw"></i> Rotate All
          </button>
        </div>
      `;
      setTimeout(() => {
        document.getElementById('quickRotateAllBtn')?.addEventListener('click', () => {
          this.quickRotateThumbnails();
        });
        if (window.feather) window.feather.replace();
      }, 50);
    } else if (tool.id === 'jpg-to-pdf' || tool.id === 'png-to-pdf') {
      container.innerHTML = `
        <div class="option-group">
          <label class="option-label">Page Orientation</label>
          <select id="imgPdfOrientation" class="option-select">
            <option value="portrait">Portrait (A4)</option>
            <option value="landscape">Landscape</option>
            <option value="fit">Fit to Image Dimensions</option>
          </select>
        </div>
        <div class="option-group">
          <label class="option-label">Margin</label>
          <select id="imgPdfMargin" class="option-select">
            <option value="0">No Margin</option>
            <option value="20" selected>Small Margin (20pt)</option>
            <option value="40">Large Margin (40pt)</option>
          </select>
        </div>
      `;
    } else if (tool.id === 'pdf-to-jpg' || tool.id === 'pdf-to-png') {
      container.innerHTML = `
        <div class="option-group">
          <label class="option-label">Resolution / Quality</label>
          <select id="renderDpi" class="option-select">
            <option value="2.0" selected>High Quality (150 DPI)</option>
            <option value="3.0">Ultra High Quality (300 DPI)</option>
            <option value="1.2">Compact (Standard Web)</option>
          </select>
        </div>
        <div class="option-group">
          <label class="option-label">Output Archive</label>
          <p style="font-size: 0.8rem; color: var(--text-secondary);">
            Multi-page documents will be packaged automatically into a clean .ZIP file.
          </p>
        </div>
      `;
    } else if (tool.id === 'number-pages') {
      container.innerHTML = `
        <div class="option-group">
          <label class="option-label">Position</label>
          <select id="pageNumberPos" class="option-select">
            <option value="bottom-center" selected>Bottom Center</option>
            <option value="bottom-right">Bottom Right</option>
            <option value="top-right">Top Right</option>
          </select>
        </div>
        <div class="option-group">
          <label class="option-label">Numbering Format</label>
          <input type="text" id="pageNumberFormat" class="option-input" value="Page {n} of {total}">
        </div>
      `;
    } else if (tool.id === 'sign-pdf') {
      container.innerHTML = `
        <div class="option-group">
          <label class="option-label">Electronic Signature</label>
          <button class="btn-pill btn-primary" id="openSignaturePadBtn" style="justify-content: center;">
            <i data-feather="feather"></i> Draw / Add Signature
          </button>
        </div>
        <div id="signaturePreviewBox" style="display: none; padding: 0.75rem; border: 1px dashed var(--border-color); border-radius: var(--radius-sm); text-align: center; margin-top: 0.5rem;">
          <img id="signatureImgPreview" style="max-height: 50px; object-fit: contain;">
        </div>
      `;
      setTimeout(() => {
        document.getElementById('openSignaturePadBtn')?.addEventListener('click', () => {
          this.dom.signModalOverlay.classList.add('active');
        });
        if (window.feather) window.feather.replace();
      }, 50);
    } else {
      // General tools
      container.innerHTML = `
        <div class="option-group">
          <label class="option-label">Mode</label>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">
            Fast, high-fidelity browser execution. No cloud server needed.
          </p>
        </div>
      `;
    }
  }

  // --- Handle Files Loaded into Studio ---
  async handleFiles(files) {
    if (!files || files.length === 0) return;
    this.selectedFiles = files;

    this.dom.dropzone.style.display = 'none';
    this.dom.workspaceGrid.style.display = 'grid';
    this.dom.thumbnailGrid.innerHTML = '';

    const firstFile = files[0];

    // If PDF, render visual thumbnails for visual reorder/page manipulation
    if (firstFile.type === 'application/pdf' || firstFile.name.toLowerCase().endsWith('.pdf')) {
      this.dom.pageCountBadge.textContent = 'Rendering preview...';
      try {
        await this.engine.renderThumbnails(firstFile, (thumb) => {
          this.renderedThumbnails.push(thumb);
          this.appendThumbnailItem(thumb);
          this.dom.pageCountBadge.textContent = `${this.renderedThumbnails.length} Pages`;
        });
      } catch (err) {
        console.warn('Preview render notice:', err);
        this.dom.pageCountBadge.textContent = `${files.length} File(s)`;
        this.renderGenericFileThumbnails(files);
      }
    } else {
      // Images or documents
      this.dom.pageCountBadge.textContent = `${files.length} File(s)`;
      this.renderGenericFileThumbnails(files);
    }
  }

  appendThumbnailItem(thumb) {
    const item = document.createElement('div');
    item.className = 'thumbnail-item';
    item.dataset.pageNum = thumb.pageNum;
    item.innerHTML = `
      <img src="${thumb.dataUrl}" class="thumbnail-image" alt="Page ${thumb.pageNum}">
      <span class="thumbnail-label">Page ${thumb.pageNum}</span>
      <button class="thumbnail-delete-btn" title="Delete page">&times;</button>
    `;

    // Click to toggle deletion or rotation
    item.querySelector('.thumbnail-delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      item.classList.toggle('to-delete');
      const isDel = item.classList.contains('to-delete');
      this.showToast(isDel ? `Page ${thumb.pageNum} marked for deletion` : `Page ${thumb.pageNum} restored`, 'info');
    });

    item.addEventListener('click', () => {
      item.classList.toggle('selected');
    });

    this.dom.thumbnailGrid.appendChild(item);
  }

  renderGenericFileThumbnails(files) {
    this.dom.thumbnailGrid.innerHTML = '';
    files.forEach((file, idx) => {
      const item = document.createElement('div');
      item.className = 'thumbnail-item';
      
      let previewSrc = '';
      if (file.type.startsWith('image/')) {
        previewSrc = URL.createObjectURL(file);
      }

      item.innerHTML = `
        <div style="height: 120px; display: flex; align-items: center; justify-content: center; background: #ffffff; border-radius: 4px; margin-bottom: 0.4rem; overflow: hidden;">
          ${previewSrc ? `<img src="${previewSrc}" style="max-height: 100%; max-width: 100%; object-fit: contain;">` : `<i data-feather="file" style="color: #6366F1; width: 40px; height: 40px;"></i>`}
        </div>
        <span class="thumbnail-label" style="word-break: break-all;">${file.name}</span>
      `;
      this.dom.thumbnailGrid.appendChild(item);
    });
    if (window.feather) window.feather.replace();
  }

  quickRotateThumbnails() {
    const items = this.dom.thumbnailGrid.querySelectorAll('.thumbnail-image');
    items.forEach(img => {
      const currentRot = parseInt(img.dataset.rotation || '0', 10);
      const nextRot = (currentRot + 90) % 360;
      img.dataset.rotation = nextRot;
      img.style.transform = `rotate(${nextRot}deg)`;
    });
    this.showToast('Preview rotated 90°', 'info');
  }

  // --- Execute Current Tool ---
  async executeCurrentTool() {
    if (!this.currentTool || this.selectedFiles.length === 0) {
      this.showToast('Please select file(s) to process', 'error');
      return;
    }

    const tool = this.currentTool;
    this.showProgress(tool.title);

    try {
      let resultBlob = null;
      let outputFilename = 'output.pdf';
      const firstFile = this.selectedFiles[0];
      const baseName = firstFile.name.replace(/\.[^/.]+$/, '');

      // 1. MERGE PDF
      if (tool.id === 'merge-pdf') {
        if (this.selectedFiles.length < 2) {
          throw new Error('Please select at least 2 PDF files to merge.');
        }
        resultBlob = await this.engine.mergePDFs(this.selectedFiles, (p, msg) => this.updateProgress(p, msg));
        outputFilename = `merged_${Date.now()}.pdf`;
      }

      // 2. SPLIT PDF
      else if (tool.id === 'split-pdf') {
        resultBlob = await this.engine.splitPDF(firstFile, null, (p, msg) => this.updateProgress(p, msg));
        outputFilename = `${baseName}_split_pages.zip`;
      }

      // 3. ROTATE PDF
      else if (tool.id === 'rotate-pdf') {
        const angle = parseInt(document.getElementById('rotateAngle')?.value || '90', 10);
        resultBlob = await this.engine.rotatePDF(firstFile, angle, null, (p, msg) => this.updateProgress(p, msg));
        outputFilename = `${baseName}_rotated.pdf`;
      }

      // 4. DELETE PAGES
      else if (tool.id === 'delete-pdf-pages') {
        const toDelete = [];
        this.dom.thumbnailGrid.querySelectorAll('.thumbnail-item.to-delete').forEach(el => {
          toDelete.push(parseInt(el.dataset.pageNum, 10) - 1);
        });
        if (toDelete.length === 0) {
          throw new Error('Please click on at least one page thumbnail to mark it for deletion.');
        }
        resultBlob = await this.engine.deletePages(firstFile, toDelete, (p, msg) => this.updateProgress(p, msg));
        outputFilename = `${baseName}_modified.pdf`;
      }

      // 5. EXTRACT PAGES
      else if (tool.id === 'extract-pdf-pages') {
        const selected = [];
        this.dom.thumbnailGrid.querySelectorAll('.thumbnail-item.selected').forEach(el => {
          selected.push(parseInt(el.dataset.pageNum, 10) - 1);
        });
        const total = this.renderedThumbnails.length;
        const toDelete = [];
        for (let i = 0; i < total; i++) {
          if (!selected.includes(i)) toDelete.push(i);
        }
        if (selected.length === 0) {
          throw new Error('Please click on page thumbnails to select pages for extraction.');
        }
        resultBlob = await this.engine.deletePages(firstFile, toDelete, (p, msg) => this.updateProgress(p, msg));
        outputFilename = `${baseName}_extracted.pdf`;
      }

      // 6. JPG / PNG TO PDF
      else if (tool.id === 'jpg-to-pdf' || tool.id === 'png-to-pdf') {
        const orientation = document.getElementById('imgPdfOrientation')?.value || 'portrait';
        const margin = parseInt(document.getElementById('imgPdfMargin')?.value || '20', 10);
        resultBlob = await this.engine.imagesToPDF(this.selectedFiles, { orientation, margin }, (p, msg) => this.updateProgress(p, msg));
        outputFilename = `${baseName}_converted.pdf`;
      }

      // 7. PDF TO JPG / PNG
      else if (tool.id === 'pdf-to-jpg' || tool.id === 'pdf-to-png') {
        const format = tool.id === 'pdf-to-png' ? 'png' : 'jpg';
        const scale = parseFloat(document.getElementById('renderDpi')?.value || '2.0');
        const res = await this.engine.pdfToImages(firstFile, format, scale, (p, msg) => this.updateProgress(p, msg));
        resultBlob = res.blob;
        outputFilename = res.isZip ? `${baseName}_images.zip` : `${baseName}_page_1.${res.extension}`;
      }

      // 8. WATERMARK PDF
      else if (tool.id === 'watermark-pdf') {
        const text = document.getElementById('watermarkText')?.value || 'CONFIDENTIAL';
        const opacity = parseFloat(document.getElementById('watermarkOpacity')?.value || '0.25');
        const fontSize = parseInt(document.getElementById('watermarkFontSize')?.value || '48', 10);
        const angle = parseInt(document.getElementById('watermarkAngle')?.value || '45', 10);
        resultBlob = await this.engine.watermarkPDF(firstFile, text, { opacity, fontSize, angle }, (p, msg) => this.updateProgress(p, msg));
        outputFilename = `${baseName}_watermarked.pdf`;
      }

      // 9. NUMBER PAGES
      else if (tool.id === 'number-pages') {
        const position = document.getElementById('pageNumberPos')?.value || 'bottom-center';
        const format = document.getElementById('pageNumberFormat')?.value || 'Page {n} of {total}';
        resultBlob = await this.engine.numberPages(firstFile, { position, format }, (p, msg) => this.updateProgress(p, msg));
        outputFilename = `${baseName}_numbered.pdf`;
      }

      // 10. PROTECT PDF
      else if (tool.id === 'protect-pdf') {
        const password = document.getElementById('protectPassword')?.value;
        if (!password) throw new Error('Please enter a password to protect the PDF.');
        resultBlob = await this.engine.protectPDF(firstFile, password, null, (p, msg) => this.updateProgress(p, msg));
        outputFilename = `${baseName}_protected.pdf`;
      }

      // 11. FLATTEN PDF
      else if (tool.id === 'flatten-pdf') {
        resultBlob = await this.engine.flattenPDF(firstFile, (p, msg) => this.updateProgress(p, msg));
        outputFilename = `${baseName}_flattened.pdf`;
      }

      // 12. PDF TO WORD (.DOCX)
      else if (tool.id === 'pdf-to-word') {
        resultBlob = await this.engine.pdfToWord(firstFile, (p, msg) => this.updateProgress(p, msg));
        outputFilename = `${baseName}.docx`;
      }

      // 13. TXT / CSV / CODE TO PDF
      else if (tool.id === 'txt-to-pdf' || tool.id === 'csv-to-pdf') {
        resultBlob = await this.engine.textToPDF(firstFile, (p, msg) => this.updateProgress(p, msg));
        outputFilename = `${baseName}.pdf`;
      }

      // 14. DEFAULT / HYBRID / FALLBACK
      else {
        // Test if backend is running for Office conversions
        const backendRes = await this.callBackendConversion(tool.id, firstFile);
        if (backendRes) {
          resultBlob = backendRes.blob;
          outputFilename = backendRes.filename;
        } else {
          // Client fallback
          resultBlob = await this.engine.pdfToWord(firstFile, (p, msg) => this.updateProgress(p, msg));
          outputFilename = `${baseName}_processed.doc`;
        }
      }

      // Download
      this.hideProgress();
      PDFEngine.downloadBlob(resultBlob, outputFilename);
      this.showToast(`Success! Downloaded: ${outputFilename}`, 'success');

    } catch (err) {
      console.error(err);
      this.hideProgress();
      this.showToast(err.message || 'Error processing document', 'error');
    }
  }

  // --- Backend Connection Bridge ---
  async checkBackendStatus(showToastMsg = false) {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/health', { method: 'GET', signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        this.dom.backendStatusText.textContent = 'Backend Active';
        this.dom.backendStatusBtn.style.borderColor = 'var(--accent-emerald)';
        if (showToastMsg) this.showToast('Python conversion backend is connected and ready!', 'success');
        return true;
      }
    } catch (e) {
      this.dom.backendStatusText.textContent = 'Browser Engine';
      if (showToastMsg) this.showToast('Using high-performance browser engine (100% private)', 'info');
      return false;
    }
  }

  async callBackendConversion(toolId, file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tool_id', toolId);

      const res = await fetch(`http://127.0.0.1:8000/api/convert/${toolId}`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const blob = await res.blob();
        return { blob, filename: `${file.name.replace(/\.[^/.]+$/, '')}_converted.docx` };
      }
    } catch (e) {
      console.warn('Backend call fallback to client:', e);
    }
    return null;
  }

  // --- Mobile / Webcam Document Scanner ---
  async startScanner() {
    try {
      this.scannedImages = [];
      this.dom.scannerPageCount.textContent = '0 snaps';
      this.dom.scannerOverlay.classList.add('active');

      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      this.scannerStream = await navigator.mediaDevices.getUserMedia(constraints);
      this.dom.scannerVideo.srcObject = this.scannerStream;
    } catch (err) {
      console.error(err);
      this.stopScanner();
      this.showToast('Camera access denied or unavailable', 'error');
    }
  }

  snapScannerPhoto() {
    if (!this.scannerStream) return;
    const video = this.dom.scannerVideo;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');

    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Apply document contrast enhancement filter
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      // Gentle contrast boost
      d[i] = Math.min(255, d[i] * 1.05);
      d[i+1] = Math.min(255, d[i+1] * 1.05);
      d[i+2] = Math.min(255, d[i+2] * 1.05);
    }
    ctx.putImageData(imgData, 0, 0);

    canvas.toBlob((blob) => {
      const file = new File([blob], `scan_page_${this.scannedImages.length + 1}.jpg`, { type: 'image/jpeg' });
      this.scannedImages.push(file);
      this.dom.scannerPageCount.textContent = `${this.scannedImages.length} snap(s)`;
      this.showToast(`Captured page ${this.scannedImages.length}!`, 'success');
    }, 'image/jpeg', 0.92);
  }

  async finishScannerSession() {
    if (this.scannedImages.length === 0) {
      this.showToast('No pages snapped yet!', 'error');
      return;
    }
    this.stopScanner();
    const jpgTool = PDF_TOOLS.find(t => t.id === 'jpg-to-pdf');
    this.openToolStudio(jpgTool);
    this.handleFiles(this.scannedImages);
  }

  stopScanner() {
    if (this.scannerStream) {
      this.scannerStream.getTracks().forEach(track => track.stop());
      this.scannerStream = null;
    }
    this.dom.scannerOverlay.classList.remove('active');
  }

  // --- Electronic Signature Pad Setup ---
  setupSignatureCanvas() {
    const canvas = this.dom.signatureCanvas;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) * (canvas.width / rect.width),
        y: (clientY - rect.top) * (canvas.height / rect.height)
      };
    };

    const startDraw = (e) => {
      this.isDrawing = true;
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    };

    const draw = (e) => {
      if (!this.isDrawing) return;
      e.preventDefault();
      const pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    };

    const stopDraw = () => {
      this.isDrawing = false;
    };

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', stopDraw);

    canvas.addEventListener('touchstart', startDraw, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    window.addEventListener('touchend', stopDraw);

    this.dom.clearSignatureBtn.addEventListener('click', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.signatureData = null;
    });

    this.dom.saveSignatureBtn.addEventListener('click', () => {
      this.signatureData = canvas.toDataURL('image/png');
      this.dom.signModalOverlay.classList.remove('active');
      const preview = document.getElementById('signatureImgPreview');
      const box = document.getElementById('signaturePreviewBox');
      if (preview && box) {
        preview.src = this.signatureData;
        box.style.display = 'block';
      }
      this.showToast('Signature saved and ready to stamp!', 'success');
    });

    this.dom.signModalOverlay.addEventListener('click', (e) => {
      if (e.target === this.dom.signModalOverlay) {
        this.dom.signModalOverlay.classList.remove('active');
      }
    });
  }

  // --- Progressive Web App (PWA) Offline & Install Support ---
  initPWA() {
    // 1. Register Service Worker for offline performance
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').then((reg) => {
          console.log('PDF Master Service Worker registered on scope:', reg.scope);
        }).catch((err) => {
          console.warn('Service Worker registration skipped:', err);
        });
      });
    }

    // 2. Install App Prompt handler (Chrome / Edge / Android)
    let deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      if (this.dom.installAppBtn) {
        this.dom.installAppBtn.style.display = 'inline-flex';
      }
    });

    if (this.dom.installAppBtn) {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

      if (isIOS && !isStandalone) {
        this.dom.installAppBtn.style.display = 'inline-flex';
      }

      this.dom.installAppBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          if (outcome === 'accepted') {
            this.showToast('App installed to your device successfully!', 'success');
            this.dom.installAppBtn.style.display = 'none';
          }
          deferredPrompt = null;
        } else if (isIOS) {
          alert("To install PDF Master on your iPhone/iPad:\n1. Tap the Share button in Safari.\n2. Tap 'Add to Home Screen'.");
        } else {
          this.showToast('Click your browser menu (⋮) and select "Install App" or "Add to Home Screen"', 'info');
        }
      });
    }
  }

  // --- Modal Progress UI ---
  showProgress(title) {
    this.dom.progressModalTitle.textContent = title || 'Processing Document...';
    this.dom.progressBarFill.style.width = '0%';
    this.dom.progressStatusText.textContent = 'Initializing...';
    this.dom.progressModal.classList.add('active');
  }

  updateProgress(percentage, message) {
    this.dom.progressBarFill.style.width = `${percentage}%`;
    if (message) this.dom.progressStatusText.textContent = message;
  }

  hideProgress() {
    this.dom.progressModal.classList.remove('active');
  }

  // --- Toast Notifications ---
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'alert-triangle' : 'info';
    toast.innerHTML = `<i data-feather="${icon}"></i><span>${message}</span>`;
    this.dom.toastContainer.appendChild(toast);
    if (window.feather) window.feather.replace();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
}

// Instantiate on load
window.addEventListener('DOMContentLoaded', () => {
  window.app = new PDFMasterApp();
});
