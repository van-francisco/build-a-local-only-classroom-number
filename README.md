# Classroom Operations Hub

A local-only classroom operations app for teachers. Number Picker, Timers, Rosters, Groups & Rotations, and Settings / Backup are completed modules; Seating is a placeholder for future tools.

## How to Open

Open `index.html` in any modern browser. No server, login, database, API, or internet connection is required.

## Hub Dashboard

The app opens to a draggable widget dashboard. Each widget represents a classroom operations tool. Drag widgets to reorder them, and the layout is saved in the browser's `localStorage`.

Use `Reset widget layout` on the Hub screen to restore the default widget order.

Current modules:

- `Number Picker`: complete and ready for daily use. The widget shows the current range, fairness mode, and numbers left today.
- `Timers`: complete countdown, stopwatch, and alarm tools for live classroom routines.
- `Rosters`: complete shared roster and daily absence manager for the Hub.
- `Groups & Rotations`: complete roster, grouping, constraint, and station rotation tools.
- `Seating`: placeholder for seating plans and random seat changes. It says `Coming later.`
- `Settings / Backup`: complete export, import, and local data management tools.

Click `Open Picker` on the Number Picker widget to open the working picker module. Click `Hub` in the bottom-left corner to return to the dashboard, or open `Terms of Service` and click `Back to Hub`.

## Number Picker

Number Picker is the completed first module. It keeps the clean projector view, private Teacher Controls panel, fairness memory, Teacher Cue, and local-only browser storage.

## Timers

Timers is a working module for classroom routines. Click `Open Timers` on the Timers dashboard widget to open the full-screen timer display. The display stays clean and does not show the full Hub dashboard while the timer is in use.

Use `Back to Hub` on the timer display to return to the dashboard. Use `Settings` in the bottom-right corner to open timer controls.

### Countdown Timer

Choose `Countdown Timer` in Timer Settings. Set a label, duration, and optional routine steps or notes. The display shows the label, large remaining time, and routine steps when present.

Controls:

- `Start`, `Pause`, and `Resume`
- `Reset / Clear`
- `Add 1 minute`
- `Add 2 minutes`

When the countdown reaches zero, the display shows `Time's up` and changes visually.

Default presets include:

- Clean up: 3 minutes
- Line up: 2 minutes
- Silent reading: 20 minutes
- Independent work: 15 minutes
- Math centers: 12 minutes
- Group rotation: 10 minutes
- Dismissal: 5 minutes

### Stopwatch

Choose `Stopwatch` in Timer Settings. Set a label such as `Math Sprint` or `Reading Stamina`, then use `Start`, `Pause`, `Resume`, and `Reset / Clear`.

Use `Lap` to record lap times. Laps appear in the Timer Settings panel so the projector display stays uncluttered. The last stopwatch label is saved locally.

### Alarm

Choose `Alarm` in Timer Settings. Set a label and a target time. The timer display shows the target alarm time and the remaining time.

Use `Activate alarm` to start it and `Cancel alarm` to stop it. When the target time is reached, the display shows the alarm label and `Alarm`.

The alarm only works while the app page is open. It does not use notifications.

### Timer Presets

In Timer Settings, selecting a preset loads its label, duration, and routine steps. `Save preset` stores the current countdown settings in localStorage. `Delete preset` asks for confirmation before removing a preset.

### Timer Sound

Sound is off by default. In Timer Settings, turn `Sound on`, choose `Soft chime`, `Bell`, or `Beep`, and use `Test sound` to preview it.

Sounds are generated locally with the Web Audio API. No audio files or external libraries are used. Browsers may block sound until you have clicked or interacted with the page.

## Rosters

Rosters are shared across Hub modules. Click `Manage Rosters` on the Rosters widget to create, edit, duplicate, delete, or set the active roster.

Paste student names one per line. Blank lines are trimmed, duplicate names are removed, and the student count updates after saving. The active roster is the default roster used by Groups & Rotations.

Absences are saved by date. Marking a student absent for today excludes that student from modules that read the shared roster, but it does not remove the student from the roster permanently. Use `Clear today's absences` to reset the active roster's absence checklist for the current date.

If older Groups & Rotations rosters are found in `classroomOperationsGroups`, they are copied into the shared roster system the first time the app loads the shared roster data. The old Groups data is not deleted by the migration.

