#include <iostream>
#include <thread>
#include <mutex>
#include <condition_variable>
#include <queue>

class ThreadSafeQueue {
private:
  std::queue<int> q;
  std::mutex mtx;
  std::condition_variable cv;

public:
  void push(int value) {
    std::lock_guard<std::mutex> lock(mtx);
    q.push(value);
    cv.notify_one();
  }
  
  int pop() {
    std::unique_lock<std::mutex> lock(mtx);
    cv.wait(lock, [this] { return !q.empty(); });
    int value = q.front();
    q.pop();
    return value;
  }
};