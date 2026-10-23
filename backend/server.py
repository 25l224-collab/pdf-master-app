# backend/server.py - Python FastAPI Document Conversion Microservice

import os
import io
import tempfile
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, StreamingResponse, JSONResponse

app = FastAPI(
    title="PDF Master Conversion Service",
    description="High-fidelity PDF and Office Document Conversion API",
    version="1.0.0"
)

# Enable CORS for local web app and mobile webviews
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "service": "PDF Master Conversion Engine",
        "version": "1.0.0",
        "python": True
    }

# --- PDF to Word (.docx) Conversion ---
@app.post("/api/convert/pdf-to-word")
async def convert_pdf_to_word(file: UploadFile = File(...)):
    try:
        content = await file.read()
        
        # Check if pdf2docx is installed
        try:
            from pdf2docx import Converter
            with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as temp_pdf:
                temp_pdf.write(content)
                temp_pdf_path = temp_pdf.name
            
            docx_path = temp_pdf_path.replace(".pdf", ".docx")
            cv = Converter(temp_pdf_path)
            cv.convert(docx_path, start=0, end=None)
            cv.close()

            with open(docx_path, "rb") as f:
                docx_bytes = f.read()

            os.remove(temp_pdf_path)
            os.remove(docx_path)

            return Response(
                content=docx_bytes,
                media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                headers={"Content-Disposition": f'attachment; filename="{file.filename.replace(".pdf", ".docx")}"'}
            )
        except ImportError:
            # Fallback using pypdf + docx or basic structured docx
            from pypdf import PdfReader
            import docx

            reader = PdfReader(io.BytesIO(content))
            doc = docx.Document()
            doc.add_heading(file.filename.replace(".pdf", ""), level=1)

            for i, page in enumerate(reader.pages):
                text = page.extract_text()
                if text:
                    for line in text.split("\n"):
                        if line.strip():
                            doc.add_paragraph(line.strip())
                if i < len(reader.pages) - 1:
                    doc.add_page_break()

            out_stream = io.BytesIO()
            doc.save(out_stream)
            out_stream.seek(0)

            return StreamingResponse(
                out_stream,
                media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                headers={"Content-Disposition": f'attachment; filename="{file.filename.replace(".pdf", ".docx")}"'}
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF to Word conversion failed: {str(e)}")

# --- Word (.docx) to PDF Conversion ---
@app.post("/api/convert/word-to-pdf")
async def convert_word_to_pdf(file: UploadFile = File(...)):
    try:
        content = await file.read()
        
        # Fallback using python-docx and reportlab
        import docx
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet

        source_doc = docx.Document(io.BytesIO(content))
        pdf_stream = io.BytesIO()
        pdf = SimpleDocTemplate(pdf_stream, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []

        for p in source_doc.paragraphs:
            if p.text.strip():
                story.append(Paragraph(p.text, styles['Normal']))
                story.append(Spacer(1, 8))

        if not story:
            story.append(Paragraph("Document Converted from Word", styles['Title']))

        pdf.build(story)
        pdf_stream.seek(0)

        return StreamingResponse(
            pdf_stream,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{file.filename.replace(".docx", ".pdf")}"'}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Word to PDF conversion failed: {str(e)}")

# --- Compress PDF ---
@app.post("/api/convert/compress-pdf")
async def compress_pdf(file: UploadFile = File(...), quality: int = Form(80)):
    try:
        content = await file.read()
        from pypdf import PdfReader, PdfWriter

        reader = PdfReader(io.BytesIO(content))
        writer = PdfWriter()

        for page in reader.pages:
            page.compress_content_streams()
            writer.add_page(page)

        out_stream = io.BytesIO()
        writer.write(out_stream)
        out_stream.seek(0)

        return StreamingResponse(
            out_stream,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="compressed_{file.filename}"'}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF Compression failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)