## Groups & Rotations

Groups & Rotations is a working module for making groups and station schedules. Click `Open Groups` on the Groups & Rotations dashboard widget.

### Roster Setup

Groups & Rotations uses the shared active roster from the Hub Roster Manager. You can still save, load, rename, delete, and clear rosters from the Groups setup view, but those changes update the shared roster system.

Use the absence checklist to mark students absent for today. Absences are date-based and shared, so absent students are excluded from generated groups and rotations without being removed from the roster.

### Grouping Mode

Choose either `Number of groups` or `Students per group`. Only the relevant input is used when generating groups.

### Constraints

Constraints are best effort:

- `Keep-apart pairs`: enter lines such as `Student A | Student B`; the generator tries to avoid placing them together.
- `Must-pair students`: enter lines such as `Student A | Student B`; the generator tries to place them together.
- `Locked group assignments`: enter lines such as `Student A | Group 1`; locked students are placed first when possible.

If constraints cannot all be satisfied, the module generates the best groups it can and shows warnings only in setup view.

### Generate Groups

`Generate Groups` excludes absent students, applies locked assignments first, keeps must-pair students together when possible, randomly distributes remaining students, and tries 200 shuffle attempts to reduce constraint violations while keeping group sizes balanced.

Generated groups show group names, student names, and group sizes. Group names can be edited. You can reroll, move a student with dropdowns, save group sets, load saved group sets, and delete saved group sets.

### Station Rotations

Enter station names, one per line, then save or load station lists as needed. If groups and stations exist, click `Generate Rotation Schedule`.

Each group visits each station once. If there are more groups than stations, multiple groups can share stations in a round. If there are more stations than groups, some stations are empty. Set rotation length, transition length, and optional start time. The module shows total rotation time.

### Projector and Print Views

Projector view can show the group list, full rotation schedule, current round, or next round. It hides setup warnings and clutter.

Print buttons support:

- Print group list
- Print rotation schedule
- Print teacher copy with notes and warnings
- Print student-facing copy without warnings

## Settings / Backup

Settings / Backup is a working module for managing local app data. Click `Open Settings` on the Settings / Backup widget.

The App Data section summarizes the active roster, roster count, saved group sets, timer presets, Number Picker history dates, last backup/export date, and whether a custom Hub widget layout is saved.

### Full Backup

Click `Export full backup` to download a JSON file named like `classroom-operations-hub-backup-YYYY-MM-DD.json`.

The backup includes an export timestamp, app name, app version, and all localStorage keys used by the Hub, including:

- `classroomOperationsHubWidgetLayout`
- `classroomNumberPickerState`
- `classroomOperationsTimers`
- `classroomOperationsRosters`
- `classroomOperationsGroups`
- other `classroomOperations...` keys currently used by the app

### Import Backup

Choose a JSON backup file, then click `Import backup`. The app validates that the file looks like a Classroom Operations Hub backup and asks for confirmation before replacing current local data.

After import, the app reloads its in-memory state from localStorage and updates the dashboard.

### Individual Exports

Use the individual export buttons to download only one module's data:

- Number Picker data
- Timers data
- Rosters data
- Groups & Rotations data
- Hub layout data

### Clear Data

The Danger Zone has separate clear buttons for Number Picker, Timers, Rosters, Groups & Rotations, and Hub layout data. Each action asks for confirmation.

`Clear all app data` requires typing `CLEAR ALL` and then confirming again. Export a backup first if you may need the data later.

All data is saved only in this browser using localStorage. Export a backup before clearing browser data or switching computers.

## Setting the Number Range

1. Open the app.
2. Click `Open Picker` on the Number Picker widget.
3. Click the small `Terms of Service` button in the corner.
4. Set the start and end numbers, such as `1` and `30`.
5. Add excluded numbers if needed, separated by commas or spaces.
6. Click `Return to Projector Mode` before using the public display.

## Fairness Modes

The default mode is `Daily cycle`.

### Daily Cycle

Daily cycle picks randomly from the eligible numbers that have not yet been picked in the current daily cycle. Eligible numbers are numbers inside the range that are not excluded.

When every eligible number has been picked in the current cycle, the app starts a new cycle for today and all eligible numbers become available again.

### Multi-Day Balance

