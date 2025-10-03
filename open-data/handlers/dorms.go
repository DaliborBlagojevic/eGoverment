package handlers

import (
	"bytes"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"open-data/upstream"

	"github.com/gin-gonic/gin"
	"github.com/jung-kurt/gofpdf"
)

type DormsHandler struct {
	Housing *upstream.HousingClient
}

func NewDormsHandler(hc *upstream.HousingClient) *DormsHandler {
	return &DormsHandler{Housing: hc}
}

/* ========================== DORMS (real) ========================== */

func (h *DormsHandler) ListDorms(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))

	resp, err := h.Housing.ListDorms(c.Request.Context(), page, size)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "upstream error", "details": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"items": resp.Items, "pagination": resp.Pagination})
}

func (h *DormsHandler) DormsPDF(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("pageSize", "50"))
	download := c.Query("download") == "1"

	resp, err := h.Housing.ListDorms(c.Request.Context(), page, size)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "upstream error", "details": err.Error()})
		return
	}

	pdf := newPDF("Available Dorms")

	wName, wAddr := 70.0, 40.0
	hRow := 8.0
	pdf.SetFillColor(240, 240, 240)
	pdf.CellFormat(wName, hRow, "Name", "1", 0, "L", true, 0, "")
	pdf.CellFormat(wAddr, hRow, "Address", "1", 0, "L", true, 0, "")

	pdf.Ln(-1)
	pdf.SetFont("Helvetica", "", 10)

	for _, d := range resp.Items {
		name := truncate(pdf, d.Naziv, wName-2)
		addr := truncate(pdf, d.Adresa, wAddr-2)

		pdf.CellFormat(wName, hRow, name, "1", 0, "L", false, 0, "")
		pdf.CellFormat(wAddr, hRow, addr, "1", 0, "L", false, 0, "")
		pdf.Ln(-1)
	}

	addFooter(pdf, resp.Pagination)
	writePDFResponse(c, pdf, fmt.Sprintf("dorms_%s.pdf", nowSlug()), download)
}

/* ========================== STUDENTS (fake PDF) ========================== */

func (h *DormsHandler) ListStudents(c *gin.Context) {
	// Ostavili smo JSON endpoint ako ti treba real, ali frontend ga ne koristi.
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))
	resp, err := h.Housing.ListStudents(c.Request.Context(), page, size)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "upstream error", "details": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"items": resp.Items, "pagination": resp.Pagination})
}

func (h *DormsHandler) StudentsPDF(c *gin.Context) {
	download := c.Query("download") == "1"

	pdf := newPDF("Students")
	wFirst, wLast, wEmail, wIndex, wFaculty := 30.0, 35.0, 60.0, 25.0, 35.0
	hRow := 8.0

	headerRow(pdf,
		[]float64{wFirst, wLast, wEmail, wIndex, wFaculty},
		[]string{"First Name", "Last Name", "Email", "Index", "Faculty"},
	)

	rows := []struct {
		First, Last, Email, Index, Faculty string
	}{
		{"Ana", "Jovanović", "ana@example.com", "E123/2021", "ETF"},
		{"Marko", "Petrović", "marko@example.com", "E456/2020", "Matematika"},
		{"Ivana", "Milić", "ivana@example.com", "E789/2022", "FON"},
		{"Luka", "Nikolić", "luka@example.com", "E012/2023", "FTN"},
	}

	for _, r := range rows {
		row(pdf, hRow,
			[]float64{wFirst, wLast, wEmail, wIndex, wFaculty},
			[]string{
				truncate(pdf, r.First, wFirst-2),
				truncate(pdf, r.Last, wLast-2),
				truncate(pdf, r.Email, wEmail-2),
				truncate(pdf, r.Index, wIndex-2),
				truncate(pdf, r.Faculty, wFaculty-2),
			},
		)
	}

	addFooter(pdf, upstreamPaginationMock())
	writePDFResponse(c, pdf, fmt.Sprintf("students_%s.pdf", nowSlug()), download)
}

/* ========================== PRICE PLANS (fake PDF) ========================== */

func (h *DormsHandler) ListPricePlans(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))
	resp, err := h.Housing.ListPricePlans(c.Request.Context(), page, size)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "upstream error", "details": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"items": resp.Items, "pagination": resp.Pagination})
}

