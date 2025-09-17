package types

import (
	"time"

	"github.com/google/uuid"
)

type Student struct {
	ID           uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`
	Index        string    `gorm:"unique;not null" json:"index"`
	Name         string    `gorm:"not null" json:"name"`
	Surname      string    `gorm:"not null" json:"surname"`
	Faculty      string    `gorm:"not null" json:"faculty"`
	Applications []Prijava `gorm:"foreignKey:StudentID" json:"applications,omitempty"`
}

type Dom struct {
	ID     uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`
	Naziv  string    `gorm:"not null" json:"naziv"`
	Adresa string    `gorm:"not null" json:"adresa"`
	Sobe   []Soba    `gorm:"foreignKey:DomID" json:"sobe,omitempty"`
}

type Soba struct {
	ID        uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`
	Broj      string    `gorm:"not null" json:"broj"`
	Kapacitet int       `gorm:"not null" json:"kapacitet"`
	Dostupna  bool      `gorm:"default:true" json:"dostupna"`
	DomID     uuid.UUID `gorm:"not null" json:"domId"`
	Prijava   []Prijava `gorm:"foreignKey:SobaID" json:"prijave,omitempty"`
}

type Prijava struct {
	ID       uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`
	Kreirano time.Time `gorm:"autoCreateTime" json:"kreirano"`
	Bodovi   int       `json:"bodovi"`

	Status Status `gorm:"type:varchar(20);not null" json:"status"`

	StudentID uuid.UUID  `gorm:"not null" json:"studentId"`
	SobaID    *uuid.UUID `json:"sobaId,omitempty"`
	Uplatnica *Uplatnica `gorm:"foreignKey:PrijavaID" json:"uplatnica,omitempty"`
}

type Uplatnica struct {
	ID          uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`
	PozivNaBroj string    `gorm:"not null" json:"pozivNaBroj"`
	Iznos       float64   `gorm:"not null" json:"iznos"`
	Izdato      time.Time `gorm:"autoCreateTime" json:"izdato"`

	PrijavaID uuid.UUID `gorm:"unique;not null" json:"prijavaId"`
}

type Status string

const (
	StatusPredata     Status = "PREDATA"
	StatusPrihvacena  Status = "PRIHVACENA"
	StatusOdbijena    Status = "ODBIJENA"
	StatusRezervisana Status = "REZERVISANA"
)
