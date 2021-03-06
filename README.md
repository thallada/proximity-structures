# Proximity Structures

A procedurally generated and interactive animation created with
[PixiJS](http://www.pixijs.com/).

Play with it here: [http://proximity.hallada.net](http://proximity.hallada.net)

[![GIF of the animation in
action](/img/proximity-structures.gif)](http://proximity.hallada.net)

A number of points are placed randomly on a canvas. They move in random
directions with their own movement behavior. Each is assigned a random color. If
other points travel close enough, a connection is drawn between them and each
point's color becomes an average of all of its connected points' colors.

### Interaction

Your mouse on the canvas will repel points away, but clicking and holding will
attract points towards your mouse until you let go, which will cause the points
to explode outwards in all directions.

Scrolling your mouse will speed up or slow down time.

### Keybindings

| Key   | Action                                              |
| ----- | --------------------------------------------------- |
| left  | hold to restrict points to the left of the screen   |
| right | hold to restrict points to the right of the screen  |
| up    | hold to restrict points to the top of the screen    |
| down  | hold to restrict points to the bottom of the screen |
| 1     | makes points move linearly                          |
| 2     | makes points meander                                |
| 3     | makes points snappy                                 |
| 4     | makes points bouncy                                 |
| 5     | makes points elastic                                |
| 6     | makes points overshoot                              |
| f     | toggles FPS counter                                 |
| d     | toggles debug mode (including FPS counter)          |
| n     | toggles display of nodes                            |
| l     | toggles display of lines                            |
| ?     | toggles display of help modal                       |

### Tweaking

There are many more configurable values that affect the animation which don't
have an interaction or keybinding. You can find all of these at the top of
[`proximity.js`](/js/proximity.js). If you are feeling experimental, you can
clone the repo and edit those yourself.