func (h *DormsHandler) PricePlansPDF(c *gin.Context) {
	download := c.Query("download") == "1"

	pdf := newPDF("Price Plans")
	wDom, wRoom, wMonthly, wCurr, wUpd := 35.0, 30.0, 30.0, 20.0, 60.0
	hRow := 8.0

	headerRow(pdf,
		[]float64{wDom, wRoom, wMonthly, wCurr, wUpd},
		[]string{"Dom ID", "Room Type", "Monthly", "Currency", "Updated At"},
	)

	now := time.Now().UTC().Format(time.RFC3339)
	rows := []struct {
		Dom, Room, Curr, Upd string
		Monthly              float64
	}{
		{"d1", "single", "RSD", now, 18500},
		{"d1", "double", "RSD", now, 14500},
		{"d2", "single", "RSD", now, 21000},
		{"d2", "triple", "RSD", now, 12000},
	}

	for _, r := range rows {
		row(pdf, hRow,
			[]float64{wDom, wRoom, wMonthly, wCurr, wUpd},
			[]string{
				truncate(pdf, r.Dom, wDom-2),
				truncate(pdf, r.Room, wRoom-2),
				fmt.Sprintf("%.2f", r.Monthly),
				r.Curr,
				truncate(pdf, r.Upd, wUpd-2),
			},
		)
	}

	addFooter(pdf, upstreamPaginationMock())
	writePDFResponse(c, pdf, fmt.Sprintf("price_plans_%s.pdf", nowSlug()), download)
}

/* ========================== DAILY AVAILABILITY (fake PDF) ========================== */

func (h *DormsHandler) ListDailyAvailability(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))
	resp, err := h.Housing.ListDailyAvailability(c.Request.Context(), page, size)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "upstream error", "details": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"items": resp.Items, "pagination": resp.Pagination})
}

func (h *DormsHandler) DailyAvailabilityPDF(c *gin.Context) {
	download := c.Query("download") == "1"

	pdf := newPDF("Daily Availability")
	wDom, wDate, wTotal, wFree := 50.0, 40.0, 40.0, 40.0
	hRow := 8.0

	headerRow(pdf,
		[]float64{wDom, wDate, wTotal, wFree},
		[]string{"Dom ID", "Date", "Total Beds", "Free Beds"},
	)

	rows := []struct {
		Dom  string
		Date string
		Tot  int
		Free int
	}{
		{"d1", today(0), 120, 18},
		{"d1", today(1), 120, 12},
		{"d2", today(0), 95, 7},
		{"d2", today(1), 95, 5},
	}

	for _, r := range rows {
		row(pdf, hRow,
			[]float64{wDom, wDate, wTotal, wFree},
			[]string{
				truncate(pdf, r.Dom, wDom-2),
				r.Date,
				fmt.Sprintf("%d", r.Tot),
				fmt.Sprintf("%d", r.Free),
			},
		)
	}

	addFooter(pdf, upstreamPaginationMock())
	writePDFResponse(c, pdf, fmt.Sprintf("daily_availability_%s.pdf", nowSlug()), download)
}

/* ========================== APPLICATION STATS (fake PDF) ========================== */

func (h *DormsHandler) ListApplicationStats(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))
	resp, err := h.Housing.ListApplicationStats(c.Request.Context(), page, size)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "upstream error", "details": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"items": resp.Items, "pagination": resp.Pagination})
}

func (h *DormsHandler) ApplicationStatsPDF(c *gin.Context) {
	download := c.Query("download") == "1"

	pdf := newPDF("Application Stats")
	wDom, wDate, wPred, wPrih, wOdb, wRez := 35.0, 30.0, 25.0, 25.0, 25.0, 30.0
	hRow := 8.0

	headerRow(pdf,
		[]float64{wDom, wDate, wPred, wPrih, wOdb, wRez},
		[]string{"Dom ID", "Date", "Predate", "Prihvacene", "Odbijene", "Rezervisane"},
	)

	rows := []struct {
		Dom, Date         string
		Pred, Acc, Rej, Res int
	}{
		{"d1", today(0), 12, 6, 3, 2},
		{"d1", today(1), 9, 4, 2, 1},
		{"d2", today(0), 7, 3, 2, 1},
		{"d2", today(1), 11, 5, 3, 2},
	}

	for _, r := range rows {
		row(pdf, hRow,
			[]float64{wDom, wDate, wPred, wPrih, wOdb, wRez},
			[]string{
				truncate(pdf, r.Dom, wDom-2),
				r.Date,
				fmt.Sprintf("%d", r.Pred),
				fmt.Sprintf("%d", r.Acc),
				fmt.Sprintf("%d", r.Rej),
				fmt.Sprintf("%d", r.Res),
			},
		)
	}

	addFooter(pdf, upstreamPaginationMock())
	writePDFResponse(c, pdf, fmt.Sprintf("application_stats_%s.pdf", nowSlug()), download)
}

