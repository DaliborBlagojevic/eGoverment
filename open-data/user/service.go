package user

import (
	"context"
	"open-data/types"
	"time"

	"gorm.io/gorm"
)

// GetOpenDorms: spaja dom + amenities + updated_at (max iz povezanih tabela, po želji).
func GetOpenDormsSimple(ctx context.Context, db *gorm.DB, page, pageSize int) ([]types.ODDorm, int64, error) {
	if page < 1 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 200 {
		pageSize = 20
	}
	offset := (page - 1) * pageSize

	// Minimalni row za čitanje iz tabele "dorms" bez oslanjanja na types.Dorm
	type dormRow struct {
		ID      string `gorm:"column:id"`      // čitamo kao text preko SELECT-a
		Name    string `gorm:"column:name"`
		Address string `gorm:"column:address"`
	}

	var rows []dormRow
	// id::text da bude string; COALESCE da izbegne NULL
	tx := db.WithContext(ctx).
		Table("dorms").
		Select("id::text AS id, COALESCE(name,'') AS name, COALESCE(address,'') AS address").
		Offset(offset).
		Limit(pageSize).
		Scan(&rows)
	if tx.Error != nil {
		return nil, 0, tx.Error
	}

	var total int64
	_ = db.WithContext(ctx).Table("dorms").Count(&total).Error

	// Map u open-data tip
	nowISO := time.Now().UTC().Format(time.RFC3339)
	items := make([]types.ODDorm, 0, len(rows))
	for _, r := range rows {
		items = append(items, types.ODDorm{
			DomID:     r.ID,
			Naziv:     r.Name,
			Grad:      "",
			Adresa:    r.Address,
			Website:   "",
			Phone:     "",
			Amenities: []string{},
			UpdatedAt: nowISO,
		})
	}

	return items, total, nil
}


func GetOpenPricePlans(ctx context.Context, db *gorm.DB, domID string) ([]types.ODPricePlan, error) {
	q := db.WithContext(ctx).Raw(`
		SELECT 
			pp.dorm_id::text AS dom_id,
			pp.room_type     AS room_type,
			pp.monthly_price AS monthly,
			pp.currency      AS currency,
			COALESCE(pp.updated_at, NOW()) AS updated_at
		FROM price_plans pp
		WHERE ($1 = '' OR pp.dorm_id::text = $1)
		ORDER BY pp.dorm_id, pp.room_type;
	`, domID)

	var rows []PricePlanRow
	if err := q.Scan(&rows).Error; err != nil {
		return nil, err
	}
	out := make([]types.ODPricePlan, 0, len(rows))
	for _, r := range rows {
		out = append(out, MapPricePlanRowToOD(r))
	}
	return out, nil
}

func GetDailyAvailability(ctx context.Context, db *gorm.DB, domID string, from, to time.Time) ([]types.ODDailyAvailability, error) {
	q := db.WithContext(ctx).Raw(`
		SELECT 
			av.dorm_id::text AS dom_id,
			av.date::date    AS date,
			av.total_beds    AS total_beds,
			av.free_beds     AS free_beds
		FROM availability_snapshots av
		WHERE ($1 = '' OR av.dorm_id::text = $1)
		  AND av.date >= $2::date
		  AND av.date <= $3::date
		ORDER BY av.dorm_id, av.date;
	`, domID, from, to)

	type row struct {
		DomID     string
		Date      time.Time
		TotalBeds int
		FreeBeds  int
	}
	var rows []row
	if err := q.Scan(&rows).Error; err != nil {
		return nil, err
	}
	out := make([]types.ODDailyAvailability, 0, len(rows))
	for _, r := range rows {
		out = append(out, types.ODDailyAvailability{
			DomID:     r.DomID,
			Date:      toDateOnly(r.Date),
			TotalBeds: r.TotalBeds,
			FreeBeds:  r.FreeBeds,
		})
	}
	return out, nil
}

func GetApplicationStats(ctx context.Context, db *gorm.DB, domID string, from, to time.Time) ([]types.ODApplicationStats, error) {
	q := db.WithContext(ctx).Raw(`
		SELECT 
			s.dom_id::text AS dom_id,
			p.kreirano::date AS date,
			SUM(CASE WHEN p.status = 'PREDATA'     THEN 1 ELSE 0 END) AS predate,
			SUM(CASE WHEN p.status = 'PRIHVACENA'  THEN 1 ELSE 0 END) AS prihvacene,
			SUM(CASE WHEN p.status = 'ODBIJENA'    THEN 1 ELSE 0 END) AS odbijene,
			SUM(CASE WHEN p.status = 'REZERVISANA' THEN 1 ELSE 0 END) AS rezervisane
		FROM prijavas p
		LEFT JOIN sobas s ON s.id = p.soba_id
		WHERE ($1 = '' OR s.dom_id::text = $1)
		  AND p.kreirano::date >= $2::date
		  AND p.kreirano::date <= $3::date
		GROUP BY s.dom_id, p.kreirano::date
		ORDER BY s.dom_id, p.kreirano::date;
	`, domID, from, to)

	type row struct {
		DomID       string
		Date        time.Time
		Predate     int
		Prihvacene  int
		Odbijene    int
		Rezervisane int
	}
	var rows []row
	if err := q.Scan(&rows).Error; err != nil {
		return nil, err
	}
	out := make([]types.ODApplicationStats, 0, len(rows))
	for _, r := range rows {
		out = append(out, types.ODApplicationStats{
			DomID:       r.DomID,
			Date:        toDateOnly(r.Date),
			Predate:     r.Predate,
			Prihvacene:  r.Prihvacene,
			Odbijene:    r.Odbijene,
			Rezervisane: r.Rezervisane,
		})
	}
	return out, nil
}

func GetPaymentStats(ctx context.Context, db *gorm.DB, domID string, from, to time.Time, currency string) ([]types.ODPaymentStats, error) {
	q := db.WithContext(ctx).Raw(`
		SELECT 
			s.dom_id::text AS dom_id,
			u.izdato::date AS date,
			COUNT(*)       AS count,
			SUM(u.iznos)   AS sum,
			$4             AS currency
		FROM uplatnicas u
		JOIN prijavas p ON p.id = u.prijava_id
		LEFT JOIN sobas s ON s.id = p.soba_id
		WHERE ($1 = '' OR s.dom_id::text = $1)
		  AND u.izdato::date >= $2::date
		  AND u.izdato::date <= $3::date
		GROUP BY s.dom_id, u.izdato::date
		ORDER BY s.dom_id, u.izdato::date;
	`, domID, from, to, currency)

	type row struct {
		DomID  string
		Date   time.Time
		Count  int
		Sum    float64
	}
	var rows []row
	if err := q.Scan(&rows).Error; err != nil {
		return nil, err
	}
	out := make([]types.ODPaymentStats, 0, len(rows))
	for _, r := range rows {
		out = append(out, types.ODPaymentStats{
			DomID:    r.DomID,
			Date:     toDateOnly(r.Date),
			Count:    r.Count,
			Sum:      r.Sum,
			Currency: currency,
		})
	}
	return out, nil
}
