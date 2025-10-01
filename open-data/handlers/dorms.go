package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"open-data/upstream"
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
