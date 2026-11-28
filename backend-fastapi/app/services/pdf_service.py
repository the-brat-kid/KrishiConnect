import io
from datetime import datetime, date
from xml.sax.saxutils import escape as xml_escape

from reportlab.graphics.shapes import Drawing, Rect, Path
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_RIGHT, TA_CENTER


# Dark obsidian + emerald palette matching InvoiceSheet UI
BG_DARK = colors.HexColor("#0C0E12")
META_BG = colors.HexColor("#07090C")
PANEL_BG = colors.HexColor("#101318")
PILL_BG = colors.HexColor("#1C222A")
EMERALD_BOX_BG = colors.HexColor("#0D251C")
EMERALD_BOX_BORDER = colors.HexColor("#174B37")
EMERALD_SOFT_BG = colors.HexColor("#0A291E")
EMERALD_SOFT_BORDER = colors.HexColor("#145A40")
THANK_YOU_BG = colors.HexColor("#092118")
THANK_YOU_BORDER = colors.HexColor("#154C37")
AMBER_BG = colors.HexColor("#2A1F0B")
AMBER_BORDER = colors.HexColor("#78350F")
AMBER_TEXT = colors.HexColor("#FBBF24")
RED_BG = colors.HexColor("#2C1014")
RED_BORDER = colors.HexColor("#7F1D1D")
RED_TEXT = colors.HexColor("#F87171")

EMERALD = colors.HexColor("#34D399")
EMERALD_LIGHT = colors.HexColor("#A7F3D0")
TEXT_PRIMARY = colors.HexColor("#F8FAFC")
TEXT_SECONDARY = colors.HexColor("#E2E8F0")
TEXT_MUTED = colors.HexColor("#94A3B8")
TEXT_DIM = colors.HexColor("#64748B")
BORDER_DARK = colors.HexColor("#1B222C")
BORDER_SUBTLE = colors.HexColor("#161C24")
PILL_BORDER = colors.HexColor("#2D3744")

TOP_BAR_COLORS = [
    "#10B981", "#10B980", "#11B983", "#11B987", "#12B88C", "#12B892",
    "#13B898", "#13B89F", "#14B8A6", "#28B698", "#3FB489", "#56B27A",
    "#6DB06B", "#84AE5C", "#9BAC4E", "#B2AA3F", "#C9A730", "#DFA421",
    "#ED9F14", "#F59E0B",
]

_ONES = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
]
_TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]


def _two_digits(n: int) -> str:
    if n < 20:
        return _ONES[n]
    return f"{_TENS[n // 10]}{' ' + _ONES[n % 10] if n % 10 else ''}"


def _three_digits(n: int) -> str:
    if n >= 100:
        rest = n % 100
        return f"{_ONES[n // 100]} Hundred{' ' + _two_digits(rest) if rest else ''}"
    return _two_digits(n)


def amount_in_words(amount: float) -> str:
    safe = max(0.0, float(amount or 0))
    rupees = int(safe)
    paise = round((safe - rupees) * 100)

    if rupees == 0:
        rupee_str = "Zero"
    else:
        n = rupees
        parts = []
        crore = n // 10000000
        n %= 10000000
        lakh = n // 100000
        n %= 100000
        thousand = n // 1000
        n %= 1000
        hundred = n
        if crore:
            parts.append(f"{_three_digits(crore)} Crore")
        if lakh:
            parts.append(f"{_three_digits(lakh)} Lakh")
        if thousand:
            parts.append(f"{_three_digits(thousand)} Thousand")
        if hundred:
            parts.append(_three_digits(hundred))
        rupee_str = " ".join(parts).strip()

    suffix = "Rupee" if rupees == 1 else "Rupees"
    if paise > 0:
        return f"{rupee_str} {suffix} and {_two_digits(paise)} Paise Only"
    return f"{rupee_str} {suffix} Only"


def draw_top_bar(canvas, doc):
    canvas.saveState()
    page_w, page_h = A4
    canvas.setFillColor(BG_DARK)
    canvas.rect(0, 0, page_w, page_h, stroke=0, fill=1)

    seg_w = page_w / len(TOP_BAR_COLORS)
    for idx, hex_color in enumerate(TOP_BAR_COLORS):
        canvas.setFillColor(colors.HexColor(hex_color))
        canvas.rect(idx * seg_w, page_h - 4, seg_w + 0.5, 4, stroke=0, fill=1)
    canvas.restoreState()


