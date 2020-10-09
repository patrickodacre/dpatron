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

	r.Post("/creators/{account}/bookmarks", func(w http.ResponseWriter, r *http.Request) {
		req := dpatronapi.BookmarkRequest{}

		err := json.NewDecoder(r.Body).Decode(&req)

		if err != nil {
			fmt.Println("Error creating a bookmark", err)

			w.WriteHeader(http.StatusInternalServerError)

			return
		}

		if req.Account == "" {
			w.WriteHeader(http.StatusBadRequest)

			json.NewEncoder(w).Encode(struct{ Message string }{"Account required."})

			return
		}

		db.Update(func(tx *bolt.Tx) error {
			b := tx.Bucket([]byte("Creators"))

			data, err := json.Marshal(dpatronapi.Creator{Account: req.Account, Bookmarks: req.Bookmarks})

			if err != nil {
				log.Fatalf("Error putting bookmark", err)
				return err
			}

			err = b.Put([]byte(req.Account), []byte(data))

			if err != nil {
				log.Fatalf("Error putting bookmark", err)
				return err
			}

			return err
		})

		w.WriteHeader(http.StatusOK)
	})

	r.Get("/creators", func(w http.ResponseWriter, r *http.Request) {

		creators := []dpatronapi.Creator{}

		db.View(func(tx *bolt.Tx) error {
			b := tx.Bucket([]byte("Creators"))

			b.ForEach(func(k, v []byte) error {
				var c dpatronapi.Creator

				json.Unmarshal(v, &c)

				creators = append(creators, c)

				return nil
			})

			return nil
		})

		log.Printf("Returing %d creators", len(creators))

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(creators)

		w.WriteHeader(http.StatusOK)
	})

	// register an ethereum account as a "creator"
	r.Post("/creators", func(w http.ResponseWriter, r *http.Request) {

		req := dpatronapi.CreatorRequest{}

		err := json.NewDecoder(r.Body).Decode(&req)

		if err != nil {
			fmt.Println("Error creating a creator", err)

			w.WriteHeader(http.StatusInternalServerError)

			return
		}

		if req.Account == "" {
			w.WriteHeader(http.StatusBadRequest)

			json.NewEncoder(w).Encode(struct{ Message string }{"Account required."})

			return
		}

		db.Update(func(tx *bolt.Tx) error {
			b := tx.Bucket([]byte("Creators"))

			data, err := json.Marshal(dpatronapi.Creator{Account: req.Account})

			if err != nil {
				log.Fatalf("Error putting creator", err)
				return err
			}

			err = b.Put([]byte(req.Account), []byte(data))

			if err != nil {
				log.Fatalf("Error putting creator", err)
				return err
			}

			return err
		})

		w.WriteHeader(http.StatusOK)
	})

	fmt.Printf("Starting server on port %v", *port)
	http.ListenAndServe(*port, r)
}
