package main

import (
  "fmt"
  "sort"
)

type Person struct {
  Name string
  Age  int
}

type ByAge []Person

func (a ByAge) Len() int           { return len(a) }
func (a ByAge) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
func (a ByAge) Less(i, j int) bool { return a[i].Age < a[j].Age }

func main() {
  people := []Person{
    {"Alice", 30},
    {"Bob", 25},
    {"Charlie", 35},
  }
  
  sort.Sort(ByAge(people))
  fmt.Println(people)
}