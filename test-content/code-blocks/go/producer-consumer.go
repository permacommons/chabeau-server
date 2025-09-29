package main

import (
  "fmt"
  "sync"
  "time"
)

func producer(wg *sync.WaitGroup, ch chan<- int) {
  defer wg.Done()
  for i := 0; i < 5; i++ {
    ch <- i
    time.Sleep(time.Millisecond * 100)
  }
  close(ch)
}

func consumer(wg *sync.WaitGroup, ch <-chan int) {
  defer wg.Done()
  for value := range ch {
    fmt.Printf("Consumed: %d\n", value)
  }
}

func main() {
  var wg sync.WaitGroup
  ch := make(chan int, 2)
  
  wg.Add(2)
  go producer(&wg, ch)
  go consumer(&wg, ch)
  
  wg.Wait()
}