package main

import (
  "context"
  "fmt"
  "net/http"
  "time"
)

func handler(w http.ResponseWriter, r *http.Request) {
  ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
  defer cancel()
  
  select {
  case <-time.After(2 * time.Second):
    fmt.Fprintf(w, "Hello, World!")
  case <-ctx.Done():
    http.Error(w, "Request timeout", http.StatusRequestTimeout)
  }
}

func main() {
  http.HandleFunc("/", handler)
  fmt.Println("Server starting on :8080")
  http.ListenAndServe(":8080", nil)
}