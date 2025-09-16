package types

type Student struct {
	ID      uint   `gorm:"primaryKey" json:"ID"`
	Index   string `json:"index,omitempty" gorm:"unique"`
	Name    string `json:"name" gorm:"not null"`
	Surname string `json:"surname" gorm:"not null"`
	Faculty string `json:"faculty" gorm:"not null"`
}
