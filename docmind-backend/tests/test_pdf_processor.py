import fitz
import pytest

from app.services.pdf_processor import PDFProcessorService


def test_extract_text_by_page_reads_text_and_page_numbers(tmp_path):
    pdf_path = tmp_path / "sample.pdf"
    with fitz.open() as document:
        page_one = document.new_page()
        page_one.insert_text((72, 72), "DocMind AI first page")
        page_two = document.new_page()
        page_two.insert_text((72, 72), "Second page content")
        document.save(pdf_path)

    result = PDFProcessorService.extract_text_by_page(str(pdf_path))

    assert len(result) == 2
    assert result[0]["page"] == 1
    assert "DocMind AI first page" in result[0]["text"]
    assert result[1]["page"] == 2
    assert "Second page content" in result[1]["text"]


def test_chunk_text_preserves_page_and_overlap():
    page_data = [{"page": 3, "text": "abcdefghijkl"}]

    result = PDFProcessorService.chunk_text(
        page_data,
        chunk_size=5,
        chunk_overlap=2,
    )

    assert [chunk["text"] for chunk in result] == [
        "abcde",
        "defgh",
        "ghijk",
        "jkl",
    ]
    assert all(chunk["page"] == 3 for chunk in result)


def test_chunk_text_skips_empty_pages():
    page_data = [
        {"page": 1, "text": ""},
        {"page": 2, "text": "useful text"},
        {"page": 3, "text": "   "},
    ]

    result = PDFProcessorService.chunk_text(page_data, chunk_size=20, chunk_overlap=2)

    assert len(result) == 1
    assert result[0]["page"] == 2


def test_chunk_text_rejects_invalid_chunk_settings():
    with pytest.raises(ValueError):
        PDFProcessorService.chunk_text(
            [{"page": 1, "text": "sample text"}],
            chunk_size=5,
            chunk_overlap=5,
        )


def test_extract_text_rejects_invalid_pdf(tmp_path):
    file_path = tmp_path / "not_a_pdf.pdf"
    file_path.write_text("This is not a valid PDF", encoding="utf-8")

    with pytest.raises((fitz.FileDataError, RuntimeError)):
        PDFProcessorService.extract_text_by_page(str(file_path))
