package types

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

type ODPaymentStats struct {
  DomID     string  `json:"domId"`
  Date      string  `json:"date"`
  Count     int     `json:"count"`
  Sum       float64 `json:"sum"`
  Currency  string  `json:"currency"`
}
  
type Student struct {
	ID      uint   `gorm:"primaryKey" json:"ID"`
	Index   string `json:"index,omitempty" gorm:"unique"`
	Name    string `json:"name" gorm:"not null"`
	Surname string `json:"surname" gorm:"not null"`
	Faculty string `json:"faculty" gorm:"not null"`
}
