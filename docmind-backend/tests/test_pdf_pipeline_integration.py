
import fitz

from app.services.pdf_processor import PDFProcessorService


def test_pdf_extraction_and_chunking_integration(tmp_path):
    pdf_path = tmp_path / "integration_test.pdf"

    with fitz.open() as pdf:
        page1 = pdf.new_page()
        page1.insert_text(
            (72, 72),
            "DocMind AI extracts text from PDF documents."
        )

        page2 = pdf.new_page()
        page2.insert_text(
            (72, 72),
            "Semantic retrieval finds relevant context."
        )

        pdf.save(str(pdf_path))

    extracted_pages = PDFProcessorService.extract_text_by_page(
        str(pdf_path)
    )

    chunks = PDFProcessorService.chunk_text(
        extracted_pages,
        chunk_size=500,
        chunk_overlap=50
    )

    assert len(extracted_pages) == 2
    assert "DocMind AI extracts" in extracted_pages[0]["text"]
    assert "Semantic retrieval" in extracted_pages[1]["text"]
    assert len(chunks) == 2
    assert [chunk["page"] for chunk in chunks] == [1, 2]
