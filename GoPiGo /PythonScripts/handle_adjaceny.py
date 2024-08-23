import sys
import json
import os

def create_adjacency_list(edges):
    graph = {}
    for edge, weight in edges:
        if len(edge) == 2:
            vertex1, vertex2 = edge[0], edge[1]
            if vertex1 not in graph:
                graph[vertex1] = {}
            if vertex2 not in graph:
                graph[vertex2] = {}
            graph[vertex1][vertex2] = weight
            graph[vertex2][vertex1] = weight 
        else:
            print(f"Skipping invalid edge: {edge}")
    return graph

def load_adjacency(file_path):
    edges = []
    with open(file_path, 'r') as file:
        for line in file:
            parts = line.strip().split(', ')
            if len(parts) == 2:
                edge_name = parts[0].split(': ')[1]
                weight_str = parts[1].split(': ')[1]
                try:
                    weight = int(weight_str)
                    if len(edge_name) == 2:
                        vertex1, vertex2 = edge_name[0], edge_name[1]
                        edges.append(((vertex1, vertex2), weight))
                    else:
                        print(f"Skipping invalid edge name: {edge_name}")
                except ValueError:
                    print(f"Error parsing weight: {weight_str}")
            else:
                print(f"Skipping malformed line: {line.strip()}")
    
    graph = create_adjacency_list(edges)

    # Check if shared_data.json exists, create it if it doesn't
    if not os.path.exists('shared_data.json'):
        with open('shared_data.json', 'w') as file:
            json.dump({"adjacency": {}, "vertices_positions": {}}, file)

    # Load existing shared data
    with open('shared_data.json', 'r') as file:
        data = json.load(file)
    
    # Update the adjacency data
    data['adjacency'] = graph
    
    # Save updated shared data
    with open('shared_data.json', 'w') as file:
        json.dump(data, file, indent=4)
    
    # Print the adjacency list
    print("Adjacency List:")
    for vertex, neighbors in graph.items():
        print(f"{vertex}: {neighbors}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python handle_adjacency.py <file_path>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    load_adjacency(file_path)
