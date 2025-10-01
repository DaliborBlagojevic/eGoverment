package upstream

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"path"
	"time"
)

type Dorm struct {
	ID      string `json:"id"` // uuid kao string
	Name    string `json:"name"`
	Address string `json:"address"`
	// Rooms izostavljamo (nije potrebno za listu)
}

type Pagination struct {
	Page       int   `json:"page"`
	PageSize   int   `json:"pageSize"`
	TotalCount int64 `json:"totalCount"`
}

type DormListResponse struct {
	Items      []Dorm     `json:"items"`
	Pagination Pagination `json:"pagination"`
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

// Poziva GET {base}/api/housing/dorms?page=&pageSize=
// Ako ti je prefiks drugačiji (npr. /api/student/dorms), samo promeni path ispod.
func (c *HousingClient) ListDorms(ctx context.Context, page, pageSize int) (*DormListResponse, error) {
	u, err := url.Parse(c.base)
	if err != nil {
		return nil, err
	}
	u.Path = path.Join(u.Path, "/api/dorms")

	fmt.Println(u.Path)
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
		return nil, err
	}
	defer res.Body.Close()

	if res.StatusCode >= 300 {
		return nil, fmt.Errorf("housing upstream status %d", res.StatusCode)
	}

	var out DormListResponse
	if err := json.NewDecoder(res.Body).Decode(&out); err != nil {
		return nil, err
	}
	return &out, nil
}
