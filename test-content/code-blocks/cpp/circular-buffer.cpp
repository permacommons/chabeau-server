#include <iostream>
#include <vector>
#include <algorithm>

template<typename T>
class CircularBuffer {
private:
  std::vector<T> buffer;
  size_t head, tail, count, capacity;

public:
  CircularBuffer(size_t size) : buffer(size), head(0), tail(0), count(0), capacity(size) {}
  
  void push(const T& item) {
    buffer[tail] = item;
    tail = (tail + 1) % capacity;
    if (count == capacity) {
      head = (head + 1) % capacity;
    } else {
      count++;
    }
  }
  
  T pop() {
    if (count == 0) throw std::runtime_error("Buffer is empty");
    T item = buffer[head];
    head = (head + 1) % capacity;
    count--;
    return item;
  }
};