package types

import (
	"time"

	"github.com/google/uuid"
)

type Student struct {
	ID        uuid.UUID  `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`
	Index     string     `gorm:"unique;not null" json:"index"`
	FirstName string     `gorm:"not null" json:"firstName"`
	LastName  string     `gorm:"not null" json:"lastName"`
	Faculty   string     `gorm:"not null" json:"faculty"`

	Applications []Application `gorm:"foreignKey:StudentID" json:"applications,omitempty"`
}

type Dorm struct {
	ID      uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`
	Name    string    `gorm:"not null" json:"name"`
	Address string    `gorm:"not null" json:"address"`

	Rooms []Room `gorm:"foreignKey:DormID" json:"rooms,omitempty"`
}

type Room struct {
	ID        uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`
	Number    string    `gorm:"not null" json:"number"`
	Capacity  int       `gorm:"not null" json:"capacity"`
	Available bool      `gorm:"default:true" json:"available"`

	DormID      uuid.UUID      `gorm:"not null" json:"dormId"`
	Applications []Application `gorm:"foreignKey:RoomID" json:"applications,omitempty"`
}

type Application struct {
	ID        uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"createdAt"`
	Points    int       `json:"points"`

	Status ApplicationStatus `gorm:"type:varchar(20);not null" json:"status"`

	StudentID uuid.UUID  `gorm:"not null" json:"studentId"`
	RoomID    *uuid.UUID `json:"roomId,omitempty"`
	Payment   *Payment   `gorm:"foreignKey:ApplicationID" json:"payment,omitempty"`
}

type Payment struct {
	ID          uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`
	Reference   string    `gorm:"not null" json:"reference"`
	Amount      float64   `gorm:"not null" json:"amount"`
	IssuedAt    time.Time `gorm:"autoCreateTime" json:"issuedAt"`

	ApplicationID uuid.UUID `gorm:"unique;not null" json:"applicationId"`
}

type ApplicationStatus string

const (
	StatusSubmitted ApplicationStatus = "SUBMITTED"
	StatusAccepted  ApplicationStatus = "ACCEPTED"
	StatusRejected  ApplicationStatus = "REJECTED"
	StatusReserved  ApplicationStatus = "RESERVED"
)
