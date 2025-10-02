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

// --------- DORMS ---------

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

	// header tabele
	wName, wAddr, wCity, wWebsite := 70.0, 40.0, 25.0, 55.0
	hRow := 8.0
	pdf.SetFillColor(240, 240, 240)
	pdf.CellFormat(wName, hRow, "Name", "1", 0, "L", true, 0, "")
	pdf.CellFormat(wAddr, hRow, "Address", "1", 0, "L", true, 0, "")
	pdf.CellFormat(wCity, hRow, "City", "1", 0, "L", true, 0, "")
	pdf.CellFormat(wWebsite, hRow, "Website", "1", 0, "L", true, 0, "")
	pdf.Ln(-1)
	pdf.SetFont("Helvetica", "", 10)

	for _, d := range resp.Items {
		name := truncate(pdf, d.Naziv, wName-2)
		addr := truncate(pdf, d.Adresa, wAddr-2)
		city := truncate(pdf, d.Grad, wCity-2)
		web := truncate(pdf, d.Website, wWebsite-2)

		pdf.CellFormat(wName, hRow, name, "1", 0, "L", false, 0, "")
		pdf.CellFormat(wAddr, hRow, addr, "1", 0, "L", false, 0, "")
		pdf.CellFormat(wCity, hRow, city, "1", 0, "L", false, 0, "")
		pdf.CellFormat(wWebsite, hRow, web, "1", 0, "L", false, 0, "")
		pdf.Ln(-1)
	}

	addFooter(pdf, resp.Pagination)
	writePDFResponse(c, pdf, fmt.Sprintf("dorms_%s.pdf", nowSlug()), download)
}

// --------- STUDENTS ---------

func (h *DormsHandler) ListStudents(c *gin.Context) {
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
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("pageSize", "50"))
	download := c.Query("download") == "1"

	resp, err := h.Housing.ListStudents(c.Request.Context(), page, size)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "upstream error", "details": err.Error()})
		return
	}

	pdf := newPDF("Students")
	wFirst, wLast, wEmail, wIndex, wFaculty := 30.0, 35.0, 60.0, 25.0, 35.0
	hRow := 8.0

	pdf.SetFillColor(240, 240, 240)
	pdf.CellFormat(wFirst, hRow, "First Name", "1", 0, "L", true, 0, "")
	pdf.CellFormat(wLast, hRow, "Last Name", "1", 0, "L", true, 0, "")
	pdf.CellFormat(wEmail, hRow, "Email", "1", 0, "L", true, 0, "")
	pdf.CellFormat(wIndex, hRow, "Index", "1", 0, "L", true, 0, "")
	pdf.CellFormat(wFaculty, hRow, "Faculty", "1", 0, "L", true, 0, "")
	pdf.Ln(-1)
	pdf.SetFont("Helvetica", "", 10)

	for _, s := range resp.Items {
		pdf.CellFormat(wFirst, hRow, truncate(pdf, s.FirstName, wFirst-2), "1", 0, "L", false, 0, "")
		pdf.CellFormat(wLast, hRow, truncate(pdf, s.LastName, wLast-2), "1", 0, "L", false, 0, "")
		pdf.CellFormat(wEmail, hRow, truncate(pdf, s.Email, wEmail-2), "1", 0, "L", false, 0, "")
		pdf.CellFormat(wIndex, hRow, truncate(pdf, s.Index, wIndex-2), "1", 0, "L", false, 0, "")
		pdf.CellFormat(wFaculty, hRow, truncate(pdf, s.Faculty, wFaculty-2), "1", 0, "L", false, 0, "")
		pdf.Ln(-1)
	}

	addFooter(pdf, resp.Pagination)
	writePDFResponse(c, pdf, fmt.Sprintf("students_%s.pdf", nowSlug()), download)
}

// --------- PRICE PLANS ---------

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
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("pageSize", "50"))
	download := c.Query("download") == "1"

	resp, err := h.Housing.ListPricePlans(c.Request.Context(), page, size)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "upstream error", "details": err.Error()})
		return
	}

	pdf := newPDF("Price Plans")
	wDom, wRoom, wMonthly, wCurr, wUpd := 35.0, 30.0, 30.0, 20.0, 60.0
	hRow := 8.0

	headerRow(pdf,
		[]float64{wDom, wRoom, wMonthly, wCurr, wUpd},
		[]string{"Dom ID", "Room Type", "Monthly", "Currency", "Updated At"},
	)

	for _, r := range resp.Items {
		row(pdf, hRow,
			[]float64{wDom, wRoom, wMonthly, wCurr, wUpd},
			[]string{
				truncate(pdf, r.DomID, wDom-2),
				truncate(pdf, r.RoomType, wRoom-2),
				fmt.Sprintf("%.2f", r.Monthly),
				r.Currency,
				truncate(pdf, r.UpdatedAt, wUpd-2),
			},
		)
	}

	addFooter(pdf, resp.Pagination)
	writePDFResponse(c, pdf, fmt.Sprintf("price_plans_%s.pdf", nowSlug()), download)
}