def _safe_str(val, default=""):
    if val is None:
        return default
    if hasattr(val, "value"):  # Enum support (e.g. InvoiceStatus)
        val = val.value
    s = str(val).strip()
    return s if s else default


def _esc(val, default=""):
    return xml_escape(_safe_str(val, default))


def _safe_float(val, default=0.0):
    try:
        if val is None:
            return default
        return float(val)
    except (ValueError, TypeError):
        return default


def _get_field(obj, key, default=None):
    if obj is None:
        return default
    if isinstance(obj, dict):
        return obj.get(key, default)
    return getattr(obj, key, default)


def _format_display_date(raw_date):
    if raw_date is None:
        return "N/A"
    if isinstance(raw_date, (datetime, date)):
        return raw_date.strftime("%d %b %Y").lstrip("0")
    s = _safe_str(raw_date, "N/A")
    if s == "N/A":
        return s
    try:
        dt = datetime.fromisoformat(s.replace("Z", "+00:00"))
        return dt.strftime("%d %b %Y").lstrip("0")
    except Exception:
        return s[:10]


def _extract_profile_dict(profile_obj) -> dict:
    if isinstance(profile_obj, dict):
        return profile_obj
    return {
        "business_name": _get_field(profile_obj, "business_name"),
        "business_type": _get_field(profile_obj, "business_type"),
        "address": _get_field(profile_obj, "address"),
        "gst_number": _get_field(profile_obj, "gst_number") or _get_field(profile_obj, "gst"),
        "phone": _get_field(profile_obj, "phone"),
        "upi_id": _get_field(profile_obj, "upi_id"),
    }


def _extract_customer_dict(cust_obj) -> dict:
    if cust_obj is None:
        return {}
    if isinstance(cust_obj, dict):
        return cust_obj
    return {
        "name": _get_field(cust_obj, "name"),
        "address": _get_field(cust_obj, "address"),
        "gst_number": _get_field(cust_obj, "gst_number") or _get_field(cust_obj, "gst"),
        "phone": _get_field(cust_obj, "phone"),
        "email": _get_field(cust_obj, "email"),
    }


def _extract_invoice_dict(inv_obj) -> dict:
    if isinstance(inv_obj, dict):
        return inv_obj
    raw_items = _get_field(inv_obj, "items") or []
    items = []
    for item in raw_items:
        if isinstance(item, dict):
            items.append(item)
        else:
            items.append({
                "description": _get_field(item, "description"),
                "quantity": _get_field(item, "quantity"),
                "unit_price": _get_field(item, "unit_price"),
                "gst_rate": _get_field(item, "gst_rate"),
            })
    raw_cust = _get_field(inv_obj, "customer")
    return {
        "invoice_number": _get_field(inv_obj, "invoice_number"),
        "date": _get_field(inv_obj, "date"),
        "due_date": _get_field(inv_obj, "due_date"),
        "status": _safe_str(_get_field(inv_obj, "status"), "unpaid"),
        "payment_method": _get_field(inv_obj, "payment_method"),
        "subtotal": _get_field(inv_obj, "subtotal"),
        "gst_total": _get_field(inv_obj, "gst_total"),
        "grand_total": _get_field(inv_obj, "grand_total"),
        "discount_type": _get_field(inv_obj, "discount_type"),
        "discount_value": _get_field(inv_obj, "discount_value"),
        "notes": _get_field(inv_obj, "notes"),
        "terms": _get_field(inv_obj, "terms"),
        "items": items,
        "customer": _extract_customer_dict(raw_cust) if raw_cust is not None else {},
    }


def _build_bag_icon(size: float = 38.0) -> Drawing:
    d = Drawing(size, size)
    d.add(Rect(
        0, 0, size, size,
        rx=8, ry=8,
        fillColor=EMERALD_BOX_BG,
        strokeColor=EMERALD_BOX_BORDER,
        strokeWidth=1,
    ))
    # Minimal emerald shopping bag outline matching Lucide ShoppingBag
    bag = Path(
        fillColor=None,
        strokeColor=EMERALD,
        strokeWidth=1.4,
        strokeLineCap=1,
        strokeLineJoin=1,
    )
    # Body trapezoid + top rim
    bag.moveTo(13, 25)
    bag.lineTo(25, 25)
    bag.lineTo(27, 22)
    bag.lineTo(27, 13)
    bag.curveTo(27, 11.8, 26.2, 11, 25, 11)
    bag.lineTo(13, 11)
    bag.curveTo(11.8, 11, 11, 11.8, 11, 13)
    bag.lineTo(11, 22)
    bag.closePath()
    d.add(bag)

    rim = Path(fillColor=None, strokeColor=EMERALD, strokeWidth=1.4, strokeLineCap=1)
    rim.moveTo(11.2, 21.8)
    rim.lineTo(26.8, 21.8)
    d.add(rim)

    # Top handle + inner U-handle
    handle = Path(fillColor=None, strokeColor=EMERALD, strokeWidth=1.4, strokeLineCap=1)
    handle.moveTo(15.5, 25)
    handle.curveTo(15.5, 28, 22.5, 28, 22.5, 25)
    d.add(handle)
    return d


