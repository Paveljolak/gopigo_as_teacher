import sys
import json
import math
import time
from easygopigo3 import EasyGoPiGo3

timmy = EasyGoPiGo3()

def load_shared_data():
    with open('shared_data.json', 'r') as file:
        data = json.load(file)
    return data['adjacency'], data['vertices_positions'], data['rotation'], data['current_vertex']

def save_shared_data(rotation, current_vertex):
    with open('shared_data.json', 'r') as file:
        data = json.load(file)
    
    data['rotation'] = rotation 
    data['current_vertex'] = current_vertex 
    
    with open('shared_data.json', 'w') as file:
        json.dump(data, file, indent=4)

def calculate_angle_and_distance(source_point, target_point, total_rotation):

    # Calculate the change in x and y coordinates
    delta_x = target_point[0] - source_point[0]
    delta_y = target_point[1] - source_point[1]

    # Calculate angle
    angle_rad = math.atan2(delta_y, delta_x)
    angle_deg = math.degrees(angle_rad)

    # Adjust for total rotation
    angle_deg -= total_rotation

    # Normalize angle to be between -180 and 180 degrees
    angle_deg %= 360
    if angle_deg > 180:
        angle_deg -= 360

    # Calculate distance
    distance = math.sqrt(delta_x ** 2 + delta_y ** 2)

    return angle_deg, distance

def move_robot(source, target, vertex_coordinates, total_rotation):
    if source not in vertex_coordinates or target not in vertex_coordinates:
        print(f"Error: One of the vertices {source} or {target} is not found in vertex_coordinates.")
        return

    source_point = vertex_coordinates[source]
    target_point = vertex_coordinates[target]

    angle, distance = calculate_angle_and_distance(source_point, target_point, total_rotation)

    timmy.turn_degrees(-angle)
    time.sleep(1)

    timmy.drive_cm(distance * 3)
    time.sleep(1)

    return angle 

def flash_eyes(duration=2):
    timmy.open_eyes()
    time.sleep(duration)
    timmy.close_eyes()

def read_selected_vertex_file(filename):

    with open(filename, 'r') as file:
        vertex = file.read().strip()
    return vertex

def main():
    if len(sys.argv) != 2:
        print("Usage: python handle_selected_vertex.py <file_path>")
        sys.exit(1)

    file_path = sys.argv[1]

    # Load shared data
    _, vertex_coordinates, rotation, current_vertex = load_shared_data()
    total_rotation = rotation 

    # Read the target vertex from the selected vertex file
    target_vertex = read_selected_vertex_file(file_path)

    if not target_vertex:
        print("Error: selectedVertex.txt should contain a single vertex.")
        sys.exit(1)

    if current_vertex:
        # Move the robot from current_vertex to the target_vertex
        angle = move_robot(current_vertex, target_vertex, vertex_coordinates, total_rotation)
        if angle is not None:
            # Update the total rotation in the JSON after movement
            total_rotation += angle
            save_shared_data(total_rotation, target_vertex)

            # Flash the robot's eyes for 2 seconds
            flash_eyes(2)
    else:
        print("Error: current_vertex is not set in shared_data.json.")
        sys.exit(1)

if __name__ == "__main__":
    main()
