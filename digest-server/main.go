package main

import (
	"crypto/md5"
	"fmt"
	"log"
	"net/http"

	auth "github.com/abbot/go-http-auth"
)

func main() {
	secrets := func(user, realm string) string {
		pwd := "secret"
		hash := md5.Sum([]byte(user + ":" + realm + ":" + pwd))
		return fmt.Sprintf("%x", hash)
	}

	// Create digest authenticator
	digestAuth := auth.NewDigestAuthenticator("example.com", secrets)

	// Protected handler
	handler := func(w http.ResponseWriter, r *auth.AuthenticatedRequest) {
		fmt.Fprintf(w, "Welcome %s! The secret word is 'strawberry'!", r.Username)
	}

	// Wrap handler with digest authentication
	http.HandleFunc("/", Wrap(digestAuth, handler))

	// Start server
	log.Println("Server starting on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func Wrap(a *auth.DigestAuth, wrapped auth.AuthenticatedHandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if username, authinfo := a.CheckAuth(r); username == "" {
			a.RequireAuth(w, r)

			reqHeader := r.Header.Get("Authorization")
			w.Write([]byte("\nrequest auth header: "))
			w.Write([]byte(reqHeader))

			resHeader := w.Header().Get("WWW-Authenticate")
			w.Write([]byte("\nresponse auth header: "))
			w.Write([]byte(resHeader))
		} else {
			ar := &auth.AuthenticatedRequest{Request: *r, Username: username}
			if authinfo != nil {
				w.Header().Set(a.Headers.V().AuthInfo, *authinfo)
			}
			wrapped(w, ar)
		}
	}
}
