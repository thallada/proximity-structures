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

For debugging, display a line of the intended path for each point.
  * Run the whole tween function in one tick, drawing a single pixel along

If lines make a connected polygon, shade the inside of it with the average color
of all vertices composing the polygon. The more distant the points (and the
larger the polygon) the more dark the color is shaded.