def _build_thumbs_up_icon(size: float = 14.0) -> Drawing:
    d = Drawing(size, size)
    thumb = Path(
        fillColor=None,
        strokeColor=EMERALD,
        strokeWidth=1.2,
        strokeLineCap=1,
        strokeLineJoin=1,
    )
    # Cuff box + raised thumb silhouette scaled cleanly into 14x14
    thumb.moveTo(2, 2.5)
    thumb.lineTo(4.5, 2.5)
    thumb.lineTo(4.5, 8.2)
    thumb.lineTo(2, 8.2)
    thumb.closePath()
    thumb.moveTo(4.5, 8.2)
    thumb.lineTo(6.8, 11.8)
    thumb.curveTo(7.4, 12.6, 8.6, 12.2, 8.6, 11.1)
    thumb.lineTo(8.6, 8.5)
    thumb.lineTo(11.4, 8.5)
    thumb.curveTo(12.2, 8.5, 12.7, 7.8, 12.5, 7.0)
    thumb.lineTo(11.7, 3.6)
    thumb.curveTo(11.5, 2.9, 10.9, 2.5, 10.2, 2.5)
    thumb.lineTo(4.5, 2.5)
    d.add(thumb)
    return d


class PDFInvoiceService:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()

    def _setup_custom_styles(self):
        self.styles.add(ParagraphStyle(
            name="BrandName", fontSize=15, fontName="Helvetica-Bold",
            textColor=TEXT_PRIMARY, leading=19,
        ))
        self.styles.add(ParagraphStyle(
            name="MutedText", fontSize=8.5, fontName="Helvetica",
            textColor=TEXT_MUTED, leading=12,
        ))
        self.styles.add(ParagraphStyle(
            name="EmeraldLabel", fontSize=8.5, fontName="Helvetica",
            textColor=EMERALD, leading=12,
        ))
        self.styles.add(ParagraphStyle(
            name="Eyebrow", fontSize=7, fontName="Helvetica-Bold",
            textColor=TEXT_MUTED, leading=10,
        ))
        self.styles.add(ParagraphStyle(
            name="EyebrowRight", fontSize=7, fontName="Helvetica-Bold",
            textColor=TEXT_MUTED, alignment=TA_RIGHT, leading=10,
        ))
        self.styles.add(ParagraphStyle(
            name="InvNumber", fontSize=13, fontName="Helvetica-Bold",
            textColor=colors.white, alignment=TA_RIGHT, leading=17,
        ))
        self.styles.add(ParagraphStyle(
            name="MetaRight", fontSize=8, fontName="Helvetica",
            textColor=TEXT_SECONDARY, alignment=TA_RIGHT, leading=12,
        ))
        self.styles.add(ParagraphStyle(
            name="PartyName", fontSize=10.5, fontName="Helvetica-Bold",
            textColor=TEXT_PRIMARY, leading=14,
        ))
        self.styles.add(ParagraphStyle(
            name="PillText", fontSize=7.5, fontName="Helvetica",
            textColor=TEXT_SECONDARY, alignment=TA_CENTER, leading=10,
        ))
        self.styles.add(ParagraphStyle(
            name="TableHeader", fontSize=7, fontName="Helvetica-Bold",
            textColor=TEXT_MUTED, leading=10,
        ))
        self.styles.add(ParagraphStyle(
            name="TableHeaderCenter", fontSize=7, fontName="Helvetica-Bold",
            textColor=TEXT_MUTED, alignment=TA_CENTER, leading=10,
        ))
        self.styles.add(ParagraphStyle(
            name="TableHeaderRight", fontSize=7, fontName="Helvetica-Bold",
            textColor=TEXT_MUTED, alignment=TA_RIGHT, leading=10,
        ))
        self.styles.add(ParagraphStyle(
            name="CellIndex", fontSize=8.5, fontName="Helvetica",
            textColor=TEXT_DIM, leading=12,
        ))
        self.styles.add(ParagraphStyle(
            name="CellBold", fontSize=9, fontName="Helvetica-Bold",
            textColor=TEXT_PRIMARY, leading=13,
        ))
        self.styles.add(ParagraphStyle(
            name="CellRight", fontSize=8.5, fontName="Helvetica",
            textColor=TEXT_SECONDARY, alignment=TA_RIGHT, leading=12,
        ))
        self.styles.add(ParagraphStyle(
            name="CellRightBold", fontSize=9, fontName="Helvetica-Bold",
            textColor=TEXT_PRIMARY, alignment=TA_RIGHT, leading=13,
        ))
        self.styles.add(ParagraphStyle(
            name="CellCenter", fontSize=8.5, fontName="Helvetica",
            textColor=TEXT_SECONDARY, alignment=TA_CENTER, leading=12,
        ))
        self.styles.add(ParagraphStyle(
            name="SummaryLabel", fontSize=8.5, fontName="Helvetica",
            textColor=TEXT_MUTED, leading=12,
        ))
        self.styles.add(ParagraphStyle(
            name="SummaryRight", fontSize=8.5, fontName="Helvetica",
            textColor=TEXT_SECONDARY, alignment=TA_RIGHT, leading=12,
        ))
        self.styles.add(ParagraphStyle(
            name="GrandTotalLabel", fontSize=10, fontName="Helvetica-Bold",
            textColor=colors.white, leading=13,
        ))
        self.styles.add(ParagraphStyle(
            name="GrandTotalAmount", fontSize=16, fontName="Helvetica-Bold",
            textColor=EMERALD, alignment=TA_RIGHT, leading=20,
        ))
        self.styles.add(ParagraphStyle(
            name="WordsItalic", fontSize=8, fontName="Helvetica-Oblique",
            textColor=TEXT_SECONDARY, alignment=TA_RIGHT, leading=11,
        ))
        self.styles.add(ParagraphStyle(
            name="PaymentValue", fontSize=9, fontName="Helvetica-Bold",
            textColor=colors.white, leading=12,
        ))
        self.styles.add(ParagraphStyle(
            name="ThankYouText", fontSize=8, fontName="Helvetica",
            textColor=EMERALD_LIGHT, leading=12,
        ))

    def format_currency(self, amount):
        val = _safe_float(amount, 0.0)
        negative = val < 0
        val = abs(val)
        whole = int(val)
        frac = f"{val - whole:.2f}"[1:]  # .XX (handles rounding carry cleanly below)
        rounded = round(val, 2)
        int_part, dec_part = f"{rounded:.2f}".split(".")
        if len(int_part) > 3:
            last3 = int_part[-3:]
            rest = int_part[:-3]
            groups = []
            while len(rest) > 2:
                groups.append(rest[-2:])
                rest = rest[:-2]
            if rest:
                groups.append(rest)
            formatted_int = ",".join(reversed(groups)) + "," + last3
        else:
            formatted_int = int_part
        sign = "-" if negative else ""
        return f"{sign}Rs. {formatted_int}.{dec_part}"

    def _status_colors(self, status: str):
        s = status.lower()
        if s == "paid":
            return EMERALD_SOFT_BG, EMERALD_SOFT_BORDER, "#34D399"
        if s == "overdue":
            return RED_BG, RED_BORDER, "#F87171"
        return AMBER_BG, AMBER_BORDER, "#FBBF24"

    def _pill_width(self, text: str, font_size: float, pad_h: int) -> float:
        return max(30.0, len(text) * (font_size * 0.56) + (pad_h * 2) + 4.0)

    def _make_pill(self, text: str, bg_color, border_color, text_hex: str, font_size: float = 7.5, pad_h: int = 7, pad_v: int = 2, bold: bool = False):
        style = ParagraphStyle(
            "DynamicPill",
            fontSize=font_size,
            fontName="Helvetica-Bold" if bold else "Helvetica",
            textColor=colors.HexColor(text_hex),
            alignment=TA_CENTER,
            leading=font_size + 2.5,
        )
        pill_w = self._pill_width(text, font_size, pad_h)
        t = Table([[Paragraph(xml_escape(text), style)]], colWidths=[pill_w])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), bg_color),
            ("BOX", (0, 0), (-1, -1), 0.75, border_color),
            ("LEFTPADDING", (0, 0), (-1, -1), pad_h),
            ("RIGHTPADDING", (0, 0), (-1, -1), pad_h),
            ("TOPPADDING", (0, 0), (-1, -1), pad_v),
            ("BOTTOMPADDING", (0, 0), (-1, -1), pad_v),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("ROUNDEDCORNERS", [7, 7, 7, 7]),
        ]))
        return t

    def _make_gstin_line(self, gstin_val: str):
        pill_w = self._pill_width(gstin_val, 7.5, 6)
        pill = self._make_pill(gstin_val, PILL_BG, BORDER_DARK, "#E2E8F0", font_size=7.5, pad_h=6, pad_v=1.5)
        row = Table([[Paragraph("GSTIN:", self.styles["MutedText"]), pill]], colWidths=[34, pill_w], hAlign="LEFT")
        row.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ]))
        return row

    def generate_pdf(self, invoice_data, business_profile, customer_data):
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=34,
            leftMargin=34,
            topMargin=28,
            bottomMargin=24,
        )
        elements = []

        b_name = _safe_str(business_profile.get("business_name"), "KrishiConnect Merchant")
        b_type = _safe_str(business_profile.get("business_type"), "Agricultural Producer")
        b_addr = _safe_str(business_profile.get("address"), "")
        b_gst = _safe_str(business_profile.get("gst_number"), "N/A (Unregistered)")
        b_phone = _safe_str(business_profile.get("phone"), "")

        c_data = customer_data or invoice_data.get("customer") or {}
        c_name = _safe_str(c_data.get("name"), "Walk-in Customer")
        c_addr = _safe_str(c_data.get("address"), "")
        c_gst = _safe_str(c_data.get("gst_number"), "N/A")
        c_phone = _safe_str(c_data.get("phone"), "")

        inv_num = _safe_str(invoice_data.get("invoice_number"), "INV-0001")
        inv_date = _format_display_date(invoice_data.get("date"))
        due_date = _format_display_date(invoice_data.get("due_date") or invoice_data.get("date"))
        status_str = _safe_str(invoice_data.get("status"), "unpaid").lower()
        is_paid = status_str == "paid"
        st_bg, st_border, st_hex = self._status_colors(status_str)
        pay_mode = _safe_str(invoice_data.get("payment_method"), "UPI").upper()

        # Header Brand + Status Pill + Meta Card
        status_pill = self._make_pill(status_str, st_bg, st_border, st_hex, font_size=7.5, pad_h=8, pad_v=2, bold=True)
        pill_w = self._pill_width(status_str, 7.5, 8)
        name_w = min(215.0, max(75.0, len(b_name) * 9.0 + 10.0))
        title_row = Table(
            [[Paragraph(f"<b>{xml_escape(b_name)}</b>", self.styles["BrandName"]), status_pill]],
            colWidths=[name_w, pill_w],
            hAlign="LEFT",
        )
        title_row.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (0, 0), 0),
            ("RIGHTPADDING", (0, 0), (0, 0), 8),
            ("LEFTPADDING", (1, 0), (1, 0), 0),
            ("RIGHTPADDING", (1, 0), (1, 0), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ]))

        brand_block = [
            title_row,
            Paragraph(xml_escape(b_type), self.styles["MutedText"]),
            Paragraph("Retail Tax Invoice", self.styles["EmeraldLabel"]),
        ]

        left_brand = Table([[_build_bag_icon(38), brand_block]], colWidths=[48, 265])
        left_brand.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ]))

        meta_card = Table(
            [
                [Paragraph("INVOICE NUMBER", self.styles["EyebrowRight"])],
                [Paragraph(f"#{xml_escape(inv_num)}", self.styles["InvNumber"])],
                [Paragraph(f"<font color='#64748B'>Issue Date:</font> &nbsp; {xml_escape(inv_date)}", self.styles["MetaRight"])],
                [Paragraph(f"<font color='#64748B'>Due Date:</font> &nbsp; {xml_escape(due_date)}", self.styles["MetaRight"])],
            ],
            colWidths=[195],
        )
        meta_card.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), META_BG),
            ("BOX", (0, 0), (-1, -1), 1, BORDER_DARK),
            ("TOPPADDING", (0, 0), (-1, 0), 8),
            ("BOTTOMPADDING", (0, -1), (-1, -1), 8),
            ("TOPPADDING", (0, 1), (-1, -1), 2),
            ("BOTTOMPADDING", (0, 0), (-1, -2), 2),
            ("LEFTPADDING", (0, 0), (-1, -1), 12),
            ("RIGHTPADDING", (0, 0), (-1, -1), 12),
            ("ROUNDEDCORNERS", [8, 8, 8, 8]),
        ]))

        header_tbl = Table([[left_brand, meta_card]], colWidths=[312, 215])
        header_tbl.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ]))
        elements.append(header_tbl)
        elements.append(Spacer(1, 14))
        elements.append(HRFlowable(width="100%", thickness=1, color=BORDER_DARK, spaceAfter=14))

        # Billed By / Billed To Parties Section
        by_flow = [
            Paragraph("BILLED BY (MERCHANT)", self.styles["Eyebrow"]),
            Spacer(1, 4),
            Paragraph(xml_escape(b_name), self.styles["PartyName"]),
            Spacer(1, 3),
            self._make_gstin_line(b_gst),
        ]
        if b_addr:
            by_flow.extend([Spacer(1, 3), Paragraph(xml_escape(b_addr), self.styles["MutedText"])])
        if b_phone:
            by_flow.append(Paragraph(f"Ph: {xml_escape(b_phone)}", self.styles["MutedText"]))

        to_flow = [
            Paragraph("BILLED TO (CUSTOMER)", self.styles["Eyebrow"]),
            Spacer(1, 4),
            Paragraph(xml_escape(c_name), self.styles["PartyName"]),
            Spacer(1, 3),
            self._make_gstin_line(c_gst),
        ]
        if c_addr:
            to_flow.extend([Spacer(1, 3), Paragraph(xml_escape(c_addr), self.styles["MutedText"])])
        if c_phone:
            to_flow.append(Paragraph(f"Ph: {xml_escape(c_phone)}", self.styles["MutedText"]))

        parties_tbl = Table([[by_flow, to_flow]], colWidths=[263, 264])
        parties_tbl.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LINEAFTER", (0, 0), (0, -1), 0.75, BORDER_SUBTLE),
            ("LEFTPADDING", (0, 0), (0, -1), 0),
            ("RIGHTPADDING", (0, 0), (0, -1), 14),
            ("LEFTPADDING", (1, 0), (1, -1), 16),
            ("RIGHTPADDING", (1, 0), (1, -1), 0),
        ]))
        elements.append(parties_tbl)
        elements.append(Spacer(1, 14))
        elements.append(HRFlowable(width="100%", thickness=1, color=BORDER_DARK, spaceAfter=14))

        # Items Table
        t_rows = [[
            Paragraph("#", self.styles["TableHeader"]),
            Paragraph("DESCRIPTION", self.styles["TableHeader"]),
            Paragraph("QTY", self.styles["TableHeaderCenter"]),
            Paragraph("PRICE", self.styles["TableHeaderRight"]),
            Paragraph("GST %", self.styles["TableHeaderCenter"]),
            Paragraph("TOTAL", self.styles["TableHeaderRight"]),
        ]]

        for idx, item in enumerate(invoice_data.get("items") or []):
            qty = _safe_float(item.get("quantity"), 0.0)
            price = _safe_float(item.get("unit_price"), 0.0)
            gst_r = _safe_float(item.get("gst_rate"), 0.0)
            base_amt = qty * price
            row_tot = base_amt + base_amt * (gst_r / 100.0)
            qty_str = str(int(qty)) if qty == int(qty) else f"{qty:.2f}"
            gst_str = str(int(gst_r)) if gst_r == int(gst_r) else f"{gst_r:.1f}"
            gst_pill = self._make_pill(
                f"{gst_str}%", PILL_BG, PILL_BORDER, "#E2E8F0", font_size=7.5, pad_h=6, pad_v=1.5
            )

            t_rows.append([
                Paragraph(f"{idx + 1:02d}", self.styles["CellIndex"]),
                Paragraph(xml_escape(_safe_str(item.get("description"), "Item")), self.styles["CellBold"]),
                Paragraph(qty_str, self.styles["CellCenter"]),
                Paragraph(self.format_currency(price), self.styles["CellRight"]),
                gst_pill,
                Paragraph(self.format_currency(row_tot), self.styles["CellRightBold"]),
            ])

        items_tbl = Table(t_rows, colWidths=[30, 207, 50, 88, 56, 96])
        items_tbl.setStyle(TableStyle([
            ("LINEBELOW", (0, 0), (-1, 0), 1, BORDER_DARK),
            ("LINEBELOW", (0, 1), (-1, -1), 0.75, BORDER_SUBTLE),
            ("TOPPADDING", (0, 0), (-1, 0), 4),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
            ("TOPPADDING", (0, 1), (-1, -1), 9),
            ("BOTTOMPADDING", (0, 1), (-1, -1), 9),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("ALIGN", (4, 1), (4, -1), "CENTER"),
            ("LEFTPADDING", (0, 0), (-1, -1), 4),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ]))
        elements.append(items_tbl)
        elements.append(Spacer(1, 20))

        # Totals & Tax Calculation
        subtotal = _safe_float(invoice_data.get("subtotal"), 0.0)
        gst_total = _safe_float(invoice_data.get("gst_total"), 0.0)
        cgst = gst_total / 2.0
        sgst = gst_total / 2.0
        grand_total = _safe_float(invoice_data.get("grand_total"), 0.0)
        disc_val = _safe_float(invoice_data.get("discount_value"), 0.0)
        disc_type = _safe_str(invoice_data.get("discount_type"), "")
        disc_amt = ((subtotal + gst_total) * disc_val / 100.0) if (disc_val > 0 and disc_type == "percentage") else disc_val

        eff_gst = (gst_total / subtotal * 100.0) if subtotal > 0 else 0.0
        half_gst_label = f"{eff_gst / 2.0:.1f}"
        eff_gst_rounded = round(eff_gst)

        # Bottom Left: Payment Details Box + Thank You Box
        badge_hex = "#34D399" if is_paid else "#FBBF24"
        badge_bg = EMERALD_SOFT_BG if is_paid else AMBER_BG
        badge_border = EMERALD_SOFT_BORDER if is_paid else AMBER_BORDER
        badge_text = "VERIFIED" if is_paid else "PENDING"
        settled_text = "Fully Settled" if is_paid else "Pending Balance"
        verified_pill = self._make_pill(
            badge_text, badge_bg, badge_border, badge_hex, font_size=6.5, pad_h=7, pad_v=2, bold=True
        )
        v_pill_wrap = Table([[verified_pill]], colWidths=[130], hAlign="RIGHT")
        v_pill_wrap.setStyle(TableStyle([
            ("ALIGN", (0, 0), (0, 0), "RIGHT"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ]))

        payment_box = Table(
            [
                [
                    Paragraph("PAYMENT DETAILS", self.styles["Eyebrow"]),
                    v_pill_wrap,
                ],
                [
                    Paragraph("Payment Mode", self.styles["MutedText"]),
                    Paragraph("Transaction Status", self.styles["MutedText"]),
                ],
                [
                    Paragraph(xml_escape(pay_mode), self.styles["PaymentValue"]),
                    Paragraph(f"<font color='{badge_hex}'><b>{settled_text}</b></font>", self.styles["PaymentValue"]),
                ],
                [
                    Paragraph(
                        f"* Effective GST rate of {eff_gst_rounded}% includes CGST + SGST as applicable.",
                        ParagraphStyle("GSTNote", fontSize=7.2, textColor=TEXT_MUTED, leading=11),
                    ),
                    "",
                ],
            ],
            colWidths=[125, 130],
        )
        payment_box.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), PANEL_BG),
            ("BOX", (0, 0), (-1, -1), 1, BORDER_DARK),
            ("SPAN", (0, 3), (1, 3)),
            ("ALIGN", (1, 0), (1, 0), "RIGHT"),
            ("VALIGN", (0, 0), (-1, 0), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, 0), 11),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
            ("TOPPADDING", (0, 1), (-1, 1), 2),
            ("BOTTOMPADDING", (0, 1), (-1, 1), 1),
            ("TOPPADDING", (0, 2), (-1, 2), 1),
            ("BOTTOMPADDING", (0, 2), (-1, 2), 8),
            ("TOPPADDING", (0, 3), (-1, 3), 2),
            ("BOTTOMPADDING", (0, 3), (-1, 3), 11),
            ("LEFTPADDING", (0, 0), (-1, -1), 12),
            ("RIGHTPADDING", (0, 0), (-1, -1), 12),
            ("ROUNDEDCORNERS", [8, 8, 8, 8]),
        ]))

        thank_you_box = Table(
            [[
                _build_thumbs_up_icon(14),
                Paragraph(f"Thank you for shopping with <font color='#FFFFFF'><b>{xml_escape(b_name)}</b></font>!", self.styles["ThankYouText"]),
            ]],
            colWidths=[22, 233],
        )
        thank_you_box.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), THANK_YOU_BG),
            ("BOX", (0, 0), (-1, -1), 1, THANK_YOU_BORDER),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 9),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
            ("LEFTPADDING", (0, 0), (0, -1), 11),
            ("RIGHTPADDING", (0, 0), (0, -1), 2),
            ("LEFTPADDING", (1, 0), (1, -1), 4),
            ("RIGHTPADDING", (1, 0), (1, -1), 12),
            ("ROUNDEDCORNERS", [7, 7, 7, 7]),
        ]))

        left_col_tbl = Table([[payment_box], [Spacer(1, 10)], [thank_you_box]], colWidths=[255])
        left_col_tbl.setStyle(TableStyle([
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ]))

        # Bottom Right: Totals & Emerald Grand Total & Amount in Words
        tot_rows = [
            [Paragraph("Subtotal (Base Price)", self.styles["SummaryLabel"]),
             Paragraph(self.format_currency(subtotal), self.styles["SummaryRight"])],
            [Paragraph(f"CGST ({half_gst_label}%)", self.styles["SummaryLabel"]),
             Paragraph(self.format_currency(cgst), self.styles["SummaryRight"])],
            [Paragraph(f"SGST ({half_gst_label}%)", self.styles["SummaryLabel"]),
             Paragraph(self.format_currency(sgst), self.styles["SummaryRight"])],
        ]
        if disc_amt > 0:
            tot_rows.append([
                Paragraph("Discount", self.styles["SummaryLabel"]),
                Paragraph(f"<font color='#F87171'>-{self.format_currency(disc_amt)}</font>", self.styles["SummaryRight"]),
            ])

        tot_rows.append([
            [
                Paragraph("GRAND TOTAL", self.styles["GrandTotalLabel"]),
                Paragraph("<font size='7.2' color='#94A3B8'>Inclusive of all taxes</font>", self.styles["MutedText"]),
            ],
            Paragraph(self.format_currency(grand_total), self.styles["GrandTotalAmount"]),
        ])

        totals_tbl = Table(tot_rows, colWidths=[118, 122])
        totals_tbl.setStyle(TableStyle([
            ("TOPPADDING", (0, 0), (-1, -2), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -2), 3),
            ("LINEABOVE", (0, -1), (-1, -1), 0.75, BORDER_DARK),
            ("TOPPADDING", (0, -1), (-1, -1), 10),
            ("BOTTOMPADDING", (0, -1), (-1, -1), 8),
            ("VALIGN", (0, -1), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ]))

        words_tbl = Table(
            [
                [Paragraph("AMOUNT IN WORDS", self.styles["EyebrowRight"])],
                [Paragraph(xml_escape(amount_in_words(grand_total)), self.styles["WordsItalic"])],
            ],
            colWidths=[240],
        )
        words_tbl.setStyle(TableStyle([
            ("TOPPADDING", (0, 0), (-1, -1), 2),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ]))

        right_col_tbl = Table([[totals_tbl], [Spacer(1, 8)], [words_tbl]], colWidths=[240])
        right_col_tbl.setStyle(TableStyle([
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ]))

        split_tbl = Table([[left_col_tbl, "", right_col_tbl]], colWidths=[255, 32, 240])
        split_tbl.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ]))
        elements.append(split_tbl)

        notes = _safe_str(invoice_data.get("notes"), "")
        terms = _safe_str(invoice_data.get("terms"), "")
        if notes or terms:
            elements.append(Spacer(1, 16))
            elements.append(HRFlowable(width="100%", thickness=0.75, color=BORDER_SUBTLE, spaceAfter=8))
            footer_cols = [
                [
                    Paragraph("NOTES", self.styles["Eyebrow"]) if notes else Paragraph("", self.styles["MutedText"]),
                    Paragraph(xml_escape(notes), self.styles["MutedText"]) if notes else Paragraph("", self.styles["MutedText"]),
                ],
                [
                    Paragraph("TERMS &amp; CONDITIONS", self.styles["Eyebrow"]) if terms else Paragraph("", self.styles["MutedText"]),
                    Paragraph(xml_escape(terms), self.styles["MutedText"]) if terms else Paragraph("", self.styles["MutedText"]),
                ],
            ]
            footer_tbl = Table([[footer_cols[0], footer_cols[1]]], colWidths=[263, 264])
            footer_tbl.setStyle(TableStyle([
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ]))
            elements.append(footer_tbl)

        doc.build(elements, onFirstPage=draw_top_bar, onLaterPages=draw_top_bar)
        buffer.seek(0)
        return buffer


def generate_invoice_pdf(invoice_data, business_profile, customer_data=None):
    inv_dict = _extract_invoice_dict(invoice_data)
    prof_dict = _extract_profile_dict(business_profile)
    cust_dict = _extract_customer_dict(customer_data) if customer_data is not None else inv_dict.get("customer", {})

    service = PDFInvoiceService()
    return service.generate_pdf(inv_dict, prof_dict, cust_dict)
