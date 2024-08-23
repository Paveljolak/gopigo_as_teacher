# Final Thesis Project
## Teaching Shortest Path Algorithms Using a Physical Robot

----
### Description
This project creates an interactive environment where a GoPiGo robot shows shortest path algorithms. The project includes a custom graph drawing application built with HTTML, CSS and JavaScript. This graph drawing application is projected onto a flat white floor using a physical projector. The GoPiGo robot is placed on this floor, navigating the projected graph. Users can draw their own custom graph, and the robot will traverse it.

The graph drawing application communicates with the robot via text files, which are processed by a Bash script. The robot then uses Python scripts to "see" the graph. It executes its movements according to one of three shortest path algorithms: Dijkstra's, A* (A star), or Bellman-Ford. 

The project has two modes:
- Screen Condition: The algorithms are visualized on the screen using colors.

- Robot condition: The robot physically demonstrates the algorithms through gestures and movements on the floor.


----
### Tech Stack:
- HTML, CSS, JavaScript
- Python
- Bash
- Physical Projector
- GoPiGo Robot.

----
#### NOTE:
Please note that while this repository contains the final version fo the project. Much of the development process, including continuous code updates, was done in a private repository. As a result, this repository contains only a few commits.
