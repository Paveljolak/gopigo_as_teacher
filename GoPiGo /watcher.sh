#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WATCH_DIR="$SCRIPT_DIR/textFiles"
DEBOUNCE_DELAY=2  # seconds

# Path to the initialization script
INIT_SCRIPT="$SCRIPT_DIR/pythonScripts/initialize_shared_data.py"

# Function to initialize shared_data.json
initialize_shared_data() {
    if [ ! -f "$SCRIPT_DIR/shared_data.json" ]; then
        echo "Initializing shared_data.json..."
        python3 "$INIT_SCRIPT"
    else
        echo "shared_data.json already exists."
    fi
}

# Initialize shared data file if it does not exist
initialize_shared_data

# Timestamps to manage debounce mechanism
declare -A file_timestamps

# Function to process files and update JSON
process_file() {
    local file="$1"
    local script="$2"

    current_time=$(date +%s)

    # Debounce mechanism
    if [[ -n "${file_timestamps[$file]}" ]]; then
        last_update=${file_timestamps[$file]}
        if (( current_time - last_update < DEBOUNCE_DELAY )); then
            return
        fi
    fi

    file_timestamps[$file]=$current_time

    # Process the file if it exists
    if [ -f "$WATCH_DIR/$file" ]; then
        python3 "$SCRIPT_DIR/pythonScripts/$script" "$WATCH_DIR/$file"
        rm "$WATCH_DIR/$file"  # Remove the file after processing
    else
        echo "File $file not found, skipping."
    fi
}

# Monitor the watch directory for changes
inotifywait -m -e create -e moved_to "$WATCH_DIR" |
    while read -r dir action file; do
        case "$action" in
            CREATE|MOVED_TO)
                case "$file" in
                    adjacency.txt)
                        process_file "$file" "handle_adjacency.py"
                        ;;
                    verticesPositions.txt)
                        process_file "$file" "handle_vertices_positions.py"
                        ;;
                    selectedVertex.txt)
                        process_file "$file" "handle_selected_vertex.py"
                        ;;
                    poke.txt)
                        process_file "$file" "handle_poke.py"
                        ;;
                    traverse.txt)
                        process_file "$file" "handle_traverse.py"
                        ;;
		    celebrate.txt)
                        process_file "$file" "handle_celebrate.py"
                        ;;
		    shortestPath.txt)
                        process_file "$file" "handle_traverse.py"
                        ;;
                    *)
                        echo "Unknown file: $file"
                        ;;
                esac
                ;;
            *)
                echo "Ignored event: $action for file: $file"
                ;;
        esac
    done
