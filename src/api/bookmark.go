package dpatronapi

type Bookmark struct {
	Name        string   `json:name`
	Description string   `json:description,omitempty`
	URL         string   `json:url`
	Tags        []string `json:tags`
}