// --------- DAILY AVAILABILITY ---------

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
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("pageSize", "50"))
	download := c.Query("download") == "1"

	resp, err := h.Housing.ListDailyAvailability(c.Request.Context(), page, size)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "upstream error", "details": err.Error()})
		return
	}

	pdf := newPDF("Daily Availability")
	wDom, wDate, wTotal, wFree := 50.0, 40.0, 40.0, 40.0
	hRow := 8.0

	headerRow(pdf,
		[]float64{wDom, wDate, wTotal, wFree},
		[]string{"Dom ID", "Date", "Total Beds", "Free Beds"},
	)

	for _, r := range resp.Items {
		row(pdf, hRow,
			[]float64{wDom, wDate, wTotal, wFree},
			[]string{
				truncate(pdf, r.DomID, wDom-2),
				r.Date,
				fmt.Sprintf("%d", r.TotalBeds),
				fmt.Sprintf("%d", r.FreeBeds),
			},
		)
	}

	addFooter(pdf, resp.Pagination)
	writePDFResponse(c, pdf, fmt.Sprintf("daily_availability_%s.pdf", nowSlug()), download)
}

// --------- APPLICATION STATS ---------

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
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("pageSize", "50"))
	download := c.Query("download") == "1"

	resp, err := h.Housing.ListApplicationStats(c.Request.Context(), page, size)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "upstream error", "details": err.Error()})
		return
	}

	pdf := newPDF("Application Stats")
	wDom, wDate, wPred, wPrih, wOdb, wRez := 35.0, 30.0, 25.0, 25.0, 25.0, 30.0
	hRow := 8.0

	headerRow(pdf,
		[]float64{wDom, wDate, wPred, wPrih, wOdb, wRez},
		[]string{"Dom ID", "Date", "Predate", "Prihvacene", "Odbijene", "Rezervisane"},
	)

	for _, r := range resp.Items {
		row(pdf, hRow,
			[]float64{wDom, wDate, wPred, wPrih, wOdb, wRez},
			[]string{
				truncate(pdf, r.DomID, wDom-2),
				r.Date,
				fmt.Sprintf("%d", r.Predate),
				fmt.Sprintf("%d", r.Prihvacene),
				fmt.Sprintf("%d", r.Odbijene),
				fmt.Sprintf("%d", r.Rezervisane),
			},
		)
	}

	addFooter(pdf, resp.Pagination)
	writePDFResponse(c, pdf, fmt.Sprintf("application_stats_%s.pdf", nowSlug()), download)
}

// --------- PAYMENT STATS ---------

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
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("pageSize", "50"))
	download := c.Query("download") == "1"

	resp, err := h.Housing.ListPaymentStats(c.Request.Context(), page, size)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "upstream error", "details": err.Error()})
		return
	}

	pdf := newPDF("Payment Stats")
	wDom, wDate, wCount, wSum, wCurr := 35.0, 30.0, 25.0, 35.0, 25.0
	hRow := 8.0

	headerRow(pdf,
		[]float64{wDom, wDate, wCount, wSum, wCurr},
		[]string{"Dom ID", "Date", "Count", "Sum", "Currency"},
	)

	for _, r := range resp.Items {
		row(pdf, hRow,
			[]float64{wDom, wDate, wCount, wSum, wCurr},
			[]string{
				truncate(pdf, r.DomID, wDom-2),
				r.Date,
				fmt.Sprintf("%d", r.Count),
				fmt.Sprintf("%.2f", r.Sum),
				r.Currency,
			},
		)
	}

	addFooter(pdf, resp.Pagination)
	writePDFResponse(c, pdf, fmt.Sprintf("payment_stats_%s.pdf", nowSlug()), download)
}

// -------------------- UTILS --------------------

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

// skraćivanje teksta da stane u ćeliju
func truncate(pdf *gofpdf.Fpdf, s string, maxW float64) string {
	for pdf.GetStringWidth(s) > maxW && len(s) > 0 {
		if len(s) > 1 {
			s = s[:len(s)-1]
		} else {
			break
		}
	}
	if pdf.GetStringWidth(s+"…") <= maxW {
		return s + "…"
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
