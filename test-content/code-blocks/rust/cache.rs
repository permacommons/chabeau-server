use std::collections::HashMap;

#[derive(Debug)]
struct Cache<K, V> {
    data: HashMap<K, V>,
    capacity: usize,
}

impl<K, V> Cache<K, V>
where
    K: std::hash::Hash + Eq + Clone,
{
    fn new(capacity: usize) -> Self {
        Cache {
            data: HashMap::new(),
            capacity,
        }
    }
    
    fn insert(&mut self, key: K, value: V) -> Option<V> {
        if self.data.len() >= self.capacity && !self.data.contains_key(&key) {
            // Simple eviction: remove first item
            if let Some(first_key) = self.data.keys().next().cloned() {
                self.data.remove(&first_key);
            }
        }
        self.data.insert(key, value)
    }
    
    fn get(&self, key: &K) -> Option<&V> {
        self.data.get(key)
    }
}