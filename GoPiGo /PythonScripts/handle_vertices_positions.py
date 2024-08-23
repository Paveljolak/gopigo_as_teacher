import sys
import json
import os

def read_vertex_positions(file_path):
    vertex_coordinates = {}
    with open(file_path, 'r') as file:
        lines = file.readlines()

    for line in lines:
        parts = line.strip().split(", ")
        if len(parts) == 3:
            try:
                vertex_name = parts[0].split(": ")[1]
                x = int(float(parts[1].split(": ")[1]))  # Convert to integer
                y = int(float(parts[2].split(": ")[1]))  # Convert to integer
                vertex_coordinates[vertex_name] = (x, y)
            except Exception as e:
                print(f"Error parsing line: {line.strip()} - {e}")
    return vertex_coordinates

def load_vertex_positions(file_path):
    vertex_positions = read_vertex_positions(file_path)

    # Check if shared_data.json exists, create it if it doesn't
    if not os.path.exists('shared_data.json'):
        with open('shared_data.json', 'w') as file:
            json.dump({"adjacency": {}, "vertices_positions": {}}, file)

    # Load existing shared data
    with open('shared_data.json', 'r') as file:
        data = json.load(file)
    
    # Update the vertex positions data
    data['vertices_positions'] = vertex_positions
    
    # Save updated shared data
    with open('shared_data.json', 'w') as file:
        json.dump(data, file, indent=4)
    
    # Print the vertex positions
    print("Vertex Positions:")
    for vertex, position in vertex_positions.items():
        print(f"{vertex}: {position}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python handle_vertices_positions.py <file_path>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    load_vertex_positions(file_path)
