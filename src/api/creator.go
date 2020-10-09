package dpatronapi

type Creator struct {
	Account   string     `json:account`
	Bookmarks []Bookmark `json:bookmarks`
}

type CreatorRequest struct {
	Account string `json:account,omitempty`
}
