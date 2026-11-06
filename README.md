# Terrarium

A small civilization-building game set in a voxel diorama inside a glass tank. Lead a tribe from a campfire to a town, keep everyone fed through the winter, survive floods and wildfires, and build the Great Tower up to the lid of the tank to win. If your people starve, freeze or lose hope, the civilization collapses.

**Play:** https://jupixels.github.io/terrarium/

## How to play
- **Build** homes and workplaces from the bottom toolbar. Villagers pick their own jobs: put up a workplace and someone will staff it.
- **Food:** each villager eats twice a day. Fishing docks, farms and foraging all bring in food. In winter the lake freezes and crops die.
- **Eras:** Camp → Village → Town. Meet the goals in the top-left panel, then advance.
- **Favor:** happy villagers and priests earn Favor. Spend it on god powers: rain, lightning, blessings, and raising or lowering the land.
- **Lose:** everyone dies, or the average mood stays below 22% for a full day.
- **Win:** finish the Great Tower.

Controls: left click uses the selected tool · right-drag orbits · middle-drag pans · wheel zooms · `Space` pauses · `T` changes speed · `?` opens help.

## Development
`index.html` is a self-contained build (no dependencies; WebGL2). The source lives in `src/`:
- `engine.js`: voxel world, terrain generation, mesher, WebGL renderer, camera
- `game.js`: simulation (villagers, jobs, buildings, water, fire, seasons, eras)
- `main.js`: UI, input, audio, main loop
- `template.html`: page layout and styles

After editing, rebuild with `python3 src/build.py`.

## Credits
Sound effects by [Kenney](https://kenney.nl) (CC0), via the game-sounds library.
