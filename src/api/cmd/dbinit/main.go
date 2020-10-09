package main

import (
	"flag"
	"fmt"
	"log"

	"dpatronapi"
	"github.com/boltdb/bolt"
	"strings"
)

func main() {

	var dbPath = flag.String("dbpath", "my.db", "Path to Database")

	db, err := bolt.Open(*dbPath, 0600, nil)
	if err != nil {
		log.Fatal(err)
	}

	defer db.Close()

	db.Update(func(tx *bolt.Tx) error {
		bucketName := "PermittedTags"
		_, err := tx.CreateBucket([]byte(bucketName))
		if err != nil {
			return fmt.Errorf("Error: create bucket: %s", err)
		}

		fmt.Println("Success: create bucket: %s", bucketName)
		return nil
	})

	tags := dpatronapi.GetPermittedTags()
	for _, t := range tags {

		db.Update(func(tx *bolt.Tx) error {
			b := tx.Bucket([]byte("PermittedTags"))

			tag := strings.ToLower(t)

			err = b.Put(tag, true)

			if err != nil {
				log.Fatalf("Error putting tag", err)
				return err
			}

			return err
		})
	}

	fmt.Println("Success: adding tags")

	db.Update(func(tx *bolt.Tx) error {
		bucketName := "Bookmarks"
		_, err := tx.CreateBucket([]byte(bucketName))
		if err != nil {
			return fmt.Errorf("Error: create bucket: %s", err)
		}

		fmt.Println("Success: create bucket %s", bucketName)
		return nil
	})
}
