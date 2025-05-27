package middleware

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"

	"go-postgres/models"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
)

type response struct {
	ID      int64  `json:"id,omitempty"`
	Message string `json:"message,omitempty"`
}

func createConnection() *sql.DB {
	err := godotenv.Load(".env")

	if err != nil {
		log.Fatal("Error loading .env file")
	}

	db, err := sql.Open("postgres", os.Getenv("POSTGRES_URL"))
	if err != nil {
		log.Fatal(err)
	}

	err = db.Ping()
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Successfully connected to the database")
	return db
}

func CreateStock(w http.ResponseWriter, r *http.Request) {
	var stock models.Stock
	err := json.NewDecoder(r.Body).Decode(&stock)
	if err != nil {
		log.Fatalf("Error decoding the request body into the struct %v", err)
	}

	insertID := insertStock(stock)

	res := response{
		ID:      insertID,
		Message: "Stock created successfully",
	}

	json.NewEncoder(w).Encode(res)
}

func GetStock(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		log.Fatalf("Error parsing the id: %v", err)
	}

	stock, err := getStock(int64(id))
	if err != nil {
		log.Fatalf("Error getting the stock: %v", err)
	}
	json.NewEncoder(w).Encode(stock)
}

func GetAllStock(w http.ResponseWriter, r *http.Request) {
	stocks, err := getAllStock()
	if err != nil {
		log.Fatalf("Error getting all stocks: %v", err)
	}
	json.NewEncoder(w).Encode(stocks)
}

func UpdateStock(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		log.Fatalf("Error parsing the id: %v", err)
	}

	var stock models.Stock
	err = json.NewDecoder(r.Body).Decode(&stock)
	if err != nil {
		log.Fatalf("Error decoding the request body into the struct: %v", err)
	}

	updatedRows := updateStock(int64(id), stock)

	msg := fmt.Sprintf("Stock updated successfully. Total rows/record affected %v", updatedRows)

	res := response{
		ID:      int64(id),
		Message: msg,
	}
	json.NewEncoder(w).Encode(res)
}

func DeleteStock(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		log.Fatalf("Error parsing the id: %v", err)
	}

	deletedRows := deleteStock(int64(id))

	msg := fmt.Sprintf("Stock deleted successfully. Total rows/record affected %v", deletedRows)

	res := response{
		ID:      int64(id),
		Message: msg,
	}
	json.NewEncoder(w).Encode(res)
}

func insertStock(stock models.Stock) int64 {
	db := createConnection()
	defer db.Close()

	var stockID int64
	sqlStatement := `INSERT INTO stocks (name, price, company) VALUES ($1, $2, $3) RETURNING stockid`
	err := db.QueryRow(sqlStatement, stock.Name, stock.Price, stock.Company).Scan(&stockID)
	if err != nil {
		log.Fatalf("Error inserting the stock: %v", err)
	}
	return stockID
}

func getStock(id int64) (models.Stock, error) {
	db := createConnection()
	defer db.Close()

	var stock models.Stock
	sqlStatement := `SELECT * FROM stocks WHERE stockid = $1`
	err := db.QueryRow(sqlStatement, id).Scan(&stock.StockID, &stock.Name, &stock.Price, &stock.Company)
	if err != nil {
		log.Fatalf("Error getting the stock: %v", err)
	}
	return stock, nil
}

func getAllStock() ([]models.Stock, error) {
	db := createConnection()
	defer db.Close()

	rows, err := db.Query("SELECT * FROM stocks")
	if err != nil {
		log.Fatalf("Error getting all stocks: %v", err)
	}
	defer rows.Close()

	var stocks []models.Stock
	for rows.Next() {
		var stock models.Stock
		err = rows.Scan(&stock.StockID, &stock.Name, &stock.Price, &stock.Company)
		if err != nil {
			log.Fatalf("Error scanning the row: %v", err)
		}
		stocks = append(stocks, stock)
	}
	return stocks, nil
}

func updateStock(id int64, stock models.Stock) int64 {
	db := createConnection()
	defer db.Close()

	sqlStatement := `UPDATE stocks SET name = $2, price = $3, company = $4 WHERE stockid = $1`
	res, err := db.Exec(sqlStatement, id, stock.Name, stock.Price, stock.Company)
	if err != nil {
		log.Fatalf("Error updating the stock: %v", err)
	}
	rowsAffected, err := res.RowsAffected()
	if err != nil {
		log.Fatalf("Error getting the affected rows: %v", err)
	}
	return rowsAffected
}

func deleteStock(id int64) int64 {
	db := createConnection()
	defer db.Close()

	sqlStatement := `DELETE FROM stocks WHERE stockid = $1`
	res, err := db.Exec(sqlStatement, id)
	if err != nil {
		log.Fatalf("Error deleting the stock: %v", err)
	}
	rowsAffected, err := res.RowsAffected()
	if err != nil {
		log.Fatalf("Error getting the affected rows: %v", err)
	}
	return rowsAffected
}
