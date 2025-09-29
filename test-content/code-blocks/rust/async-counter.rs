use tokio::time::{sleep, Duration};
use std::sync::Arc;
use tokio::sync::Mutex;

#[derive(Clone)]
struct Counter {
    value: Arc<Mutex<i32>>,
}

impl Counter {
    fn new() -> Self {
        Counter {
            value: Arc::new(Mutex::new(0)),
        }
    }
    
    async fn increment(&self) {
        let mut val = self.value.lock().await;
        *val += 1;
        println!("Counter: {}", *val);
    }
}

#[tokio::main]
async fn main() {
    let counter = Counter::new();
    
    let mut handles = vec![];
    
    for _ in 0..5 {
        let counter_clone = counter.clone();
        let handle = tokio::spawn(async move {
            counter_clone.increment().await;
            sleep(Duration::from_millis(100)).await;
        });
        handles.push(handle);
    }
    
    for handle in handles {
        handle.await.unwrap();
    }
}