Multi-day balance looks at pick history from the last 5 calendar days. It counts how often each eligible number has been picked, finds the least-picked numbers, and randomly chooses among the tied least-picked numbers.

This helps spread picks across several school days while still keeping the public picker simple.

### True Random

True random is selected from the `Fairness Mode` dropdown. It picks from all eligible numbers every time, and repeats are allowed.

## Teacher Cue

Teacher Cue is a private setup feature for moments when a prepared student should share. In Teacher Controls Mode, enter a `Next cued number` and click `Set cue`.

If the cue is valid, the next press of `Pick Number` will show that number regardless of the current fairness mode. The public display looks exactly the same as a random pick. The cue is automatically cleared after one use.

Cued picks are saved normally in dated history, with no public label. They count toward Daily cycle, Multi-day balance, and all fairness dashboard counts.

Private cue status only appears in Teacher Controls Mode:

- `Cue ready`
- `No cue set`
- `Cue number is outside the current range`
- `Cue number is currently excluded`

If a cue is invalid, the public picker falls back to the selected fairness mode. Recent picks never show whether a number was random or cued.

## Fairness Dashboard

The Fairness Dashboard appears only in Teacher Controls Mode. It shows:

- Current fairness mode
- Picked today count
- Numbers left in today's cycle
- Current cycle number
- For each eligible number: picked today, times picked in the last 5 days, and times picked all time

Projector Mode never shows the dashboard, cue status, teacher settings, or whether a pick was random or cued.

## Fairness Reset Buttons

All reset buttons ask for confirmation.

- `Reset today's picks`: clears only today's pick history. Older history, settings, range, excluded numbers, and Teacher Cue settings are kept.
- `Start new round`: keeps today's pick history but increments the daily cycle number so all eligible numbers can be picked again.
- `Reset 5-day fairness memory`: clears pick history from the last 5 calendar days only. Settings are kept.
- `Reset all pick history`: clears saved pick history across all dates. Settings are kept.
- `New day reset`: clears today's picks and keeps long-term fairness history from other dates.

## Countdown

Countdown is optional and off by default. When enabled, the display shows `3`, `2`, `1` before revealing the selected number. Countdown looks the same for random and cued picks.

## Keyboard Shortcuts

- `Spacebar` or `Enter`: pick a number in Projector Mode
- `Escape`: immediately return to Projector Mode
- `R`: reset today's picks after confirmation in Teacher Controls Mode

## Teacher Controls

Teacher Controls are hidden by default for classroom discretion. Click the small `Terms of Service` button in the corner to open them, and click `Return to Projector Mode` or press `Escape` to return to the clean student-facing view.

There is no PIN and no real security. Anyone using the same browser can open Teacher Controls.

## localStorage

The Hub dashboard saves widget order in a separate `localStorage` key named `classroomOperationsHubWidgetLayout`.

Settings / Backup records the last export/import management timestamp in `classroomOperationsLastBackupAt`.

The Timers module saves presets, labels, mode, alarm time, and sound settings in a separate `localStorage` key named `classroomOperationsTimers`.

Shared rosters, active roster selection, and date-based absences are saved in a separate `localStorage` key named `classroomOperationsRosters`.

The Groups & Rotations module saves group sets, station lists, last generated rotation, and selected settings in a separate `localStorage` key named `classroomOperationsGroups`. Older rosters saved there are copied into `classroomOperationsRosters` if found, but the old data is not immediately deleted.

The Number Picker module saves settings and pick history in the browser's `localStorage`. Existing Number Picker settings and history use the same local storage key as before: `classroomNumberPickerState`. Pick history is saved by date using a structure like:

```json
{
  "historyByDate": {
    "YYYY-MM-DD": [
      { "number": 5, "timestamp": "...", "cycle": 1 }
    ]
  },
  "currentDate": "YYYY-MM-DD",
  "currentCycle": 1
}
```

Saved locally:

- Number range
- Excluded numbers
- Fairness mode
- Countdown setting
- Recent-picks setting
- Numbers-left setting
- Pick history by date
- Current cycle
- Current teacher cue

All data remains local to the browser and device. There is no server, database, login, external API, external library, or internet dependency.

## Known Limitations

- Teacher Controls are discreet, but not secured by a PIN or authentication.
- Data stays only in the browser and device where the app is used.
- Clearing browser data will erase saved settings and history.
- The app does not sync between computers.
