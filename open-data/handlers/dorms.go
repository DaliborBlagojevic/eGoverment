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

// GET /api/opendata/dorms?page=&pageSize=
func (h *DormsHandler) ListDorms(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))

	resp, err := h.Housing.ListDorms(c.Request.Context(), page, size)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "upstream error", "details": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"items":      resp.Items,
		"pagination": resp.Pagination,
	})
}

func (h *DormsHandler) DormsPDF(c *gin.Context) {
	// query parametri: paginacija + opcioni "download=1" za attachment
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("pageSize", "50"))
	download := c.Query("download") == "1"

	// povuci podatke iz housing servisa
	resp, err := h.Housing.ListDorms(c.Request.Context(), page, size)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "upstream error", "details": err.Error()})
		return
	}
	rows := resp.Items

	// PDF init
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.SetTitle("Available Dorms", false)
	pdf.SetAuthor("Open Data Service", false)
	pdf.SetAutoPageBreak(true, 15)

	// Nova strana + header
	pdf.AddPage()
	pdf.SetFont("Helvetica", "B", 16)
	pdf.Cell(0, 10, "List of Available Dorms")
	pdf.Ln(8)

	pdf.SetFont("Helvetica", "", 10)
	pdf.SetTextColor(100, 100, 100)
	pdf.Cell(0, 6, time.Now().Format("2006-01-02 15:04"))
	pdf.Ln(10)

	// Tabela
	pdf.SetTextColor(0, 0, 0)
	pdf.SetFont("Helvetica", "B", 11)

	// kolone (prilagodi po potrebi)
	wName, wAddr, wCity := 70.0, 90.0, 25.0
	hRow := 8.0

	// zaglavlje
	pdf.SetFillColor(240, 240, 240)
	pdf.CellFormat(wName, hRow, "Name", "1", 0, "L", true, 0, "")
	pdf.CellFormat(wAddr, hRow, "Address", "1", 0, "L", true, 0, "")
	pdf.CellFormat(wCity, hRow, "City", "1", 0, "L", true, 0, "")
	pdf.Ln(-1)

	pdf.SetFont("Helvetica", "", 10)

	for _, d := range rows {
		name := d.Name
		addr := d.Address
		// city := d.City

		// jednostavno skraćivanje ako je predugačko
		name = truncate(pdf, name, wName-2)
		addr = truncate(pdf, addr, wAddr-2)
		// city = truncate(pdf, city, wCity-2)

		pdf.CellFormat(wName, hRow, name, "1", 0, "L", false, 0, "")
		pdf.CellFormat(wAddr, hRow, addr, "1", 0, "L", false, 0, "")
		// pdf.CellFormat(wCity, hRow, city, "1", 0, "L", false, 0, "")
		pdf.Ln(-1)
	}

	// footer: paginacija (opciono)
	pdf.Ln(2)
	pdf.SetFont("Helvetica", "I", 9)
	pdf.Cell(0, 6, fmt.Sprintf("Page %d, pageSize %d, total %d", resp.Pagination.Page, resp.Pagination.PageSize, resp.Pagination.TotalCount))

	// Output u buffer
	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to render pdf"})
		return
	}

	disp := "inline"
	if download {
		disp = "attachment"
	}
	filename := fmt.Sprintf("dorms_%s.pdf", time.Now().Format("20060102_1504"))

	c.Header("Content-Type", "application/pdf")
	c.Header("Content-Disposition", fmt.Sprintf("%s; filename=%q", disp, filename))
	c.Data(http.StatusOK, "application/pdf", buf.Bytes())
}

// helper: skraćivanje teksta da stane u ćeliju
func truncate(pdf *gofpdf.Fpdf, s string, maxW float64) string {
	for pdf.GetStringWidth(s) > maxW && len(s) > 0 {
		// skloni 1 char i dodaj …
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
