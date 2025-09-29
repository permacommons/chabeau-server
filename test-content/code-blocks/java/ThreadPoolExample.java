import java.util.concurrent.*;

public class ThreadPoolExample {
  public static void main(String[] args) {
    ExecutorService executor = Executors.newFixedThreadPool(4);
    
    for (int i = 0; i < 10; i++) {
      final int taskId = i;
      executor.submit(() -> {
        System.out.println("Task " + taskId + " executed by " + 
                          Thread.currentThread().getName());
      });
    }
    
    executor.shutdown();
    try {
      if (!executor.awaitTermination(60, TimeUnit.SECONDS)) {
        executor.shutdownNow();
      }
    } catch (InterruptedException e) {
      executor.shutdownNow();
    }
  }
}