# The Binding of Isaac JSON Structure
This JSON contains information about The Binding of Isaac game, including game version, characters, and challenges.

## Top-level Structure
- `gameVersion`: String indicating the game version (e.g., "Repentance")
- `lastUpdated`: Date string of the last update
- `characters`: Array of character objects
- `challenges`: Array of challenge objects

## Character Object Structure
Each character object contains:
- `name`: Character's name
- `priorityMarks`: Array of integers indicating the indices of priority completion marks
- `completionMarks`: Array of completion mark objects
- `allHardModeUnlock`: String describing the unlock for completing all marks on hard mode

### Completion Mark Object
- `name`: Name of the completion mark
- `boss`: Boss associated with the mark
- `completed`: Boolean indicating if the mark is completed
- `hardModeCompleted`: Boolean indicating if the mark is completed on hard mode
- `unlock`: String describing the unlock for completing the mark
- `availableSince`: (Optional) String indicating which game version introduced this mark

## Challenge Object Structure
Each challenge object contains:
- `id`: Numeric ID of the challenge
- `name`: Name of the challenge
- `priority`: Boolean indicating if the challenge is a priority
- `characterAppearance`: Character used for the challenge
- `startingHealth`: Array of health objects (type and amount)
- `startingItems`: Array of starting item names
- `curses`: Array of curse names
- `itemPool`: Object describing available item pools
- `boss`: Final boss of the challenge
- `unlockCriteria`: String or object describing how to unlock the challenge
- `unlockReward`: String describing the reward for completing the challenge
- `specialConditions`: (Optional) Array of special conditions for the challenge
- `availableFrom`: (Optional) String indicating which game version introduced this challenge

# Icon Links
Contains links to icons mapped to names. Mainly used in `/src/js/isaac.js`.

## Credit
Icons have been taken from the [official Isaac wiki](https://bindingofisaacrebirth.fandom.com/wiki/Binding_of_Isaac:_Rebirth_Wiki).