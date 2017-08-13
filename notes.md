Space the dots out more. Don't let them get close.
  * Still not sure if I want to do this

Rotate the dots around the page in a circular pattern.

Make a better points data structure with x and y keys.

If lines make a connected polygon, shade the inside of it with the average color
of all vertices composing the polygon. The more distant the points (and the
larger the polygon) the more dark the color is shaded.
  * Hard. Not sure where to start with this.

Add a bunch of dials and switches to the UI to tweak the different configurable
values.
  * Mostly implemented, need to add dials for click and hover vars
  * Make point count slider add/remove points dynamically without having to
    reset.
  * Make increasing cycleDuration auto randomize point cycles?
  * Save config to local storage and add a reset config to defaults button
  * Allow sharing configs

Crazy idea: add a 3rd dimension. Points with a z-index closer to zero will be
closer to the screen. I can simulate that by scaling the points and lines and
applying a blur filter to the points scaled down and further away.
    * Gave up on this
