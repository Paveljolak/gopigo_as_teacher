import sys
import json
import time
from easygopigo3 import EasyGoPiGo3

timmy = EasyGoPiGo3()

def load_shared_data():
    with open('shared_data.json', 'r') as file:
        data = json.load(file)
    return data

def save_shared_data(data):
    with open('shared_data.json', 'w') as file:
        json.dump(data, file, indent=4)

def spin_and_flash(spins):
    for _ in range(spins):
        print("Spinning 360 degrees.")
        timmy.turn_degrees(360)
        time.sleep(1)
        flash_eyes()

    if spins == 0:
        flash_eyes()

def flash_eyes():
    for _ in range(3):
        print("Flashing eyes.")
        timmy.open_eyes()
        time.sleep(0.5)
        timmy.close_eyes()
        time.sleep(0.5)

def read_celebrate_file(filename):
    with open(filename, 'r') as file:
        spins = int(file.read().strip())
    return spins

def main():
    if len(sys.argv) != 2:
        print("Usage: python handle_celebrate.py <file_path>")
        sys.exit(1)

    file_path = sys.argv[1]

    # Load shared data
    data = load_shared_data()

    # Read the number of spins from the celebrate file
    spins = read_celebrate_file(file_path)

    # Perform the spins and flash eyes
    spin_and_flash(spins)

    # Save any updated data (if needed)
    save_shared_data(data)

if __name__ == "__main__":
    main()
