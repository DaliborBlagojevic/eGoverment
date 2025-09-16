package types

// OD_Dorms
type ODDorm struct {
  DomID     string   `json:"domId"`        // uuid as string
  Naziv     string   `json:"naziv"`
  Grad      string   `json:"grad"`
  Adresa    string   `json:"adresa"`
  Website   string   `json:"website,omitempty"`
  Phone     string   `json:"phone,omitempty"`
  Amenities []string `json:"amenities"`    // ["wifi","canteen","accessible"]
  UpdatedAt string   `json:"updatedAt"`    // ISO-8601
}

// OD_PricePlans
type ODPricePlan struct {
  DomID       string  `json:"domId"`
  RoomType    string  `json:"roomType"`    // "single","double","triple"
  Monthly     float64 `json:"monthlyPrice"`
  Currency    string  `json:"currency"`    // "RSD","EUR"
  UpdatedAt   string  `json:"updatedAt"`
}

// OD_DailyAvailability
type ODDailyAvailability struct {
  DomID     string `json:"domId"`
  Date      string `json:"date"`       // YYYY-MM-DD
  TotalBeds int    `json:"totalBeds"`
  FreeBeds  int    `json:"freeBeds"`
}

// OD_ApplicationStats (bez PII!)
type ODApplicationStats struct {
  DomID        string `json:"domId"`
  Date         string `json:"date"`
  Predate      int    `json:"predate"`
  Prihvacene   int    `json:"prihvacene"`
  Odbijene     int    `json:"odbijene"`
  Rezervisane  int    `json:"rezervisane"`
}

// OD_PaymentStats
type ODPaymentStats struct {
  DomID     string  `json:"domId"`
  Date      string  `json:"date"`
  Count     int     `json:"count"`
  Sum       float64 `json:"sum"`
  Currency  string  `json:"currency"`
}
