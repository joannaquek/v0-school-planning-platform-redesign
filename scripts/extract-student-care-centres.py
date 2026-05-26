#!/usr/bin/env python3
"""Extract student care centre listings from MSF-style SCC PDF into JSON."""

from __future__ import annotations

import json
import re
import unicodedata
from datetime import date
from pathlib import Path

import pdfplumber

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_PDF = ROOT / "full-list-of-scc_21-apr-2026.pdf"
DEFAULT_OUT = ROOT / "data" / "student-care-centres.json"

POSTAL_RE = re.compile(r"\b(\d{6})\b")
FEE_RE = re.compile(r"\$?\s*([\d,]+(?:\.\d{2})?)")


def slugify(name: str) -> str:
    text = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode("ascii")
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    return text or "centre"


def clean_field(value: str | None) -> str:
    if not value:
        return ""
    return re.sub(r"\s+", " ", value.replace("\n", " ").strip())


def parse_emails(raw: str) -> list[str]:
    if not raw:
        return []
    parts = re.split(r"[,;\s]+", raw.replace("\n", " "))
    emails = []
    for part in parts:
        part = part.strip().lower()
        if "@" in part and "." in part.split("@")[-1]:
            emails.append(part)
    return list(dict.fromkeys(emails))


def parse_fee(raw: str) -> tuple[float | None, str]:
    display = clean_field(raw)
    if not display:
        return None, ""
    match = FEE_RE.search(display.replace(",", ""))
    if not match:
        return None, display
    return float(match.group(1)), display if display.startswith("$") else f"${match.group(1)}"


def extract_postal_code(address: str) -> str | None:
    matches = POSTAL_RE.findall(address.upper())
    return matches[-1] if matches else None


def is_header_row(row: list[str | None]) -> bool:
    joined = " ".join(clean_field(c) for c in row if c)
    return "Name of Student Care" in joined or joined.strip() == "Centre"


def is_continuation_row(row: list[str | None]) -> bool:
    name = clean_field(row[0] if len(row) > 0 else None)
    fee = clean_field(row[4] if len(row) > 4 else None)
    return not name and not fee


def is_name_only_row(row: list[str | None]) -> bool:
    name = clean_field(row[0] if len(row) > 0 else None)
    address = clean_field(row[1] if len(row) > 1 else None)
    fee = clean_field(row[4] if len(row) > 4 else None)
    phone = clean_field(row[2] if len(row) > 2 else None)
    return bool(name) and not address and not fee and not phone


def row_to_record(row: list[str | None], index: int) -> dict:
    name = clean_field(row[0] if len(row) > 0 else None)
    address_raw = (row[1] or "").strip() if len(row) > 1 else ""
    address_lines = [line.strip() for line in address_raw.split("\n") if line.strip()]
    address_parts: list[str] = []
    for line in address_lines:
        if address_parts and address_parts[-1].endswith(","):
            address_parts[-1] = f"{address_parts[-1]} {line}"
        else:
            address_parts.append(line)
    address = ", ".join(address_parts)
    telephone = clean_field(row[2] if len(row) > 2 else None)
    email_raw = (row[3] or "").strip() if len(row) > 3 else ""
    fee_amount, fee_display = parse_fee(row[4] if len(row) > 4 else "")

    base_slug = slugify(name)
    slug = base_slug
    return {
        "id": slug,
        "name": name,
        "address": address,
        "addressLines": address_lines,
        "postalCode": extract_postal_code(address),
        "telephone": re.sub(r"\D", "", telephone) if telephone else None,
        "telephoneDisplay": telephone or None,
        "email": parse_emails(email_raw)[0] if parse_emails(email_raw) else None,
        "emails": parse_emails(email_raw),
        "monthlyFee": fee_amount,
        "monthlyFeeCurrency": "SGD" if fee_amount is not None else None,
        "monthlyFeeDisplay": fee_display or None,
        "_rowIndex": index,
    }


def apply_name_prefix(full_name: str, prefix: str) -> str:
    """Merge a split name row (often trailing CLS legal entity) into the full centre name."""
    prefix = clean_field(prefix)
    if not prefix:
        return full_name
    if prefix.startswith("(Primary)") and "CLS" in prefix:
        cls_tail = re.sub(r"^\(Primary\)\s*–\s*", "", prefix, flags=re.I).strip()
        merged = re.sub(r"\s*–\s*CLS\s+.+$", f" – {cls_tail}", full_name, count=1)
        return merged if merged != full_name else f"{full_name} – {cls_tail}"
    if prefix not in full_name:
        return f"{prefix} {full_name}".strip()
    return full_name


def finalize_record(record: dict, seen_slugs: dict[str, int]) -> dict:
    slug = slugify(record["name"])
    if slug in seen_slugs:
        seen_slugs[slug] += 1
        record["id"] = f"{slug}-{seen_slugs[slug]}"
    else:
        seen_slugs[slug] = 1
        record["id"] = slug
    return record


def extract_centres(pdf_path: Path) -> list[dict]:
    records: list[dict] = []
    seen_slugs: dict[str, int] = {}
    pending_name_prefix: str | None = None

    with pdfplumber.open(pdf_path) as pdf:
        row_index = 0
        for page in pdf.pages:
            for table in page.extract_tables() or []:
                for row in table:
                    row_index += 1
                    if not row or is_header_row(row) or is_continuation_row(row):
                        continue

                    if is_name_only_row(row):
                        fragment = clean_field(row[0])
                        pending_name_prefix = (
                            f"{pending_name_prefix} {fragment}".strip()
                            if pending_name_prefix
                            else fragment
                        )
                        continue

                    record = row_to_record(row, row_index)
                    if pending_name_prefix:
                        record["name"] = apply_name_prefix(record["name"], pending_name_prefix)
                        pending_name_prefix = None

                    del record["_rowIndex"]
                    records.append(finalize_record(record, seen_slugs))

    return records


def main() -> None:
    pdf_path = DEFAULT_PDF
    out_path = DEFAULT_OUT
    centres = extract_centres(pdf_path)

    payload = {
        "source": {
            "document": pdf_path.name,
            "documentDate": "2026-04-21",
            "extractedAt": date.today().isoformat(),
            "notes": "Full list of student care centres (MSF publication). Fees and contacts as stated in PDF.",
        },
        "count": len(centres),
        "centres": centres,
    }

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {len(centres)} centres to {out_path}")


if __name__ == "__main__":
    main()
