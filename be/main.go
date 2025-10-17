package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"

	_ "github.com/mattn/go-sqlite3"
)

// Struct to parse incoming JSON request from the form
type UcapanRequest struct {
	Nama   string `json:"nama"`
	Hadir  string `json:"hadir"`
	Ucapan string `json:"ucapan"`
}

// Struct for the data that will be sent back to the frontend
type UcapanResponse struct {
	Nama      string `json:"nama"`
	Kehadiran string `json:"kehadiran"`
	Ucapan    string `json:"ucapan"`
}

// A generic JSON response for success/error messages
type JsonResponse struct {
	StatusCode int    `json:"statusCode"`
	Message    string `json:"message,omitempty"`
}

var db *sql.DB

// corsMiddleware wraps a handler to include CORS headers and handle preflight requests.
func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Set CORS headers
		w.Header().Set("Access-Control-Allow-Origin", "*") // Allow any origin
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		// Handle preflight (OPTIONS) request
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		// Call the actual handler
		next(w, r)
	}
}

func initDatabase() {
	var err error
	db, err = sql.Open("sqlite3", "undangan.db")
	if err != nil {
		log.Fatalf("Error opening database: %v", err)
	}

	createTableSQL := `
	CREATE TABLE IF NOT EXISTS ucapan (
		"id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
		"nama" TEXT,
		"kehadiran" TEXT,
		"ucapan" TEXT,
		"created_at" DATETIME DEFAULT CURRENT_TIMESTAMP
	);`

	statement, err := db.Prepare(createTableSQL)
	if err != nil {
		log.Fatalf("Error preparing create table statement: %v", err)
	}
	statement.Exec()
	log.Println("Database ready and table successfully created/verified.")
}

func getUcapanHandler(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT nama, kehadiran, ucapan FROM ucapan ORDER BY id DESC")
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		log.Printf("Error querying database: %v", err)
		return
	}
	defer rows.Close()

	var daftarUcapan []UcapanResponse
	for rows.Next() {
		var ucapan UcapanResponse
		if err := rows.Scan(&ucapan.Nama, &ucapan.Kehadiran, &ucapan.Ucapan); err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			log.Printf("Error scanning row: %v", err)
			return
		}
		daftarUcapan = append(daftarUcapan, ucapan)
	}

	if err = rows.Err(); err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		log.Printf("Error during rows iteration: %v", err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(daftarUcapan)
}

func saveHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req UcapanRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	insertSQL := `INSERT INTO ucapan(nama, kehadiran, ucapan) VALUES (?, ?, ?)`
	statement, err := db.Prepare(insertSQL)
	if err != nil {
		log.Printf("Error preparing insert statement: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	_, err = statement.Exec(req.Nama, req.Hadir, req.Ucapan)
	if err != nil {
		log.Printf("Error executing insert statement: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	log.Printf("Successfully saved greeting from: %s", req.Nama)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(JsonResponse{StatusCode: 200})
}

func main() {
	initDatabase()
	defer db.Close()

	// Wrap each handler with the CORS middleware
	http.HandleFunc("/save", corsMiddleware(saveHandler))
	http.HandleFunc("/ucapan", corsMiddleware(getUcapanHandler))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	log.Printf("Server starting on port %s...", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Could not start server: %s\n", err)
	}
}
