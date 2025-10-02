package upstream

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"path"
	"time"

	"open-data/types"
)

type Student struct {
	ID        uint   `gorm:"primaryKey" json:"ID"`
	Email     string `gorm:"unique;not null" json:"email"`
	Password  string `gorm:"not null" json:"password"`
	Index     string `json:"index"`
	FirstName string `gorm:"not null" json:"firstName"`
	LastName  string `gorm:"not null" json:"lastName"`
	Faculty   string `json:"faculty"`
}

type Pagination struct {
	Page       int   `json:"page"`
	PageSize   int   `json:"pageSize"`
	TotalCount int64 `json:"totalCount"`
}

type DormListResponse struct {
	Items      []types.ODDorm `json:"items"`
	Pagination Pagination     `json:"pagination"`
}

type StudentsListResponse struct {
	Items      []Student  `json:"items"`
	Pagination Pagination `json:"pagination"`
}

type PricePlanListResponse struct {
	Items      []types.ODPricePlan `json:"items"`
	Pagination Pagination          `json:"pagination"`
}

type DailyAvailabilityListResponse struct {
	Items      []types.ODDailyAvailability `json:"items"`
	Pagination Pagination                  `json:"pagination"`
}

type ApplicationStatsListResponse struct {
	Items      []types.ODApplicationStats `json:"items"`
	Pagination Pagination                 `json:"pagination"`
}

type PaymentStatsListResponse struct {
	Items      []types.ODPaymentStats `json:"items"`
	Pagination Pagination             `json:"pagination"`
}

type HousingClient struct {
	base  string
	httpc *http.Client
}

func NewHousingClient(base string, timeout time.Duration) *HousingClient {
	return &HousingClient{
		base: base,
		httpc: &http.Client{
			Timeout: timeout,
		},
	}
}

func (c *HousingClient) ListDorms(ctx context.Context, page, pageSize int) (*DormListResponse, error) {
	var out DormListResponse
	if err := c.get(ctx, "/api/dorms", page, pageSize, &out); err != nil {
		return nil, err
	}
	return &out, nil
}

func (c *HousingClient) ListStudents(ctx context.Context, page, pageSize int) (*StudentsListResponse, error) {
	var out StudentsListResponse
	if err := c.get(ctx, "/api/students", page, pageSize, &out); err != nil {
		return nil, err
	}
	return &out, nil
}

func (c *HousingClient) ListPricePlans(ctx context.Context, page, pageSize int) (*PricePlanListResponse, error) {
	var out PricePlanListResponse
	if err := c.get(ctx, "/api/payments", page, pageSize, &out); err != nil {
		return nil, err
	}
	return &out, nil
}

func (c *HousingClient) ListDailyAvailability(ctx context.Context, page, pageSize int) (*DailyAvailabilityListResponse, error) {
	var out DailyAvailabilityListResponse
	if err := c.get(ctx, "/api/daily-availability", page, pageSize, &out); err != nil {
		return nil, err
	}
	return &out, nil
}

func (c *HousingClient) ListApplicationStats(ctx context.Context, page, pageSize int) (*ApplicationStatsListResponse, error) {
	var out ApplicationStatsListResponse
	if err := c.get(ctx, "/api/applications", page, pageSize, &out); err != nil {
		return nil, err
	}
	return &out, nil
}

func (c *HousingClient) ListPaymentStats(ctx context.Context, page, pageSize int) (*PaymentStatsListResponse, error) {
	var out PaymentStatsListResponse
	if err := c.get(ctx, "/api/payments", page, pageSize, &out); err != nil {
		return nil, err
	}
	return &out, nil
}

// zajednički GET helper
func (c *HousingClient) get(ctx context.Context, p string, page, pageSize int, out any) error {
	u, err := url.Parse(c.base)
	if err != nil {
		return err
	}
	u.Path = path.Join(u.Path, p)

	q := url.Values{}
	if page > 0 {
		q.Set("page", fmt.Sprintf("%d", page))
	}
	if pageSize > 0 {
		q.Set("pageSize", fmt.Sprintf("%d", pageSize))
	}
	u.RawQuery = q.Encode()

	req, _ := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
	req.Header.Set("Accept", "application/json")

	res, err := c.httpc.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()

	if res.StatusCode >= 300 {
		return fmt.Errorf("housing upstream status %d", res.StatusCode)
	}
	return json.NewDecoder(res.Body).Decode(out)
}
