package main

import (
	"fmt"
	"net/http"

	"encoding/json"
	"flag"
	"github.com/go-chi/chi"
)

func main() {

	var (
		port = flag.String("port", ":8080", "Select a port for the API server.")
	)

	flag.Parse()

	r := chi.NewRouter()

	// API routes:
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {

		resp := struct {
			Name        string `json:name`
			Description string `json:description`
		}{
			Name:        "Hello, World!",
			Description: "An awesome greeting!",
		}

		json.NewEncoder(w).Encode(resp)
	})

	fmt.Printf("Starting server on port %v", *port)
	http.ListenAndServe(*port, r)
}
