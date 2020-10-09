package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"

	"dpatronapi"
	"github.com/boltdb/bolt"
	"github.com/go-chi/chi"
)

func main() {

	var (
		port   = flag.String("port", ":8080", "Select a port for the API server.")
		dbname = flag.String("db", "main.db", "Select a database filename.")
	)

	flag.Parse()

	// connect to our db
	var db *bolt.DB
	{
		database, err := bolt.Open(*dbname, 0600, nil)
		if err != nil {
			log.Fatal(err)
		}

		db = database
		defer db.Close()
	}

	r := chi.NewRouter()

	// API routes:
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {

		resp := dpatronapi.Bookmark{
			Name:        "Hello, World!",
			Description: "An awesome greeting!",
		}

		json.NewEncoder(w).Encode(resp)
	})

	r.Get("/tags", func(w http.ResponseWriter, r *http.Request) {

		resp := struct {
			Tags []string `json:tags`
		}{
			Tags: dpatronapi.GetPermittedTags(),
		}

		json.NewEncoder(w).Encode(resp)
	})

	fmt.Printf("Starting server on port %v", *port)
	http.ListenAndServe(*port, r)
}
