import java.util.*;

public class Graph {
  private Map<Integer, List<Integer>> adjacencyList;
  
  public Graph() {
    adjacencyList = new HashMap<>();
  }
  
  public void addEdge(int source, int destination) {
    adjacencyList.computeIfAbsent(source, k -> new ArrayList<>()).add(destination);
    adjacencyList.computeIfAbsent(destination, k -> new ArrayList<>()).add(source);
  }
  
  public List<Integer> getNeighbors(int vertex) {
    return adjacencyList.getOrDefault(vertex, new ArrayList<>());
  }
}