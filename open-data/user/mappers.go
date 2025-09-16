// package od // ili package services

package mappers

import (
	"open-data/types"
	"time"
)

const (
	dateLayout = "2006-01-02"
)

func toRFC3339(t time.Time) string { return t.UTC().Format(time.RFC3339) }
func toDateOnly(t time.Time) string { return t.UTC().Format(dateLayout) }

// ---- DORMS ----

type DormRow struct {
	DomID     string
	Naziv     string
	Grad      string
	Adresa    string
	Website   *string
	Phone     *string
	Amenities string  // CSV lista: "wifi,canteen,accessible"
	UpdatedAt time.Time
}

func MapDormRowToOD(r DormRow) types.ODDorm {
	website := ""
	if r.Website != nil { website = *r.Website }
	phone := ""
	if r.Phone != nil { phone = *r.Phone }
	var amenities []string
	if r.Amenities != "" {
		amenities = splitCSV(r.Amenities)
	}
	return types.ODDorm{
		DomID:     r.DomID,
		Naziv:     r.Naziv,
		Grad:      r.Grad,
		Adresa:    r.Adresa,
		Website:   website,
		Phone:     phone,
		Amenities: amenities,
		UpdatedAt: toRFC3339(r.UpdatedAt),
	}
}

func splitCSV(s string) []string {
	if s == "" { return nil }
	var out []string
	cur := ""
	for i := 0; i < len(s); i++ {
		if s[i] == ',' {
			if cur != "" { out = append(out, cur) }
			cur = ""
			continue
		}
		cur += string(s[i])
	}
	if cur != "" { out = append(out, cur) }
	return out
}

// ---- PRICE PLANS ----

type PricePlanRow struct {
	DomID     string
	RoomType  string
	Monthly   float64
	Currency  string
	UpdatedAt time.Time
}

func MapPricePlanRowToOD(r PricePlanRow) types.ODPricePlan {
	return types.ODPricePlan{
		DomID:     r.DomID,
		RoomType:  r.RoomType,
		Monthly:   r.Monthly,
		Currency:  r.Currency,
		UpdatedAt: toRFC3339(r.UpdatedAt),
	}
}
