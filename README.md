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
- **Saving:** the game autosaves every in-game morning and when you close the page. Use the save button (or Ctrl+S) for three manual save slots. Saves live in your browser's local storage, so they stay on that browser and device.

Controls: drag with the left mouse button to orbit, right-drag to pan, scroll to zoom. Pick something from the build tray, point at the ground and press **E** to build or use it (hold E to paint land). Left-click villagers or buildings to inspect them. `R` (or the crosshair button) recenters the view, `Tab` switches tray tabs, `Space` pauses, `T` changes speed, `?` opens help. Each season lasts 3 days, so a year is 12 days.

## Development
`index.html` is the built game (WebGL2, no dependencies) and loads its sounds and music from `audio/`. Because it fetches audio, run it from a web server (for example `python3 -m http.server`) rather than opening the file directly. The source lives in `src/`:
- `engine.js`: voxel world, terrain generation, mesher, WebGL renderer, camera
- `game.js`: simulation (villagers, jobs, buildings, water, fire, seasons, eras)
- `save.js`: save slots and autosave (browser local storage)
- `main.js`: UI, input, audio, main loop
- `template.html`: page layout and styles

After editing, rebuild with `python3 src/build.py`.

## Credits
Sound effects, ambience and music were generated with [ElevenLabs](https://elevenlabs.io). `src/sfx.js` is the audio manager from the game-sounds library.
