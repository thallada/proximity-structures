Space the dots out more. Don't let them get close.

Rotate the dots around the page in a circular pattern.

Click events:

* Get position of mouse click
* In drawPolygon, notice that there is an unresolved mouse click
* To resolve it, loop through every point
**  * Update target x by some constant * distance to mouse click
  * Constant can be tweaked for different effects (pull, vs, push)
  * Do the same for target y
* Empty mouse click register to resolve
* Continue with drawPolygon

Make a better points data structure with x and y keys.