/* ========================== PAYMENT STATS (fake PDF) ========================== */

func (h *DormsHandler) ListPaymentStats(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))
	resp, err := h.Housing.ListPaymentStats(c.Request.Context(), page, size)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "upstream error", "details": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"items": resp.Items, "pagination": resp.Pagination})
}

func (h *DormsHandler) PaymentStatsPDF(c *gin.Context) {
	download := c.Query("download") == "1"

	pdf := newPDF("Payment Stats")
	wDom, wDate, wCount, wSum, wCurr := 35.0, 30.0, 25.0, 35.0, 25.0
	hRow := 8.0

	headerRow(pdf,
		[]float64{wDom, wDate, wCount, wSum, wCurr},
		[]string{"Dom ID", "Date", "Count", "Sum", "Currency"},
	)

	rows := []struct {
		Dom, Date, Curr string
		Count           int
		Sum             float64
	}{
		{"d1", today(0), "RSD", 5, 72500},
		{"d1", today(1), "RSD", 4, 58000},
		{"d2", today(0), "RSD", 3, 41000},
		{"d2", today(1), "RSD", 2, 28500},
	}

	for _, r := range rows {
		row(pdf, hRow,
			[]float64{wDom, wDate, wCount, wSum, wCurr},
			[]string{
				truncate(pdf, r.Dom, wDom-2),
				r.Date,
				fmt.Sprintf("%d", r.Count),
				fmt.Sprintf("%.2f", r.Sum),
				r.Curr,
			},
		)
	}

	addFooter(pdf, upstreamPaginationMock())
	writePDFResponse(c, pdf, fmt.Sprintf("payment_stats_%s.pdf", nowSlug()), download)
}

/* ========================== Shared helpers ========================== */

func newPDF(title string) *gofpdf.Fpdf {
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.SetTitle(title, false)
	pdf.SetAuthor("Open Data Service", false)
	pdf.SetAutoPageBreak(true, 15)

	pdf.AddPage()
	pdf.SetFont("Helvetica", "B", 16)
	pdf.Cell(0, 10, title)
	pdf.Ln(8)

	pdf.SetFont("Helvetica", "", 10)
	pdf.SetTextColor(100, 100, 100)
	pdf.Cell(0, 6, time.Now().Format("2006-01-02 15:04"))
	pdf.Ln(10)

	pdf.SetTextColor(0, 0, 0)
	pdf.SetFont("Helvetica", "B", 11)
	return pdf
}

func addFooter(pdf *gofpdf.Fpdf, p upstream.Pagination) {
	pdf.Ln(2)
	pdf.SetFont("Helvetica", "I", 9)
	pdf.Cell(0, 6, fmt.Sprintf("Page %d, pageSize %d, total %d", p.Page, p.PageSize, p.TotalCount))
}

func headerRow(pdf *gofpdf.Fpdf, widths []float64, labels []string) {
	pdf.SetFillColor(240, 240, 240)
	for i, w := range widths {
		pdf.CellFormat(w, 8.0, labels[i], "1", 0, "L", true, 0, "")
	}
	pdf.Ln(-1)
	pdf.SetFont("Helvetica", "", 10)
}

func row(pdf *gofpdf.Fpdf, h float64, widths []float64, cols []string) {
	for i, w := range widths {
		pdf.CellFormat(w, h, cols[i], "1", 0, "L", false, 0, "")
	}
	pdf.Ln(-1)
}

func truncate(pdf *gofpdf.Fpdf, s string, maxW float64) string {
	if s == "" {
		return ""
	}
	orig := s
	for pdf.GetStringWidth(s) > maxW && len(s) > 0 {
		s = s[:len(s)-1]
	}
	if s != orig {
		if pdf.GetStringWidth(s+"...") <= maxW {
			return s + "..."
		}
	}
	return s
}

func writePDFResponse(c *gin.Context, pdf *gofpdf.Fpdf, filename string, download bool) {
	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to render pdf"})
		return
	}
	disp := "inline"
	if download {
		disp = "attachment"
	}
	c.Header("Content-Type", "application/pdf")
	c.Header("Content-Disposition", fmt.Sprintf("%s; filename=%q", disp, filename))
	c.Data(http.StatusOK, "application/pdf", buf.Bytes())
}

func nowSlug() string {
	return time.Now().Format("20060102_1504")
}

func upstreamPaginationMock() upstream.Pagination {
	return upstream.Pagination{Page: 1, PageSize: 50, TotalCount: 4}
}

func today(addDays int) string {
	return time.Now().AddDate(0, 0, addDays).UTC().Format("2006-01-02")
}
