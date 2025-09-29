import java.util.*;

public class LRUCache<K, V> extends LinkedHashMap<K, V> {
  private final int capacity;
  
  public LRUCache(int capacity) {
    // AccessOrder = true for LRU behavior
    super(capacity, 0.75f, true);
    this.capacity = capacity;
  }
  
  @Override
  protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
    return size() > capacity;
  }
  
  public static void main(String[] args) {
    LRUCache<Integer, String> cache = new LRUCache<>(3);
    cache.put(1, "One");
    cache.put(2, "Two");
    cache.put(3, "Three");
    cache.get(1); // Accessing key 1
    cache.put(4, "Four"); // This will remove key 2
    
    System.out.println(cache); // {1=One, 3=Three, 4=Four}
  }
}