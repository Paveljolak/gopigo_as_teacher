import json
import os

def create_shared_data_file():
    
    shared_data = {
        "adjacency": {},
        "vertices_positions": {},
        "rotation": 45  
    }

    with open('shared_data.json', 'w') as file:
        json.dump(shared_data, file, indent=4)

if __name__ == "__main__":
    create_shared_data_file()
