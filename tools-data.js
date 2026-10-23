// tools-data.js - Complete catalog of PDF tools matching reference specifications

export const TOOL_CATEGORIES = [
  { id: 'all', name: 'All Tools', icon: 'grid' },
  { id: 'popular', name: 'Popular', icon: 'star' },
  { id: 'convert-to-pdf', name: 'Convert to PDF', icon: 'arrow-down-circle' },
  { id: 'pdf-to-format', name: 'Convert from PDF', icon: 'arrow-up-circle' },
  { id: 'organize', name: 'Organize PDF', icon: 'layers' },
  { id: 'edit-sign', name: 'Edit & Sign', icon: 'edit-3' },
  { id: 'protect', name: 'Security & Optimization', icon: 'shield' },
  { id: 'ai-tools', name: 'AI & Smart Tools', icon: 'cpu' }
];

export const PDF_TOOLS = [
  // --- Compress ---
  {
    id: 'compress-pdf',
    title: 'Compress PDF',
    category: 'protect',
    popular: true,
    badge: 'Popular',
    iconColor: '#EF4444',
    icon: 'minimize-2',
    description: 'Reduce file size while optimizing for maximal PDF quality.',
    accept: '.pdf',
    mode: 'client',
    capabilities: ['compression-level', 'quality-slider']
  },

  // --- Convert (Core) ---
  {
    id: 'pdf-converter',
    title: 'PDF Converter',
    category: 'convert-to-pdf',
    popular: true,
    iconColor: '#F43F5E',
    icon: 'refresh-cw',
    description: 'Universal converter: transform Word, Excel, PPT, or Images into PDF and vice versa.',
    accept: '.pdf,.docx,.xlsx,.pptx,.jpg,.jpeg,.png,.txt',
    mode: 'client'
  },
  {
    id: 'pdf-ocr',
    title: 'PDF OCR',
    category: 'edit-sign',
    iconColor: '#E11D48',
    icon: 'file-text',
    description: 'Convert scanned PDF documents and images into searchable, selectable text.',
    accept: '.pdf,.png,.jpg,.jpeg',
    mode: 'client'
  },
  {
    id: 'pdf-to-pdfa',
    title: 'PDF to PDF/A',
    category: 'convert-to-pdf',
    iconColor: '#DC2626',
    icon: 'archive',
    description: 'Convert your PDF to PDF/A for long-term archiving and standard compliance.',
    accept: '.pdf',
    mode: 'client'
  },

  // --- PDF to Image ---
  {
    id: 'pdf-to-jpg',
    title: 'PDF to JPG',
    category: 'pdf-to-format',
    popular: true,
    badge: 'High Res',
    iconColor: '#F59E0B',
    icon: 'image',
    description: 'Extract every PDF page or embedded pictures as high-quality JPG images.',
    accept: '.pdf',
    mode: 'client'
  },
  {
    id: 'pdf-to-png',
    title: 'PDF to PNG',
    category: 'pdf-to-format',
    popular: false,
    iconColor: '#D97706',
    icon: 'image',
    description: 'Render crisp PDF pages into lossless PNG images with custom DPI settings.',
    accept: '.pdf',
    mode: 'client'
  },

  // --- Image to PDF ---
  {
    id: 'jpg-to-pdf',
    title: 'JPG to PDF',
    category: 'convert-to-pdf',
    popular: true,
    badge: 'Instant',
    iconColor: '#FBBF24',
    icon: 'file-plus',
    description: 'Convert JPG, JPEG, and PNG images to PDF. Adjust orientation, margins, and page order.',
    accept: '.jpg,.jpeg,.png,.webp,.bmp',
    mode: 'client'
  },

  // --- PDF to Office ---
  {
    id: 'pdf-to-word',
    title: 'PDF to Word',
    category: 'pdf-to-format',
    popular: true,
    badge: 'Most Used',
    iconColor: '#2563EB',
    icon: 'file-text',
    description: 'Easily convert your PDF files into editable DOC and DOCX documents.',
    accept: '.pdf',
    mode: 'hybrid'
  },
  {
    id: 'pdf-to-excel',
    title: 'PDF to Excel',
    category: 'pdf-to-format',
    popular: false,
    iconColor: '#10B981',
    icon: 'grid',
    description: 'Pull tabular data straight from PDF into editable Excel spreadsheets (.xlsx).',
    accept: '.pdf',
    mode: 'hybrid'
  },
  {
    id: 'pdf-to-ppt',
    title: 'PDF to PPT',
    category: 'pdf-to-format',
    popular: false,
    iconColor: '#F97316',
    icon: 'airplay',
    description: 'Turn your PDF presentations into editable PowerPoint PPT and PPTX slides.',
    accept: '.pdf',
    mode: 'hybrid'
  },

  // --- Office to PDF ---
  {
    id: 'word-to-pdf',
    title: 'Word to PDF',
    category: 'convert-to-pdf',
    popular: true,
    badge: 'Popular',
    iconColor: '#3B82F6',
    icon: 'file-text',
    description: 'Make DOC and DOCX files easy to read by converting them to pristine PDF format.',
    accept: '.doc,.docx',
    mode: 'hybrid'
  },
  {
    id: 'excel-to-pdf',
    title: 'Excel to PDF',
    category: 'convert-to-pdf',
    iconColor: '#059669',
    icon: 'table',
    description: 'Make EXCEL spreadsheets easy to view and print by converting them to PDF format.',
    accept: '.xls,.xlsx,.csv',
    mode: 'hybrid'
  },
  {
    id: 'ppt-to-pdf',
    title: 'PPT to PDF',
    category: 'convert-to-pdf',
    iconColor: '#EA580C',
    icon: 'layout',
    description: 'Convert PowerPoint slides to PDF with perfect slide formatting intact.',
    accept: '.ppt,.pptx',
    mode: 'hybrid'
  },

  // --- OpenOffice & Convert to PDF ---
  {
    id: 'odt-to-pdf',
    title: 'ODT to PDF',
    category: 'convert-to-pdf',
    iconColor: '#0284C7',
    icon: 'file',
    description: 'Convert OpenOffice Writer documents (.odt) into standard PDF documents.',
    accept: '.odt',
    mode: 'hybrid'
  },
  {
    id: 'ods-to-pdf',
    title: 'ODS to PDF',
    category: 'convert-to-pdf',
    iconColor: '#16A34A',
    icon: 'file',
    description: 'Convert OpenOffice Calc spreadsheets (.ods) into PDF.',
    accept: '.ods',
    mode: 'hybrid'
  },
  {
    id: 'odp-to-pdf',
    title: 'ODP to PDF',
    category: 'convert-to-pdf',
    iconColor: '#D97706',
    icon: 'file',
    description: 'Convert OpenOffice Impress presentations (.odp) into PDF slides.',
    accept: '.odp',
    mode: 'hybrid'
  },
  {
    id: 'txt-to-pdf',
    title: 'TXT to PDF',
    category: 'convert-to-pdf',
    iconColor: '#0284C7',
    icon: 'align-left',
    description: 'Convert plain text (.txt) files into clean, readable PDF documents with custom typography.',
    accept: '.txt',
    mode: 'client'
  },
  {
    id: 'rtf-to-pdf',
    title: 'RTF to PDF',
    category: 'convert-to-pdf',
    iconColor: '#2563EB',
    icon: 'align-center',
    description: 'Convert Rich Text Format (.rtf) documents to PDF formatting.',
    accept: '.rtf',
    mode: 'client'
  },
  {
    id: 'html-to-pdf',
    title: 'HTML to PDF',
    category: 'convert-to-pdf',
    iconColor: '#06B6D4',
    icon: 'code',
    description: 'Convert webpages or raw HTML files into high-fidelity PDF documents.',
    accept: '.html,.htm',
    mode: 'client'
  },
  {
    id: 'epub-to-pdf',
    title: 'EPUB to PDF',
    category: 'convert-to-pdf',
    iconColor: '#8B5CF6',
    icon: 'book-open',
    description: 'Convert EPUB e-books into PDF documents for reading on any screen or printing.',
    accept: '.epub',
    mode: 'client'
  },
  {
    id: 'zip-to-pdf',
    title: 'ZIP to PDF',
    category: 'convert-to-pdf',
    iconColor: '#3B82F6',
    icon: 'archive',
    description: 'Extract documents or images from a ZIP archive and combine them into a single PDF.',
    accept: '.zip',
    mode: 'client'
  },
  {
    id: 'csv-to-pdf',
    title: 'CSV to PDF',
    category: 'convert-to-pdf',
    iconColor: '#10B981',
    icon: 'list',
    description: 'Format raw CSV tabular data into beautifully structured PDF tables.',
    accept: '.csv',
    mode: 'client'
  },
  {
    id: 'pages-to-pdf',
    title: 'Pages to PDF',
    category: 'convert-to-pdf',
    iconColor: '#0284C7',
    icon: 'file',
    description: 'Convert Apple Pages documents into universally accessible PDF files.',
    accept: '.pages',
    mode: 'hybrid'
  },

  // --- Organize ---
  {
    id: 'merge-pdf',
    title: 'Merge PDF',
    category: 'organize',
    popular: true,
    badge: 'Popular',
    iconColor: '#6366F1',
    icon: 'layers',
    description: 'Combine multiple PDF files into a single unified document in any order you want.',
    accept: '.pdf',
    mode: 'client',
    multiFile: true
  },
  {
    id: 'split-pdf',
    title: 'Split PDF',
    category: 'organize',
    popular: true,
    badge: 'Essential',
    iconColor: '#8B5CF6',
    icon: 'scissors',
    description: 'Separate one page or a whole set for easy conversion into independent PDF files.',
    accept: '.pdf',
    mode: 'client'
  },
  {
    id: 'rotate-pdf',
    title: 'Rotate PDF',
    category: 'organize',
    iconColor: '#A855F7',
    icon: 'rotate-cw',
    description: 'Rotate your PDF pages 90, 180, or 270 degrees. Rotate specific pages or all at once.',
    accept: '.pdf',
    mode: 'client'
  },
  {
    id: 'delete-pdf-pages',
    title: 'Delete PDF Pages',
    category: 'organize',
    iconColor: '#EC4899',
    icon: 'trash-2',
    description: 'Remove unwanted pages from your PDF document with a visual interactive grid.',
    accept: '.pdf',
    mode: 'client'
  },
  {
    id: 'extract-pdf-pages',
    title: 'Extract PDF Pages',
    category: 'organize',
    iconColor: '#6366F1',
    icon: 'check-square',
    description: 'Select specific pages to extract into a brand-new PDF file.',
    accept: '.pdf',
    mode: 'client'
  },
  {
    id: 'organize-pdf',
    title: 'Organize PDF',
    category: 'organize',
    iconColor: '#8B5CF6',
    icon: 'move',
    description: 'Sort, reorder, delete, and duplicate PDF pages using an intuitive visual canvas.',
    accept: '.pdf',
    mode: 'client'
  },

  // --- Edit ---
  {
    id: 'edit-pdf',
    title: 'Edit PDF',
    category: 'edit-sign',
    popular: true,
    badge: 'New',
    iconColor: '#0EA5E9',
    icon: 'edit-3',
    description: 'Add text, shapes, highlights, freehand drawings, and images to your PDF.',
    accept: '.pdf',
    mode: 'client'
  },
  {
    id: 'pdf-annotator',
    title: 'PDF Annotator',
    category: 'edit-sign',
    iconColor: '#06B6D4',
    icon: 'pen-tool',
    description: 'Highlight text, add sticky notes, underline, and strike through PDF content.',
    accept: '.pdf',
    mode: 'client'
  },
  {
    id: 'pdf-reader',
    title: 'PDF Reader',
    category: 'edit-sign',
    iconColor: '#14B8A6',
    icon: 'book',
    description: 'Read and view PDF files in browser with continuous scroll, zoom, and dark mode.',
    accept: '.pdf',
    mode: 'client'
  },
  {
    id: 'number-pages',
    title: 'Number Pages',
    category: 'edit-sign',
    iconColor: '#0284C7',
    icon: 'hash',
    description: 'Add page numbers into your PDF with customized position, typography, and numbering style.',
    accept: '.pdf',
    mode: 'client'
  },
  {
    id: 'crop-pdf',
    title: 'Crop PDF',
    category: 'edit-sign',
    iconColor: '#0EA5E9',
    icon: 'crop',
    description: 'Trim margins or crop specific areas of your PDF pages visually.',
    accept: '.pdf',
    mode: 'client'
  },
  {
    id: 'redact-pdf',
    title: 'Redact PDF',
    category: 'edit-sign',
    iconColor: '#0F172A',
    icon: 'eye-off',
    description: 'Permanently remove or black out sensitive text, confidential numbers, and images.',
    accept: '.pdf',
    mode: 'client'
  },
  {
    id: 'watermark-pdf',
    title: 'Watermark PDF',
    category: 'edit-sign',
    popular: true,
    iconColor: '#0284C7',
    icon: 'droplet',
    description: 'Stamp an image or text watermark over your PDF. Choose position, opacity, and rotation.',
    accept: '.pdf',
    mode: 'client'
  },
  {
    id: 'pdf-form-filler',
    title: 'PDF Form Filler',
    category: 'edit-sign',
    iconColor: '#06B6D4',
    icon: 'check-circle',
    description: 'Fill out interactive and static PDF forms easily and export filled PDFs.',
    accept: '.pdf',
    mode: 'client'
  },

  // --- Fill & Sign ---
  {
    id: 'sign-pdf',
    title: 'Sign PDF',
    category: 'edit-sign',
    popular: true,
    badge: 'E-Sign',
    iconColor: '#D946EF',
    icon: 'feather',
    description: 'Draw your electronic signature, type it, or upload signature image and stamp your PDF.',
    accept: '.pdf',
    mode: 'client'
  },
  {
    id: 'request-signatures',
    title: 'Request Signatures',
    category: 'edit-sign',
    iconColor: '#F59E0B',
    icon: 'send',
    description: 'Send PDF documents to others and track signed status easily.',
    accept: '.pdf',
    mode: 'client'
  },

  // --- Protect ---
  {
    id: 'unlock-pdf',
    title: 'Unlock PDF',
    category: 'protect',
    iconColor: '#EF4444',
    icon: 'unlock',
    description: 'Remove PDF password security and permissions to use your PDF freely.',
    accept: '.pdf',
    mode: 'client'
  },
  {
    id: 'protect-pdf',
    title: 'Protect PDF',
    category: 'protect',
    popular: true,
    badge: 'AES-256',
    iconColor: '#DC2626',
    icon: 'lock',
    description: 'Encrypt your PDF file with strong password protection to prevent unauthorized access.',
    accept: '.pdf',
    mode: 'client'
  },
  {
    id: 'flatten-pdf',
    title: 'Flatten PDF',
    category: 'protect',
    iconColor: '#B91C1C',
    icon: 'minimize',
    description: 'Flatten fillable forms, comments, and annotations into non-editable PDF stream.',
    accept: '.pdf',
    mode: 'client'
  },

  // --- Scan ---
  {
    id: 'pdf-scanner',
    title: 'PDF Scanner',
    category: 'convert-to-pdf',
    popular: true,
    badge: 'Mobile Ready',
    iconColor: '#2563EB',
    icon: 'camera',
    description: 'Scan physical paper documents using your mobile or desktop webcam into high-clarity PDF.',
    accept: 'image/*',
    mode: 'client'
  },

  // --- AI PDF ---
  {
    id: 'ai-pdf-assistant',
    title: 'AI PDF Assistant',
    category: 'ai-tools',
    popular: true,
    badge: 'AI Smart',
    iconColor: '#4F46E5',
    icon: 'cpu',
    description: 'Interact with your PDF documents using artificial intelligence to extract insights instantly.',
    accept: '.pdf',
    mode: 'client'
  },
  {
    id: 'chat-with-pdf',
    title: 'Chat with PDF',
    category: 'ai-tools',
    popular: true,
    badge: 'AI',
    iconColor: '#3B82F6',
    icon: 'message-square',
    description: 'Ask questions, probe details, and chat directly with your document in natural language.',
    accept: '.pdf',
    mode: 'client'
  },
  {
    id: 'ai-pdf-summarizer',
    title: 'AI PDF Summarizer',
    category: 'ai-tools',
    iconColor: '#2563EB',
    icon: 'file-text',
    description: 'Generate concise executive summaries and bullet points of lengthy multi-page reports.',
    accept: '.pdf',
    mode: 'client'
  },
  {
    id: 'translate-pdf',
    title: 'Translate PDF',
    category: 'ai-tools',
    iconColor: '#0284C7',
    icon: 'globe',
    description: 'Translate documents between 50+ languages while preserving layout and structure.',
    accept: '.pdf',
    mode: 'client'
  },
  {
    id: 'ai-question-generator',
    title: 'AI Question Generator',
    category: 'ai-tools',
    iconColor: '#1D4ED8',
    icon: 'help-circle',
    description: 'Automatically generate quiz questions, flashcards, and study guides from textbooks.',
    accept: '.pdf',
    mode: 'client'
  }
];
