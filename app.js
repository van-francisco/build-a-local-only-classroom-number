(function () {
  const APP_NAME = "Classroom Operations Hub";
  const APP_VERSION = "1.0.0";
  const STORAGE_KEY = "classroomNumberPickerState";
  const HUB_LAYOUT_KEY = "classroomOperationsHubWidgetLayout";
  const TIMER_STORAGE_KEY = "classroomOperationsTimers";
  const GROUPS_STORAGE_KEY = "classroomOperationsGroups";
  const ROSTER_STORAGE_KEY = "classroomOperationsRosters";
  const BACKUP_META_KEY = "classroomOperationsLastBackupAt";
  const DEFAULT_WIDGET_ORDER = ["numberPicker", "timers", "rosters", "groups", "seating", "settings"];
  const FAIRNESS_MODES = {
    daily: "Daily cycle",
    multiDay: "Multi-day balance",
    random: "True random"
  };
  const TIMER_MODE_LABELS = {
    countdown: "Timer",
    stopwatch: "Stopwatch",
    alarm: "Alarm"
  };
  const DEFAULT_TIMER_PRESETS = [
    { label: "Clean up", durationSeconds: 180, steps: ["Put materials away", "Clear tables", "Stand by your seat"] },
    { label: "Line up", durationSeconds: 120, steps: ["Push in chairs", "Get supplies", "Line up quietly"] },
    { label: "Silent reading", durationSeconds: 1200, steps: ["Choose a book", "Read silently", "Track stamina"] },
    { label: "Independent work", durationSeconds: 900, steps: ["Start right away", "Use quiet voices", "Check your work"] },
    { label: "Math centers", durationSeconds: 720, steps: ["Stay with your group", "Use center materials", "Reset before rotating"] },
    { label: "Group rotation", durationSeconds: 600, steps: ["Finish current task", "Move to next station", "Begin quickly"] },
    { label: "Dismissal", durationSeconds: 300, steps: ["Pack backpack", "Clean area", "Wait for dismissal"] }
  ];
  const DEFAULT_STATE = {
    rangeStart: 1,
    rangeEnd: 30,
    excludedText: "",
    countdownMode: false,
    showRecent: true,
    showLeftCount: true,
    fairnessMode: "daily",
    currentDate: todayKey(),
    currentCycle: 1,
    historyByDate: {},
    cue: null
  };
  const DEFAULT_TIMER_STATE = {
    mode: "countdown",
    label: "Clean up",
    durationSeconds: 180,
    routineText: DEFAULT_TIMER_PRESETS[0].steps.join("\n"),
    selectedPreset: "Clean up",
    presets: DEFAULT_TIMER_PRESETS,
    stopwatchLabel: "Math Sprint",
    alarmLabel: "Pack up",
    alarmTime: "",
    soundEnabled: false,
    soundType: "soft"
  };
  const DEFAULT_GROUPS_STATE = {
    rosters: {},
    selectedRoster: "",
    rosterName: "My class",
    currentRoster: [],
    absencesByDate: {},
    groupingMode: "groups",
    numberOfGroups: 4,
    studentsPerGroup: 4,
    keepApartText: "",
    mustPairText: "",
    lockedText: "",
    groupSetName: "Today's groups",
    groupSets: {},
    currentGroups: [],
    stationLists: {},
    selectedStationList: "",
    stationListName: "Stations",
    stationsText: "",
    rotationMinutes: 10,
    transitionMinutes: 2,
    rotationStartTime: "",
    lastRotation: null,
    warnings: [],
    projectorMode: "groups",
    currentRoundIndex: 0
  };
  const DEFAULT_ROSTER_STATE = {
    rosters: [],
    activeRosterId: "",
    absencesByDate: {},
    migratedGroupsRosters: false
  };

  const elements = {
    hubView: document.getElementById("hubView"),
    dashboardGrid: document.getElementById("dashboardGrid"),
    resetWidgetLayout: document.getElementById("resetWidgetLayout"),
    numberPickerModule: document.getElementById("numberPickerModule"),
    openNumberPicker: document.getElementById("openNumberPicker"),
    openTimers: document.getElementById("openTimers"),
    openRosters: document.getElementById("openRosters"),
    openGroups: document.getElementById("openGroups"),
    openSettings: document.getElementById("openSettings"),
    widgetRange: document.getElementById("widgetRange"),
    widgetFairnessMode: document.getElementById("widgetFairnessMode"),
    widgetNumbersLeft: document.getElementById("widgetNumbersLeft"),
    timerWidgetMode: document.getElementById("timerWidgetMode"),
    timerWidgetPreset: document.getElementById("timerWidgetPreset"),
    rostersWidgetActive: document.getElementById("rostersWidgetActive"),
    rostersWidgetEligible: document.getElementById("rostersWidgetEligible"),
    groupsWidgetRoster: document.getElementById("groupsWidgetRoster"),
    groupsWidgetSet: document.getElementById("groupsWidgetSet"),
    rostersModule: document.getElementById("rostersModule"),
    rostersBackToHub: document.getElementById("rostersBackToHub"),
    sharedRosterSelect: document.getElementById("sharedRosterSelect"),
    sharedRosterName: document.getElementById("sharedRosterName"),
    sharedRosterInput: document.getElementById("sharedRosterInput"),
    createSharedRoster: document.getElementById("createSharedRoster"),
    saveSharedRoster: document.getElementById("saveSharedRoster"),
    loadSharedRoster: document.getElementById("loadSharedRoster"),
    renameSharedRoster: document.getElementById("renameSharedRoster"),
    duplicateSharedRoster: document.getElementById("duplicateSharedRoster"),
    deleteSharedRoster: document.getElementById("deleteSharedRoster"),
    setActiveRoster: document.getElementById("setActiveRoster"),
    sharedRosterCounts: document.getElementById("sharedRosterCounts"),
    sharedRosterWarnings: document.getElementById("sharedRosterWarnings"),
    sharedAbsenceList: document.getElementById("sharedAbsenceList"),
    clearSharedAbsences: document.getElementById("clearSharedAbsences"),
    settingsModule: document.getElementById("settingsModule"),
    settingsBackToHub: document.getElementById("settingsBackToHub"),
    settingsDataSummary: document.getElementById("settingsDataSummary"),
    exportFullBackup: document.getElementById("exportFullBackup"),
    exportNumberPickerData: document.getElementById("exportNumberPickerData"),
    exportTimersData: document.getElementById("exportTimersData"),
    exportRostersData: document.getElementById("exportRostersData"),
    exportGroupsData: document.getElementById("exportGroupsData"),
    exportHubLayoutData: document.getElementById("exportHubLayoutData"),
    backupFileInput: document.getElementById("backupFileInput"),
    importBackup: document.getElementById("importBackup"),
    backupMessage: document.getElementById("backupMessage"),
    clearNumberPickerData: document.getElementById("clearNumberPickerData"),
    clearTimersData: document.getElementById("clearTimersData"),
    clearRostersData: document.getElementById("clearRostersData"),
    clearGroupsData: document.getElementById("clearGroupsData"),
    clearHubLayoutData: document.getElementById("clearHubLayoutData"),
    clearAllAppData: document.getElementById("clearAllAppData"),
    groupsModule: document.getElementById("groupsModule"),
    groupsSetupView: document.getElementById("groupsSetupView"),
    groupsProjectorView: document.getElementById("groupsProjectorView"),
    groupsBackToHub: document.getElementById("groupsBackToHub"),
    groupsProjectorOpen: document.getElementById("groupsProjectorOpen"),
    groupsProjectorBackToSetup: document.getElementById("groupsProjectorBackToSetup"),
    groupsProjectorBackToHub: document.getElementById("groupsProjectorBackToHub"),
    rosterSelect: document.getElementById("rosterSelect"),
    rosterName: document.getElementById("rosterName"),
    rosterInput: document.getElementById("rosterInput"),
    saveRoster: document.getElementById("saveRoster"),
    loadRoster: document.getElementById("loadRoster"),
    renameRoster: document.getElementById("renameRoster"),
    deleteRoster: document.getElementById("deleteRoster"),
    clearRoster: document.getElementById("clearRoster"),
    rosterCounts: document.getElementById("rosterCounts"),
    absenceList: document.getElementById("absenceList"),
    groupingMode: document.getElementById("groupingMode"),
    numberOfGroups: document.getElementById("numberOfGroups"),
    studentsPerGroup: document.getElementById("studentsPerGroup"),
    groupSetName: document.getElementById("groupSetName"),
    generateGroups: document.getElementById("generateGroups"),
    saveGroupSet: document.getElementById("saveGroupSet"),
    groupSetSelect: document.getElementById("groupSetSelect"),
    loadGroupSet: document.getElementById("loadGroupSet"),
    deleteGroupSet: document.getElementById("deleteGroupSet"),
    groupsWarnings: document.getElementById("groupsWarnings"),
    keepApartInput: document.getElementById("keepApartInput"),
    mustPairInput: document.getElementById("mustPairInput"),
    lockedInput: document.getElementById("lockedInput"),
    stationListSelect: document.getElementById("stationListSelect"),
    stationListName: document.getElementById("stationListName"),
    stationsInput: document.getElementById("stationsInput"),
    saveStationList: document.getElementById("saveStationList"),
    loadStationList: document.getElementById("loadStationList"),
    clearStationList: document.getElementById("clearStationList"),
    deleteStationList: document.getElementById("deleteStationList"),
    moveStudentSelect: document.getElementById("moveStudentSelect"),
    moveGroupSelect: document.getElementById("moveGroupSelect"),
    moveStudent: document.getElementById("moveStudent"),
    rerollGroups: document.getElementById("rerollGroups"),
    generatedGroups: document.getElementById("generatedGroups"),
    rotationMinutes: document.getElementById("rotationMinutes"),
    transitionMinutes: document.getElementById("transitionMinutes"),
    rotationStartTime: document.getElementById("rotationStartTime"),
    generateRotation: document.getElementById("generateRotation"),
    rotationTotalTime: document.getElementById("rotationTotalTime"),
    rotationTableWrap: document.getElementById("rotationTableWrap"),
    groupsProjectorTitle: document.getElementById("groupsProjectorTitle"),
    groupsProjectorOutput: document.getElementById("groupsProjectorOutput"),
    showGroupsProjector: document.getElementById("showGroupsProjector"),
    showRotationProjector: document.getElementById("showRotationProjector"),
    showCurrentRound: document.getElementById("showCurrentRound"),
    showNextRound: document.getElementById("showNextRound"),
    timersModule: document.getElementById("timersModule"),
    timerDisplay: document.getElementById("timerDisplay"),
    timerBackToHub: document.getElementById("timerBackToHub"),
    openTimerSettings: document.getElementById("openTimerSettings"),
    timerModeDisplay: document.getElementById("timerModeDisplay"),
    timerLabelDisplay: document.getElementById("timerLabelDisplay"),
    timerTimeDisplay: document.getElementById("timerTimeDisplay"),
    timerMessageDisplay: document.getElementById("timerMessageDisplay"),
    timerRoutineDisplay: document.getElementById("timerRoutineDisplay"),
    timerStartPause: document.getElementById("timerStartPause"),
    timerReset: document.getElementById("timerReset"),
    timerAddOne: document.getElementById("timerAddOne"),
    timerAddTwo: document.getElementById("timerAddTwo"),
    timerLap: document.getElementById("timerLap"),
    timerCancelAlarm: document.getElementById("timerCancelAlarm"),
    timerSettingsPanel: document.getElementById("timerSettingsPanel"),
    closeTimerSettings: document.getElementById("closeTimerSettings"),
    timerSettingsBackToHub: document.getElementById("timerSettingsBackToHub"),
    timerMode: document.getElementById("timerMode"),
    timerLabel: document.getElementById("timerLabel"),
    timerHours: document.getElementById("timerHours"),
    timerMinutes: document.getElementById("timerMinutes"),
    timerSeconds: document.getElementById("timerSeconds"),
    alarmTimeInput: document.getElementById("alarmTimeInput"),
    timerRoutine: document.getElementById("timerRoutine"),
    timerPreset: document.getElementById("timerPreset"),
    saveTimerPreset: document.getElementById("saveTimerPreset"),
    deleteTimerPreset: document.getElementById("deleteTimerPreset"),
    timerSoundEnabled: document.getElementById("timerSoundEnabled"),
    timerSoundType: document.getElementById("timerSoundType"),
    testTimerSound: document.getElementById("testTimerSound"),
    lapList: document.getElementById("lapList"),
    placeholderView: document.getElementById("placeholderView"),
    placeholderTitle: document.getElementById("placeholderTitle"),
    placeholderStatus: document.getElementById("placeholderStatus"),
    placeholderBack: document.getElementById("placeholderBack"),
    pickedNumber: document.getElementById("pickedNumber"),
    pickButton: document.getElementById("pickButton"),
    numbersLeftText: document.getElementById("numbersLeftText"),
    recentPicksPanel: document.getElementById("recentPicksPanel"),
    recentPicksList: document.getElementById("recentPicksList"),
    projectorHub: document.getElementById("projectorHub"),
    openTeacherControls: document.getElementById("openTeacherControls"),
    teacherView: document.getElementById("teacherView"),
    backToHub: document.getElementById("backToHub"),
    returnProjector: document.getElementById("returnProjector"),
    rangeStart: document.getElementById("rangeStart"),
    rangeEnd: document.getElementById("rangeEnd"),
    excludedNumbers: document.getElementById("excludedNumbers"),
    rangeWarning: document.getElementById("rangeWarning"),
    countdownMode: document.getElementById("countdownMode"),
    showRecent: document.getElementById("showRecent"),
    showLeftCount: document.getElementById("showLeftCount"),
    resetHistory: document.getElementById("resetHistory"),
    clearAll: document.getElementById("clearAll"),
    cueInput: document.getElementById("cueInput"),
    setCue: document.getElementById("setCue"),
    clearCue: document.getElementById("clearCue"),
    cueStatus: document.getElementById("cueStatus"),
    fairnessMode: document.getElementById("fairnessMode"),
    fairnessSummary: document.getElementById("fairnessSummary"),
    fairnessTableBody: document.getElementById("fairnessTableBody"),
    startNewRound: document.getElementById("startNewRound"),
    resetFiveDay: document.getElementById("resetFiveDay"),
    resetAllHistory: document.getElementById("resetAllHistory")
  };

  let state = loadState();
  let timerState = loadTimerState();
  let groupsState = loadGroupsState();
  let rosterState = loadRosterState(groupsState);
  let timerRuntime = createTimerRuntime(timerState.durationSeconds);
  let isPicking = false;
  let draggedWidget = null;
  let timerInterval = null;
  let audioContext = null;

  ensureCurrentDate();
  saveState();
  saveTimerState();
  bindEvents();
  renderWidgetOrder();
  render();

  function bindEvents() {
    elements.openNumberPicker.addEventListener("click", showNumberPicker);
    elements.openTimers.addEventListener("click", showTimers);
    elements.openRosters.addEventListener("click", showRosters);
    elements.openGroups.addEventListener("click", showGroups);
    elements.openSettings.addEventListener("click", showSettings);
    elements.resetWidgetLayout.addEventListener("click", resetWidgetLayout);
    elements.placeholderBack.addEventListener("click", showHub);
    document.querySelectorAll("[data-placeholder]").forEach((button) => {
      button.addEventListener("click", () => showPlaceholder(button.dataset.placeholder, button.dataset.status));
    });
    elements.pickButton.addEventListener("click", pickNumber);
    elements.timerBackToHub.addEventListener("click", showHub);
    elements.timerSettingsBackToHub.addEventListener("click", showHub);
    elements.openTimerSettings.addEventListener("click", openTimerSettings);
    elements.closeTimerSettings.addEventListener("click", closeTimerSettings);
    elements.timerStartPause.addEventListener("click", handleTimerStartPause);
    elements.timerReset.addEventListener("click", resetTimerRuntime);
    elements.timerAddOne.addEventListener("click", () => addCountdownSeconds(60));
    elements.timerAddTwo.addEventListener("click", () => addCountdownSeconds(120));
    elements.timerLap.addEventListener("click", addStopwatchLap);
    elements.timerCancelAlarm.addEventListener("click", cancelAlarm);
    elements.timerMode.addEventListener("change", updateTimerSettingsFromControls);
    elements.timerLabel.addEventListener("input", updateTimerSettingsFromControls);
    elements.timerHours.addEventListener("input", updateTimerSettingsFromControls);
    elements.timerMinutes.addEventListener("input", updateTimerSettingsFromControls);
    elements.timerSeconds.addEventListener("input", updateTimerSettingsFromControls);
    elements.alarmTimeInput.addEventListener("input", updateTimerSettingsFromControls);
    elements.timerRoutine.addEventListener("input", updateTimerSettingsFromControls);
    elements.timerPreset.addEventListener("change", loadSelectedTimerPreset);
    elements.saveTimerPreset.addEventListener("click", saveTimerPreset);
    elements.deleteTimerPreset.addEventListener("click", deleteTimerPreset);
    elements.timerSoundEnabled.addEventListener("change", updateTimerSettingsFromControls);
    elements.timerSoundType.addEventListener("change", updateTimerSettingsFromControls);
    elements.testTimerSound.addEventListener("click", () => playTimerSound(true));
    elements.rostersBackToHub.addEventListener("click", showHub);
    elements.createSharedRoster.addEventListener("click", createSharedRoster);
    elements.saveSharedRoster.addEventListener("click", saveSharedRoster);
    elements.loadSharedRoster.addEventListener("click", loadSharedRoster);
    elements.renameSharedRoster.addEventListener("click", renameSharedRoster);
    elements.duplicateSharedRoster.addEventListener("click", duplicateSharedRoster);
    elements.deleteSharedRoster.addEventListener("click", deleteSharedRoster);
    elements.setActiveRoster.addEventListener("click", setSelectedActiveRoster);
    elements.clearSharedAbsences.addEventListener("click", clearSharedAbsences);
    elements.sharedRosterInput.addEventListener("input", updateSharedRosterFromInput);
    elements.settingsBackToHub.addEventListener("click", showHub);
    elements.exportFullBackup.addEventListener("click", exportFullBackup);
    elements.exportNumberPickerData.addEventListener("click", () => exportStorageKeys("number-picker", [STORAGE_KEY]));
    elements.exportTimersData.addEventListener("click", () => exportStorageKeys("timers", [TIMER_STORAGE_KEY]));
    elements.exportRostersData.addEventListener("click", () => exportStorageKeys("rosters", [ROSTER_STORAGE_KEY]));
    elements.exportGroupsData.addEventListener("click", () => exportStorageKeys("groups-rotations", [GROUPS_STORAGE_KEY]));
    elements.exportHubLayoutData.addEventListener("click", () => exportStorageKeys("hub-layout", [HUB_LAYOUT_KEY]));
    elements.importBackup.addEventListener("click", importBackup);
    elements.clearNumberPickerData.addEventListener("click", () => clearStorageKeyWithConfirmation(STORAGE_KEY, "Number Picker data"));
    elements.clearTimersData.addEventListener("click", () => clearStorageKeyWithConfirmation(TIMER_STORAGE_KEY, "Timers data"));
    elements.clearRostersData.addEventListener("click", () => clearStorageKeyWithConfirmation(ROSTER_STORAGE_KEY, "Rosters data"));
    elements.clearGroupsData.addEventListener("click", () => clearStorageKeyWithConfirmation(GROUPS_STORAGE_KEY, "Groups & Rotations data"));
    elements.clearHubLayoutData.addEventListener("click", () => clearStorageKeyWithConfirmation(HUB_LAYOUT_KEY, "Hub layout"));
    elements.clearAllAppData.addEventListener("click", clearAllAppData);
    elements.groupsBackToHub.addEventListener("click", showHub);
    elements.groupsProjectorBackToHub.addEventListener("click", showHub);
    elements.groupsProjectorOpen.addEventListener("click", showGroupsProjector);
    elements.groupsProjectorBackToSetup.addEventListener("click", showGroupsSetup);
    elements.saveRoster.addEventListener("click", saveRoster);
    elements.loadRoster.addEventListener("click", loadSelectedRoster);
    elements.renameRoster.addEventListener("click", renameRoster);
    elements.deleteRoster.addEventListener("click", deleteRoster);
    elements.clearRoster.addEventListener("click", clearRoster);
    elements.rosterInput.addEventListener("input", updateRosterFromInput);
    elements.groupingMode.addEventListener("change", updateGroupsSettingsFromControls);
    elements.numberOfGroups.addEventListener("input", updateGroupsSettingsFromControls);
    elements.studentsPerGroup.addEventListener("input", updateGroupsSettingsFromControls);
    elements.keepApartInput.addEventListener("input", updateGroupsSettingsFromControls);
    elements.mustPairInput.addEventListener("input", updateGroupsSettingsFromControls);
    elements.lockedInput.addEventListener("input", updateGroupsSettingsFromControls);
    elements.groupSetName.addEventListener("input", updateGroupsSettingsFromControls);
    elements.generateGroups.addEventListener("click", generateGroups);
    elements.rerollGroups.addEventListener("click", generateGroups);
    elements.saveGroupSet.addEventListener("click", saveGroupSet);
    elements.loadGroupSet.addEventListener("click", loadGroupSet);
    elements.deleteGroupSet.addEventListener("click", deleteGroupSet);
    elements.moveStudent.addEventListener("click", moveSelectedStudent);
    elements.saveStationList.addEventListener("click", saveStationList);
    elements.loadStationList.addEventListener("click", loadStationList);
    elements.clearStationList.addEventListener("click", clearStationList);
    elements.deleteStationList.addEventListener("click", deleteStationList);
    elements.stationsInput.addEventListener("input", updateGroupsSettingsFromControls);
    elements.stationListName.addEventListener("input", updateGroupsSettingsFromControls);
    elements.rotationMinutes.addEventListener("input", updateGroupsSettingsFromControls);
    elements.transitionMinutes.addEventListener("input", updateGroupsSettingsFromControls);
    elements.rotationStartTime.addEventListener("input", updateGroupsSettingsFromControls);
    elements.generateRotation.addEventListener("click", generateRotation);
    elements.showGroupsProjector.addEventListener("click", () => setGroupsProjectorMode("groups"));
    elements.showRotationProjector.addEventListener("click", () => setGroupsProjectorMode("rotation"));
    elements.showCurrentRound.addEventListener("click", () => setGroupsProjectorMode("current"));
    elements.showNextRound.addEventListener("click", () => setGroupsProjectorMode("next"));
    document.querySelectorAll("[data-print-mode]").forEach((button) => {
      button.addEventListener("click", () => printGroups(button.dataset.printMode));
    });
    elements.projectorHub.addEventListener("click", showHub);
    elements.openTeacherControls.addEventListener("click", openTeacherControls);
    elements.backToHub.addEventListener("click", showHub);
    elements.returnProjector.addEventListener("click", returnToProjector);

    elements.rangeStart.addEventListener("input", updateSettingsFromControls);
    elements.rangeEnd.addEventListener("input", updateSettingsFromControls);
    elements.excludedNumbers.addEventListener("input", updateSettingsFromControls);
    elements.countdownMode.addEventListener("change", updateSettingsFromControls);
    elements.showRecent.addEventListener("change", updateSettingsFromControls);
    elements.showLeftCount.addEventListener("change", updateSettingsFromControls);
    elements.fairnessMode.addEventListener("change", updateFairnessMode);

    elements.resetHistory.addEventListener("click", resetTodayWithConfirmation);
    elements.startNewRound.addEventListener("click", startNewRoundWithConfirmation);
    elements.resetFiveDay.addEventListener("click", resetFiveDayWithConfirmation);
    elements.resetAllHistory.addEventListener("click", resetAllHistoryWithConfirmation);
    elements.clearAll.addEventListener("click", newDayResetWithConfirmation);
    elements.setCue.addEventListener("click", setCue);
    elements.clearCue.addEventListener("click", clearCue);
    elements.dashboardGrid.querySelectorAll("[data-widget-id]").forEach((widget) => {
      widget.addEventListener("dragstart", handleWidgetDragStart);
      widget.addEventListener("dragover", handleWidgetDragOver);
      widget.addEventListener("dragleave", handleWidgetDragLeave);
      widget.addEventListener("drop", handleWidgetDrop);
      widget.addEventListener("dragend", handleWidgetDragEnd);
    });

    document.addEventListener("keydown", handleKeyboard);
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
      const historyByDate = normalizeHistoryByDate(saved);
      const currentDate = saved.currentDate || saved.historyDate || todayKey();
      const fairnessMode = saved.fairnessMode || (saved.repeatMode ? "random" : DEFAULT_STATE.fairnessMode);
      return {
        ...DEFAULT_STATE,
        rangeStart: saved.rangeStart ?? DEFAULT_STATE.rangeStart,
        rangeEnd: saved.rangeEnd ?? DEFAULT_STATE.rangeEnd,
        excludedText: saved.excludedText ?? DEFAULT_STATE.excludedText,
        countdownMode: saved.countdownMode ?? DEFAULT_STATE.countdownMode,
        showRecent: saved.showRecent ?? DEFAULT_STATE.showRecent,
        showLeftCount: saved.showLeftCount ?? DEFAULT_STATE.showLeftCount,
        fairnessMode,
        currentDate,
        currentCycle: Number.isFinite(saved.currentCycle) ? saved.currentCycle : getStoredCycle(historyByDate[currentDate]),
        historyByDate,
        cue: saved.cue ?? DEFAULT_STATE.cue
      };
    } catch (error) {
      return { ...DEFAULT_STATE };
    }
  }

  function normalizeHistoryByDate(saved) {
    const historyByDate = {};

    if (saved.historyByDate && typeof saved.historyByDate === "object") {
      Object.keys(saved.historyByDate).forEach((date) => {
        historyByDate[date] = saved.historyByDate[date].map((entry) => normalizeEntry(entry));
      });
    }

    if (Array.isArray(saved.history) && saved.history.length > 0) {
      const legacyDate = saved.historyDate || todayKey();
      historyByDate[legacyDate] = saved.history.map((entry) => normalizeEntry(entry));
    }

    return historyByDate;
  }

  function normalizeEntry(entry) {
    return {
      number: Number.parseInt(entry.number, 10),
      timestamp: entry.timestamp || entry.time || new Date().toISOString(),
      cycle: Number.isFinite(entry.cycle) ? entry.cycle : 1
    };
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function loadTimerState() {
    try {
      const saved = JSON.parse(localStorage.getItem(TIMER_STORAGE_KEY)) || {};
      const presets = Array.isArray(saved.presets) && saved.presets.length > 0
        ? saved.presets
        : DEFAULT_TIMER_PRESETS;
      return {
        ...DEFAULT_TIMER_STATE,
        ...saved,
        presets,
        soundEnabled: Boolean(saved.soundEnabled)
      };
    } catch (error) {
      return { ...DEFAULT_TIMER_STATE, presets: [...DEFAULT_TIMER_PRESETS] };
    }
  }

  function saveTimerState() {
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(timerState));
    renderTimerWidget();
  }

  function loadGroupsState() {
    try {
      const saved = JSON.parse(localStorage.getItem(GROUPS_STORAGE_KEY)) || {};
      return { ...DEFAULT_GROUPS_STATE, ...saved };
    } catch (error) {
      return { ...DEFAULT_GROUPS_STATE };
    }
  }

  function saveGroupsState() {
    let previous = {};
    try {
      previous = JSON.parse(localStorage.getItem(GROUPS_STORAGE_KEY)) || {};
    } catch (error) {
      previous = {};
    }
    const next = { ...groupsState };
    ["rosters", "selectedRoster", "rosterName", "currentRoster", "absencesByDate"].forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(previous, key)) {
        next[key] = previous[key];
      } else {
        delete next[key];
      }
    });
    localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(next));
    renderGroupsWidget();
  }

  function loadRosterState(groupsSnapshot) {
    let shared;
    try {
      shared = JSON.parse(localStorage.getItem(ROSTER_STORAGE_KEY)) || {};
    } catch (error) {
      shared = {};
    }

    const normalized = {
      ...DEFAULT_ROSTER_STATE,
      ...shared,
      rosters: Array.isArray(shared.rosters) ? shared.rosters.map(normalizeRoster).filter(Boolean) : [],
      absencesByDate: shared.absencesByDate && typeof shared.absencesByDate === "object" ? shared.absencesByDate : {}
    };

    if (!normalized.migratedGroupsRosters) {
      migrateGroupsRosters(normalized, groupsSnapshot);
      normalized.migratedGroupsRosters = true;
    }
    if (!normalized.activeRosterId && normalized.rosters[0]) {
      normalized.activeRosterId = normalized.rosters[0].id;
    }
    if (normalized.activeRosterId && !normalized.rosters.some((roster) => roster.id === normalized.activeRosterId)) {
      normalized.activeRosterId = normalized.rosters[0]?.id || "";
    }

    localStorage.setItem(ROSTER_STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  }

  function normalizeRoster(roster) {
    if (!roster || typeof roster !== "object") return null;
    const name = String(roster.name || "Untitled roster").trim() || "Untitled roster";
    const students = Array.isArray(roster.students)
      ? roster.students.map((student) => {
        if (typeof student === "string") {
          return { id: createId("student"), name: student.trim() };
        }
        return {
          id: student.id || createId("student"),
          name: String(student.name || "").trim()
        };
      }).filter((student) => student.name)
      : [];
    return {
      id: roster.id || createId("roster"),
      name,
      students,
      createdAt: roster.createdAt || new Date().toISOString(),
      updatedAt: roster.updatedAt || new Date().toISOString()
    };
  }

  function migrateGroupsRosters(shared, groupsSnapshot) {
    const candidates = [];
    if (groupsSnapshot?.rosters && typeof groupsSnapshot.rosters === "object") {
      Object.entries(groupsSnapshot.rosters).forEach(([name, students]) => {
        if (Array.isArray(students) && students.length) {
          candidates.push({ name, students });
        }
      });
    }
    if (Array.isArray(groupsSnapshot?.currentRoster) && groupsSnapshot.currentRoster.length) {
      candidates.push({
        name: groupsSnapshot.rosterName || groupsSnapshot.selectedRoster || "Migrated roster",
        students: groupsSnapshot.currentRoster
      });
    }

    candidates.forEach((candidate) => {
      const parsed = parseRoster(candidate.students.join("\n"));
      if (!parsed.unique.length || rosterAlreadyExists(shared.rosters, candidate.name, parsed.unique)) return;
      shared.rosters.push(makeRoster(candidate.name, parsed.unique));
    });
  }

  function rosterAlreadyExists(rosters, name, students) {
    const key = students.map((student) => student.toLowerCase()).join("|");
    return rosters.some((roster) => {
      const rosterKey = roster.students.map((student) => student.name.toLowerCase()).join("|");
      return roster.name === name && rosterKey === key;
    });
  }

  function makeRoster(name, names) {
    const now = new Date().toISOString();
    return {
      id: createId("roster"),
      name: name.trim() || "Untitled roster",
      students: names.map((student) => ({ id: createId("student"), name: student })),
      createdAt: now,
      updatedAt: now
    };
  }

  function createId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function saveRosterState() {
    localStorage.setItem(ROSTER_STORAGE_KEY, JSON.stringify(rosterState));
    renderRostersWidget();
    renderGroupsWidget();
  }

  function activeRoster() {
    return rosterState.rosters.find((roster) => roster.id === rosterState.activeRosterId) || rosterState.rosters[0] || null;
  }

  function selectedRoster(selectElement) {
    return rosterState.rosters.find((roster) => roster.id === selectElement.value) || activeRoster();
  }

  function todayAbsences(rosterId = activeRoster()?.id) {
    if (!rosterId) return [];
    const date = todayKey();
    if (!rosterState.absencesByDate[date]) {
      rosterState.absencesByDate[date] = {};
    }
    if (!Array.isArray(rosterState.absencesByDate[date][rosterId])) {
      rosterState.absencesByDate[date][rosterId] = [];
    }
    return rosterState.absencesByDate[date][rosterId];
  }

  function parseRoster(text) {
    const names = String(text || "").split(/\r?\n/).map((name) => name.trim()).filter(Boolean);
    const seen = new Set();
    const duplicates = new Set();
    const unique = [];
    names.forEach((name) => {
      const key = name.toLowerCase();
      if (seen.has(key)) {
        duplicates.add(name);
      } else {
        seen.add(key);
        unique.push(name);
      }
    });
    return { unique, duplicates: [...duplicates] };
  }

  function eligibleStudents() {
    const roster = activeRoster();
    if (!roster) return [];
    const absent = new Set(todayAbsences(roster.id));
    return roster.students.filter((student) => !absent.has(student.id)).map((student) => student.name);
  }

  function updateRosterFromInput() {
    updateRosterFromText(elements.rosterName.value, elements.rosterInput.value, elements.rosterSelect.value, "groups");
  }

  function saveRoster() {
    updateRosterFromText(elements.rosterName.value, elements.rosterInput.value, elements.rosterSelect.value, "groups", true);
  }

  function loadSelectedRoster() {
    if (elements.rosterSelect.value) {
      rosterState.activeRosterId = elements.rosterSelect.value;
      saveRosterState();
      renderGroups();
    }
  }

  function renameRoster() {
    const newName = elements.rosterName.value.trim();
    const roster = activeRoster();
    if (!roster || !newName) return;
    roster.name = newName;
    roster.updatedAt = new Date().toISOString();
    saveRosterState();
    renderGroups();
  }

  function deleteRoster() {
    const roster = selectedRoster(elements.rosterSelect);
    if (roster && window.confirm(`Delete roster "${roster.name}"?`)) {
      rosterState.rosters = rosterState.rosters.filter((item) => item.id !== roster.id);
      if (rosterState.activeRosterId === roster.id) rosterState.activeRosterId = rosterState.rosters[0]?.id || "";
      saveRosterState();
      renderGroups();
    }
  }

  function clearRoster() {
    const roster = activeRoster();
    if (roster) {
      roster.students = [];
      roster.updatedAt = new Date().toISOString();
    }
    groupsState.warnings = [];
    saveRosterState();
    renderGroups();
  }

  function updateRosterFromText(nameValue, textValue, rosterId, source, forceSave = false) {
    const parsed = parseRoster(textValue);
    let roster = rosterState.rosters.find((item) => item.id === rosterId) || activeRoster();
    if (!roster) {
      roster = makeRoster(nameValue || "My class", parsed.unique);
      rosterState.rosters.push(roster);
      rosterState.activeRosterId = roster.id;
    } else if (forceSave || source === "shared" || textValue !== roster.students.map((student) => student.name).join("\n")) {
      roster.name = nameValue.trim() || roster.name || "My class";
      roster.students = mergeStudentsByName(roster.students, parsed.unique);
      roster.updatedAt = new Date().toISOString();
      rosterState.activeRosterId = roster.id;
    }
    groupsState.warnings = parsed.duplicates.length ? [`Duplicate names removed: ${parsed.duplicates.join(", ")}`] : [];
    saveRosterState();
    if (source === "shared") renderRosterManager();
    renderGroups();
  }

  function mergeStudentsByName(existingStudents, names) {
    const existingByName = new Map(existingStudents.map((student) => [student.name.toLowerCase(), student]));
    return names.map((name) => {
      const existing = existingByName.get(name.toLowerCase());
      return existing ? { ...existing, name } : { id: createId("student"), name };
    });
  }

  function createSharedRoster() {
    const parsed = parseRoster(elements.sharedRosterInput.value);
    const name = elements.sharedRosterName.value.trim() || `Roster ${rosterState.rosters.length + 1}`;
    const roster = makeRoster(name, parsed.unique);
    rosterState.rosters.push(roster);
    rosterState.activeRosterId = roster.id;
    groupsState.warnings = parsed.duplicates.length ? [`Duplicate names removed: ${parsed.duplicates.join(", ")}`] : [];
    saveRosterState();
    renderRosterManager();
    renderGroups();
  }

  function saveSharedRoster() {
    updateRosterFromText(elements.sharedRosterName.value, elements.sharedRosterInput.value, elements.sharedRosterSelect.value, "shared", true);
  }

  function loadSharedRoster() {
    if (elements.sharedRosterSelect.value) {
      rosterState.activeRosterId = elements.sharedRosterSelect.value;
      saveRosterState();
      renderRosterManager();
      renderGroups();
    }
  }

  function renameSharedRoster() {
    const roster = selectedRoster(elements.sharedRosterSelect);
    const newName = elements.sharedRosterName.value.trim();
    if (!roster || !newName) return;
    roster.name = newName;
    roster.updatedAt = new Date().toISOString();
    rosterState.activeRosterId = roster.id;
    saveRosterState();
    renderRosterManager();
    renderGroups();
  }

  function duplicateSharedRoster() {
    const roster = selectedRoster(elements.sharedRosterSelect);
    if (!roster) return;
    const copy = makeRoster(`${roster.name} copy`, roster.students.map((student) => student.name));
    rosterState.rosters.push(copy);
    rosterState.activeRosterId = copy.id;
    saveRosterState();
    renderRosterManager();
    renderGroups();
  }

  function deleteSharedRoster() {
    const roster = selectedRoster(elements.sharedRosterSelect);
    if (!roster || !window.confirm(`Delete roster "${roster.name}"?`)) return;
    rosterState.rosters = rosterState.rosters.filter((item) => item.id !== roster.id);
    if (rosterState.activeRosterId === roster.id) rosterState.activeRosterId = rosterState.rosters[0]?.id || "";
    saveRosterState();
    renderRosterManager();
    renderGroups();
  }

  function setSelectedActiveRoster() {
    if (!elements.sharedRosterSelect.value) return;
    rosterState.activeRosterId = elements.sharedRosterSelect.value;
    saveRosterState();
    renderRosterManager();
    renderGroups();
  }

  function updateSharedRosterFromInput() {
    updateRosterFromText(elements.sharedRosterName.value, elements.sharedRosterInput.value, elements.sharedRosterSelect.value, "shared");
  }

  function clearSharedAbsences() {
    const roster = activeRoster();
    if (!roster) return;
    const date = todayKey();
    if (rosterState.absencesByDate[date]) {
      rosterState.absencesByDate[date][roster.id] = [];
    }
    saveRosterState();
    renderRosterManager();
    renderGroups();
  }

  function getAppStorageKeys() {
    const keys = new Set([HUB_LAYOUT_KEY, STORAGE_KEY, TIMER_STORAGE_KEY, ROSTER_STORAGE_KEY, GROUPS_STORAGE_KEY, BACKUP_META_KEY]);
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key === STORAGE_KEY || String(key).startsWith("classroomOperations")) {
        keys.add(key);
      }
    }
    return [...keys].filter((key) => localStorage.getItem(key) !== null);
  }

  function readStorageValue(key) {
    const value = localStorage.getItem(key);
    if (value === null) return null;
    try {
      return JSON.parse(value);
    } catch (error) {
      return value;
    }
  }

  function createBackup(keys) {
    return {
      exportedAt: new Date().toISOString(),
      appName: APP_NAME,
      appVersion: APP_VERSION,
      data: keys.reduce((data, key) => {
        data[key] = readStorageValue(key);
        return data;
      }, {})
    };
  }

  function exportFullBackup() {
    const exportedAt = new Date().toISOString();
    localStorage.setItem(BACKUP_META_KEY, exportedAt);
    const backup = createBackup(getAppStorageKeys());
    backup.exportedAt = exportedAt;
    downloadJson(backup, `classroom-operations-hub-backup-${todayKey()}.json`);
    showBackupMessage("Full backup exported.", "ready");
    renderSettings();
  }

  function exportStorageKeys(label, keys) {
    const exportedAt = new Date().toISOString();
    localStorage.setItem(BACKUP_META_KEY, exportedAt);
    const backup = createBackup(keys.filter((key) => localStorage.getItem(key) !== null));
    backup.exportedAt = exportedAt;
    downloadJson(backup, `classroom-operations-hub-${label}-${todayKey()}.json`);
    showBackupMessage(`${label.replace(/-/g, " ")} data exported.`, "ready");
    renderSettings();
  }

  function downloadJson(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function importBackup() {
    const file = elements.backupFileInput.files?.[0];
    if (!file) {
      showBackupMessage("Choose a JSON backup file first.", "warning");
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      try {
        const backup = JSON.parse(reader.result);
        if (!isValidBackup(backup)) {
          showBackupMessage("That file does not look like a Classroom Operations Hub backup.", "warning");
          return;
        }
        if (!window.confirm("Import this backup and replace current app data?")) {
          return;
        }
        Object.entries(backup.data).forEach(([key, value]) => {
          if (isAllowedImportKey(key)) {
            localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
          }
        });
        localStorage.setItem(BACKUP_META_KEY, new Date().toISOString());
        reloadAppStateFromStorage();
        showBackupMessage("Backup imported successfully.", "ready");
      } catch (error) {
        showBackupMessage("Import failed. Check that the file is valid JSON.", "warning");
      }
    });
    reader.readAsText(file);
  }

  function isValidBackup(backup) {
    return backup
      && backup.appName === APP_NAME
      && backup.data
      && typeof backup.data === "object"
      && Object.keys(backup.data).some(isAllowedImportKey);
  }

  function isAllowedImportKey(key) {
    return key === STORAGE_KEY || String(key).startsWith("classroomOperations");
  }

  function clearStorageKeyWithConfirmation(key, label) {
    if (!window.confirm(`Clear ${label}? This cannot be undone unless you have a backup.`)) {
      return;
    }
    if (key === ROSTER_STORAGE_KEY) {
      localStorage.setItem(ROSTER_STORAGE_KEY, JSON.stringify({ ...DEFAULT_ROSTER_STATE, migratedGroupsRosters: true }));
    } else {
      localStorage.removeItem(key);
    }
    reloadAppStateFromStorage();
    showBackupMessage(`${label} cleared.`, "ready");
  }

  function clearAllAppData() {
    const typed = window.prompt("Type CLEAR ALL to clear all Classroom Operations Hub data.");
    if (typed !== "CLEAR ALL") {
      showBackupMessage("Clear all canceled.", "warning");
      return;
    }
    if (!window.confirm("Clear all app data now? This cannot be undone unless you have a backup.")) {
      return;
    }
    getAppStorageKeys().forEach((key) => localStorage.removeItem(key));
    reloadAppStateFromStorage();
    getAppStorageKeys().forEach((key) => localStorage.removeItem(key));
    renderSettings();
    showBackupMessage("All app data cleared.", "ready");
  }

  function reloadAppStateFromStorage() {
    state = loadState();
    timerState = loadTimerState();
    groupsState = loadGroupsState();
    rosterState = loadRosterState(groupsState);
    timerRuntime = createTimerRuntime(timerState.durationSeconds);
    renderWidgetOrder();
    render();
    renderTimer();
    renderRosterManager();
    renderGroups();
    renderSettings();
  }

  function showBackupMessage(message, kind) {
    elements.backupMessage.textContent = message;
    elements.backupMessage.className = `private-warning ${kind === "warning" ? "warning" : "ready"}`;
  }

  function updateGroupsSettingsFromControls() {
    groupsState.groupingMode = elements.groupingMode.value;
    groupsState.numberOfGroups = Math.max(1, readNumberInput(elements.numberOfGroups.value, 1));
    groupsState.studentsPerGroup = Math.max(1, readNumberInput(elements.studentsPerGroup.value, 1));
    groupsState.keepApartText = elements.keepApartInput.value;
    groupsState.mustPairText = elements.mustPairInput.value;
    groupsState.lockedText = elements.lockedInput.value;
    groupsState.groupSetName = elements.groupSetName.value.trim() || "Today's groups";
    groupsState.stationListName = elements.stationListName.value.trim() || "Stations";
    groupsState.stationsText = elements.stationsInput.value;
    groupsState.rotationMinutes = Math.max(1, readNumberInput(elements.rotationMinutes.value, 10));
    groupsState.transitionMinutes = Math.max(0, readNumberInput(elements.transitionMinutes.value, 0));
    groupsState.rotationStartTime = elements.rotationStartTime.value;
    saveGroupsState();
    renderGroups();
  }

  function parsePairs(text) {
    return String(text || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
      const [a, b] = line.split("|").map((part) => part.trim());
      return a && b ? [a, b] : null;
    }).filter(Boolean);
  }

  function parseLocks(text) {
    const locks = {};
    parsePairs(text).forEach(([student, groupText]) => {
      const match = groupText.match(/\d+/);
      if (match) locks[student] = Math.max(1, Number.parseInt(match[0], 10));
    });
    return locks;
  }

  function generateGroups() {
    const students = eligibleStudents();
    if (students.length === 0) {
      groupsState.warnings = ["Add eligible students before generating groups."];
      saveGroupsState();
      renderGroups();
      return;
    }
    const groupCount = groupsState.groupingMode === "groups"
      ? Math.max(1, groupsState.numberOfGroups)
      : Math.max(1, Math.ceil(students.length / Math.max(1, groupsState.studentsPerGroup)));
    const keepApart = parsePairs(groupsState.keepApartText);
    const mustPair = parsePairs(groupsState.mustPairText);
    const locks = parseLocks(groupsState.lockedText);
    let best = null;
    for (let attempt = 0; attempt < 200; attempt += 1) {
      const candidate = buildGroupCandidate(students, groupCount, mustPair, locks);
      const score = scoreGroups(candidate, keepApart, mustPair);
      if (!best || score.total < best.score.total) best = { groups: candidate, score };
    }
    groupsState.currentGroups = best.groups.map((studentsInGroup, index) => ({
      name: `Group ${index + 1}`,
      students: studentsInGroup
    }));
    groupsState.warnings = best.score.messages;
    saveGroupsState();
    renderGroups();
  }

  function buildGroupCandidate(students, groupCount, mustPair, locks) {
    const groups = Array.from({ length: groupCount }, () => []);
    const assigned = new Set();
    Object.entries(locks).forEach(([student, groupNumber]) => {
      if (students.includes(student)) {
        groups[Math.min(groupCount - 1, groupNumber - 1)].push(student);
        assigned.add(student);
      }
    });
    shuffle([...mustPair]).forEach(([a, b]) => {
      const pair = [a, b].filter((student) => students.includes(student) && !assigned.has(student));
      if (pair.length === 0) return;
      const target = smallestGroupIndex(groups);
      pair.forEach((student) => {
        groups[target].push(student);
        assigned.add(student);
      });
    });
    shuffle(students.filter((student) => !assigned.has(student))).forEach((student) => {
      groups[smallestGroupIndex(groups)].push(student);
    });
    return groups;
  }

  function scoreGroups(groups, keepApart, mustPair) {
    const messages = [];
    let violations = 0;
    keepApart.forEach(([a, b]) => {
      if (groups.some((group) => group.includes(a) && group.includes(b))) {
        violations += 1;
        messages.push(`Keep-apart conflict: ${a} and ${b}`);
      }
    });
    mustPair.forEach(([a, b]) => {
      if (!groups.some((group) => group.includes(a) && group.includes(b))) {
        violations += 1;
        messages.push(`Must-pair not met: ${a} and ${b}`);
      }
    });
    const sizes = groups.map((group) => group.length);
    const balance = Math.max(...sizes) - Math.min(...sizes);
    return { total: violations * 100 + balance, messages };
  }

  function smallestGroupIndex(groups) {
    let index = 0;
    groups.forEach((group, currentIndex) => {
      if (group.length < groups[index].length) index = currentIndex;
    });
    return index;
  }

  function shuffle(items) {
    return items.map((item) => ({ item, sort: Math.random() })).sort((a, b) => a.sort - b.sort).map(({ item }) => item);
  }

  function saveGroupSet() {
    const name = elements.groupSetName.value.trim() || groupsState.groupSetName;
    groupsState.groupSets[name] = groupsState.currentGroups;
    groupsState.groupSetName = name;
    saveGroupsState();
    renderGroups();
  }

  function loadGroupSet() {
    const name = elements.groupSetSelect.value;
    if (groupsState.groupSets[name]) {
      groupsState.groupSetName = name;
      groupsState.currentGroups = groupsState.groupSets[name];
      saveGroupsState();
      renderGroups();
    }
  }

  function deleteGroupSet() {
    const name = elements.groupSetSelect.value;
    if (name && window.confirm(`Delete group set "${name}"?`)) {
      delete groupsState.groupSets[name];
      saveGroupsState();
      renderGroups();
    }
  }

  function moveSelectedStudent() {
    const student = elements.moveStudentSelect.value;
    const target = Number.parseInt(elements.moveGroupSelect.value, 10);
    if (!student || !Number.isFinite(target)) return;
    groupsState.currentGroups.forEach((group) => {
      group.students = group.students.filter((name) => name !== student);
    });
    groupsState.currentGroups[target].students.push(student);
    saveGroupsState();
    renderGroups();
  }

  function saveStationList() {
    const name = elements.stationListName.value.trim() || groupsState.stationListName;
    groupsState.stationLists[name] = splitLines(elements.stationsInput.value);
    groupsState.selectedStationList = name;
    groupsState.stationListName = name;
    groupsState.stationsText = splitLines(elements.stationsInput.value).join("\n");
    saveGroupsState();
    renderGroups();
  }

  function loadStationList() {
    const name = elements.stationListSelect.value;
    if (groupsState.stationLists[name]) {
      groupsState.selectedStationList = name;
      groupsState.stationListName = name;
      groupsState.stationsText = groupsState.stationLists[name].join("\n");
      saveGroupsState();
      renderGroups();
    }
  }

  function clearStationList() {
    groupsState.stationsText = "";
    saveGroupsState();
    renderGroups();
  }

  function deleteStationList() {
    const name = elements.stationListSelect.value;
    if (name && window.confirm(`Delete station list "${name}"?`)) {
      delete groupsState.stationLists[name];
      saveGroupsState();
      renderGroups();
    }
  }

  function generateRotation() {
    const groups = groupsState.currentGroups;
    const stations = splitLines(groupsState.stationsText);
    if (!groups.length || !stations.length) {
      groupsState.warnings = ["Generate groups and add stations before creating rotations."];
      saveGroupsState();
      renderGroups();
      return;
    }
    const rounds = stations.map((_, roundIndex) => ({
      round: roundIndex + 1,
      assignments: groups.map((group, groupIndex) => ({
        group: group.name,
        station: stations[(groupIndex + roundIndex) % stations.length]
      }))
    }));
    groupsState.lastRotation = {
      rounds,
      stations,
      rotationMinutes: groupsState.rotationMinutes,
      transitionMinutes: groupsState.transitionMinutes,
      startTime: groupsState.rotationStartTime
    };
    saveGroupsState();
    renderGroups();
  }

  function splitLines(text) {
    return String(text || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  }

  function createTimerRuntime(durationSeconds) {
    return {
      running: false,
      completed: false,
      remainingSeconds: durationSeconds,
      countdownEndAt: null,
      stopwatchElapsedMs: 0,
      stopwatchStartAt: null,
      alarmTargetAt: null,
      laps: []
    };
  }

  function startTimerLoop() {
    if (!timerInterval) {
      timerInterval = window.setInterval(updateTimerTick, 250);
    }
  }

  function stopTimerLoop() {
    if (timerInterval) {
      window.clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function updateTimerTick() {
    if (timerState.mode === "countdown" && timerRuntime.running) {
      timerRuntime.remainingSeconds = Math.max(0, Math.ceil((timerRuntime.countdownEndAt - Date.now()) / 1000));
      if (timerRuntime.remainingSeconds <= 0) {
        timerRuntime.running = false;
        timerRuntime.completed = true;
        stopTimerLoop();
        playTimerSound();
      }
    }

    if (timerState.mode === "alarm" && timerRuntime.running) {
      const remaining = timerRuntime.alarmTargetAt - Date.now();
      if (remaining <= 0) {
        timerRuntime.running = false;
        timerRuntime.completed = true;
        stopTimerLoop();
        playTimerSound();
      }
    }

    renderTimer();
  }

  function handleTimerStartPause() {
    if (timerRuntime.running) {
      pauseTimer();
      return;
    }

    if (timerState.mode === "countdown") {
      startCountdown();
    } else if (timerState.mode === "stopwatch") {
      startStopwatch();
    } else {
      startAlarm();
    }
  }

  function startCountdown() {
    if (timerRuntime.remainingSeconds <= 0 || timerRuntime.completed) {
      timerRuntime.remainingSeconds = timerState.durationSeconds;
    }
    timerRuntime.completed = false;
    timerRuntime.running = true;
    timerRuntime.countdownEndAt = Date.now() + timerRuntime.remainingSeconds * 1000;
    startTimerLoop();
    renderTimer();
  }

  function startStopwatch() {
    timerRuntime.completed = false;
    timerRuntime.running = true;
    timerRuntime.stopwatchStartAt = Date.now();
    startTimerLoop();
    renderTimer();
  }

  function startAlarm() {
    const target = getAlarmTargetTime();
    if (!target) {
      timerRuntime.completed = true;
      renderTimer();
      return;
    }
    timerRuntime.completed = false;
    timerRuntime.running = true;
    timerRuntime.alarmTargetAt = target;
    startTimerLoop();
    renderTimer();
  }

  function pauseTimer() {
    if (timerState.mode === "countdown") {
      timerRuntime.remainingSeconds = Math.max(0, Math.ceil((timerRuntime.countdownEndAt - Date.now()) / 1000));
    }

    if (timerState.mode === "stopwatch") {
      timerRuntime.stopwatchElapsedMs += Date.now() - timerRuntime.stopwatchStartAt;
      timerRuntime.stopwatchStartAt = null;
    }

    timerRuntime.running = false;
    stopTimerLoop();
    renderTimer();
  }

  function resetTimerRuntime() {
    stopTimerLoop();
    timerRuntime = createTimerRuntime(timerState.durationSeconds);
    renderTimer();
  }

  function addCountdownSeconds(seconds) {
    if (timerState.mode !== "countdown") {
      return;
    }
    timerState.durationSeconds += seconds;
    timerRuntime.remainingSeconds += seconds;
    if (timerRuntime.running) {
      timerRuntime.countdownEndAt += seconds * 1000;
    }
    saveTimerState();
    syncTimerControls();
    renderTimer();
  }

  function addStopwatchLap() {
    if (timerState.mode !== "stopwatch") {
      return;
    }
    timerRuntime.laps.unshift(getStopwatchElapsedMs());
    renderTimer();
  }

  function cancelAlarm() {
    if (timerState.mode !== "alarm") {
      return;
    }
    stopTimerLoop();
    timerRuntime.running = false;
    timerRuntime.completed = false;
    timerRuntime.alarmTargetAt = null;
    renderTimer();
  }

  function getStopwatchElapsedMs() {
    if (!timerRuntime.running || timerState.mode !== "stopwatch") {
      return timerRuntime.stopwatchElapsedMs;
    }
    return timerRuntime.stopwatchElapsedMs + Date.now() - timerRuntime.stopwatchStartAt;
  }

  function getAlarmTargetTime() {
    if (!timerState.alarmTime) {
      return null;
    }
    const [hours, minutes] = timerState.alarmTime.split(":").map((value) => Number.parseInt(value, 10));
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
      return null;
    }
    const target = new Date();
    target.setHours(hours, minutes, 0, 0);
    if (target.getTime() <= Date.now()) {
      target.setDate(target.getDate() + 1);
    }
    return target.getTime();
  }

  function updateTimerSettingsFromControls() {
    const previousMode = timerState.mode;
    timerState.mode = elements.timerMode.value;
    timerState.label = elements.timerLabel.value.trim() || defaultTimerLabel(timerState.mode);
    timerState.durationSeconds = readDurationInputs();
    timerState.routineText = elements.timerRoutine.value;
    timerState.alarmTime = elements.alarmTimeInput.value;
    timerState.soundEnabled = elements.timerSoundEnabled.checked;
    timerState.soundType = elements.timerSoundType.value;

    if (timerState.mode === "stopwatch") {
      timerState.stopwatchLabel = timerState.label;
    }
    if (timerState.mode === "alarm") {
      timerState.alarmLabel = timerState.label;
    }
    if (previousMode !== timerState.mode) {
      resetTimerRuntime();
    } else if (!timerRuntime.running && timerState.mode === "countdown") {
      timerRuntime.remainingSeconds = timerState.durationSeconds;
    }

    saveTimerState();
    renderTimer();
  }

  function defaultTimerLabel(mode) {
    if (mode === "stopwatch") {
      return timerState.stopwatchLabel || "Math Sprint";
    }
    if (mode === "alarm") {
      return timerState.alarmLabel || "Pack up";
    }
    return "Clean up";
  }

  function readDurationInputs() {
    const hours = Math.max(0, readNumberInput(elements.timerHours.value, 0));
    const minutes = Math.max(0, readNumberInput(elements.timerMinutes.value, 0));
    const seconds = Math.max(0, readNumberInput(elements.timerSeconds.value, 0));
    return Math.max(1, hours * 3600 + minutes * 60 + seconds);
  }

  function syncTimerControls() {
    elements.timerMode.value = timerState.mode;
    elements.timerLabel.value = currentTimerLabel();
    const duration = secondsToParts(timerState.durationSeconds);
    elements.timerHours.value = duration.hours;
    elements.timerMinutes.value = duration.minutes;
    elements.timerSeconds.value = duration.seconds;
    elements.alarmTimeInput.value = timerState.alarmTime;
    elements.timerRoutine.value = timerState.routineText || "";
    elements.timerSoundEnabled.checked = timerState.soundEnabled;
    elements.timerSoundType.value = timerState.soundType;
    renderPresetOptions();
    toggleTimerSettingsVisibility();
  }

  function currentTimerLabel() {
    if (timerState.mode === "stopwatch") {
      return timerState.stopwatchLabel || timerState.label;
    }
    if (timerState.mode === "alarm") {
      return timerState.alarmLabel || timerState.label;
    }
    return timerState.label;
  }

  function renderPresetOptions() {
    elements.timerPreset.innerHTML = "";
    timerState.presets.forEach((preset) => {
      const option = document.createElement("option");
      option.value = preset.label;
      option.textContent = preset.label;
      elements.timerPreset.appendChild(option);
    });
    elements.timerPreset.value = timerState.selectedPreset;
  }

  function loadSelectedTimerPreset() {
    const preset = timerState.presets.find((item) => item.label === elements.timerPreset.value);
    if (!preset) {
      return;
    }
    timerState.mode = "countdown";
    timerState.label = preset.label;
    timerState.durationSeconds = preset.durationSeconds;
    timerState.routineText = (preset.steps || []).join("\n");
    timerState.selectedPreset = preset.label;
    resetTimerRuntime();
    saveTimerState();
    syncTimerControls();
    renderTimer();
  }

  function saveTimerPreset() {
    const label = elements.timerLabel.value.trim() || "Custom timer";
    const steps = splitRoutineSteps(elements.timerRoutine.value);
    const preset = {
      label,
      durationSeconds: readDurationInputs(),
      steps
    };
    const existingIndex = timerState.presets.findIndex((item) => item.label === label);
    if (existingIndex >= 0) {
      timerState.presets[existingIndex] = preset;
    } else {
      timerState.presets.push(preset);
    }
    timerState.selectedPreset = label;
    timerState.mode = "countdown";
    timerState.label = label;
    timerState.durationSeconds = preset.durationSeconds;
    timerState.routineText = steps.join("\n");
    resetTimerRuntime();
    saveTimerState();
    syncTimerControls();
    renderTimer();
  }

  function deleteTimerPreset() {
    const label = elements.timerPreset.value;
    if (!label || !window.confirm(`Delete preset "${label}"?`)) {
      return;
    }
    timerState.presets = timerState.presets.filter((preset) => preset.label !== label);
    if (timerState.presets.length === 0) {
      timerState.presets = [...DEFAULT_TIMER_PRESETS];
    }
    const nextPreset = timerState.presets[0];
    timerState.selectedPreset = nextPreset.label;
    saveTimerState();
    syncTimerControls();
  }

  function openTimerSettings() {
    elements.timerSettingsPanel.hidden = false;
    syncTimerControls();
    elements.timerMode.focus();
  }

  function closeTimerSettings() {
    elements.timerSettingsPanel.hidden = true;
    renderTimer();
    elements.timerStartPause.focus();
  }

  function toggleTimerSettingsVisibility() {
    const isCountdown = timerState.mode === "countdown";
    const isStopwatch = timerState.mode === "stopwatch";
    const isAlarm = timerState.mode === "alarm";
    document.querySelectorAll(".countdown-settings").forEach((element) => {
      element.hidden = !isCountdown;
    });
    document.querySelectorAll(".stopwatch-settings").forEach((element) => {
      element.hidden = !isStopwatch;
    });
    document.querySelectorAll(".alarm-settings").forEach((element) => {
      element.hidden = !isAlarm;
    });
  }

  function renderTimer() {
    syncTimerControls();
    elements.timerModeDisplay.textContent = TIMER_MODE_LABELS[timerState.mode];
    elements.timerLabelDisplay.textContent = currentTimerLabel();
    elements.timerRoutineDisplay.innerHTML = "";
    splitRoutineSteps(timerState.routineText).forEach((step) => {
      const item = document.createElement("li");
      item.textContent = step;
      elements.timerRoutineDisplay.appendChild(item);
    });

    const isAlert = timerRuntime.completed;
    elements.timerDisplay.classList.toggle("alert-state", isAlert);
    elements.timerMessageDisplay.textContent = "";

    if (timerState.mode === "countdown") {
      elements.timerTimeDisplay.textContent = formatSeconds(timerRuntime.remainingSeconds);
      elements.timerMessageDisplay.textContent = timerRuntime.completed ? "Time's up" : "";
    } else if (timerState.mode === "stopwatch") {
      elements.timerTimeDisplay.textContent = formatMilliseconds(getStopwatchElapsedMs());
    } else {
      const remainingMs = timerRuntime.running && timerRuntime.alarmTargetAt
        ? Math.max(0, timerRuntime.alarmTargetAt - Date.now())
        : getAlarmPreviewRemaining();
      elements.timerTimeDisplay.textContent = formatMilliseconds(remainingMs);
      elements.timerMessageDisplay.textContent = timerRuntime.completed
        ? "Alarm"
        : timerState.alarmTime ? `Target ${formatAlarmDisplay(timerState.alarmTime)}` : "Set an alarm time";
    }

    elements.timerStartPause.textContent = getTimerPrimaryButtonText();
    elements.timerAddOne.hidden = timerState.mode !== "countdown";
    elements.timerAddTwo.hidden = timerState.mode !== "countdown";
    elements.timerLap.hidden = timerState.mode !== "stopwatch";
    elements.timerCancelAlarm.hidden = timerState.mode !== "alarm";
    renderLapList();
    renderTimerWidget();
  }

  function getTimerPrimaryButtonText() {
    if (timerRuntime.running) {
      return "Pause";
    }
    if (timerState.mode === "alarm") {
      return timerRuntime.completed ? "Activate alarm" : "Activate alarm";
    }
    if (timerState.mode === "stopwatch") {
      return timerRuntime.stopwatchElapsedMs === 0 ? "Start" : "Resume";
    }
    if (timerRuntime.completed || timerRuntime.remainingSeconds === timerState.durationSeconds) {
      return "Start";
    }
    return "Resume";
  }

  function renderLapList() {
    elements.lapList.innerHTML = "";
    timerRuntime.laps.forEach((lap, index) => {
      const item = document.createElement("li");
      item.textContent = `Lap ${timerRuntime.laps.length - index}: ${formatMilliseconds(lap)}`;
      elements.lapList.appendChild(item);
    });
  }

  function renderTimerWidget() {
    elements.timerWidgetMode.textContent = TIMER_MODE_LABELS[timerState.mode];
    elements.timerWidgetPreset.textContent = timerState.mode === "countdown"
      ? timerState.selectedPreset || timerState.label
      : currentTimerLabel();
  }

  function getAlarmPreviewRemaining() {
    const target = getAlarmTargetTime();
    return target ? Math.max(0, target - Date.now()) : 0;
  }

  function splitRoutineSteps(text) {
    return String(text || "")
      .split(/\r?\n/)
      .map((step) => step.trim())
      .filter(Boolean);
  }

  function secondsToParts(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { hours, minutes, seconds };
  }

  function formatSeconds(totalSeconds) {
    const { hours, minutes, seconds } = secondsToParts(Math.max(0, totalSeconds));
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function formatMilliseconds(milliseconds) {
    const totalSeconds = Math.floor(Math.max(0, milliseconds) / 1000);
    return formatSeconds(totalSeconds);
  }

  function formatAlarmDisplay(value) {
    const [hours, minutes] = value.split(":");
    const date = new Date();
    date.setHours(Number.parseInt(hours, 10), Number.parseInt(minutes, 10), 0, 0);
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  function playTimerSound(force = false) {
    if (!timerState.soundEnabled && !force) {
      return;
    }
    try {
      audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
      const now = audioContext.currentTime;
      if (timerState.soundType === "bell") {
        playTone(now, 660, 0.12);
        playTone(now + 0.16, 880, 0.18);
      } else if (timerState.soundType === "beep") {
        playTone(now, 740, 0.12);
        playTone(now + 0.18, 740, 0.12);
        playTone(now + 0.36, 740, 0.12);
      } else {
        playTone(now, 523, 0.18);
        playTone(now + 0.2, 659, 0.22);
      }
    } catch (error) {
      // Browsers may block audio until the page has received a user gesture.
    }
  }

  function playTone(startTime, frequency, duration) {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, startTime);
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.12, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.04);
  }

  function loadWidgetOrder() {
    try {
      const savedOrder = JSON.parse(localStorage.getItem(HUB_LAYOUT_KEY));
      if (!Array.isArray(savedOrder)) {
        return [...DEFAULT_WIDGET_ORDER];
      }
      const validSaved = savedOrder.filter((id) => DEFAULT_WIDGET_ORDER.includes(id));
      const missing = DEFAULT_WIDGET_ORDER.filter((id) => !validSaved.includes(id));
      return [...validSaved, ...missing];
    } catch (error) {
      return [...DEFAULT_WIDGET_ORDER];
    }
  }

  function saveWidgetOrder() {
    const order = [...elements.dashboardGrid.querySelectorAll("[data-widget-id]")]
      .map((widget) => widget.dataset.widgetId);
    localStorage.setItem(HUB_LAYOUT_KEY, JSON.stringify(order));
  }

  function renderWidgetOrder() {
    const widgetsById = {};
    elements.dashboardGrid.querySelectorAll("[data-widget-id]").forEach((widget) => {
      widgetsById[widget.dataset.widgetId] = widget;
    });
    loadWidgetOrder().forEach((widgetId) => {
      if (widgetsById[widgetId]) {
        elements.dashboardGrid.appendChild(widgetsById[widgetId]);
      }
    });
  }

  function resetWidgetLayout() {
    localStorage.setItem(HUB_LAYOUT_KEY, JSON.stringify(DEFAULT_WIDGET_ORDER));
    renderWidgetOrder();
  }

  function handleWidgetDragStart(event) {
    draggedWidget = event.currentTarget;
    draggedWidget.classList.add("dragging");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", draggedWidget.dataset.widgetId);
  }

  function handleWidgetDragOver(event) {
    event.preventDefault();
    const target = event.currentTarget;
    if (target !== draggedWidget) {
      target.classList.add("drag-over");
    }
    event.dataTransfer.dropEffect = "move";
  }

  function handleWidgetDragLeave(event) {
    event.currentTarget.classList.remove("drag-over");
  }

  function handleWidgetDrop(event) {
    event.preventDefault();
    const target = event.currentTarget;
    target.classList.remove("drag-over");

    if (!draggedWidget || target === draggedWidget) {
      return;
    }

    const widgets = [...elements.dashboardGrid.querySelectorAll("[data-widget-id]")];
    const draggedIndex = widgets.indexOf(draggedWidget);
    const targetIndex = widgets.indexOf(target);

    if (draggedIndex < targetIndex) {
      target.after(draggedWidget);
    } else {
      target.before(draggedWidget);
    }

    saveWidgetOrder();
  }

  function handleWidgetDragEnd() {
    elements.dashboardGrid.querySelectorAll("[data-widget-id]").forEach((widget) => {
      widget.classList.remove("dragging", "drag-over");
    });
    draggedWidget = null;
  }

  function setDisplay(value, mode) {
    elements.pickedNumber.textContent = value;
    elements.pickedNumber.classList.remove("placeholder-display", "countdown-display", "number-display");
    elements.pickedNumber.classList.add(`${mode}-display`);
  }

  function todayKey() {
    return formatDateKey(new Date());
  }

  function formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function ensureCurrentDate() {
    const today = todayKey();
    if (state.currentDate !== today) {
      state.currentDate = today;
      state.currentCycle = getStoredCycle(getTodayHistory());
      saveState();
    }
  }

  function getStoredCycle(entries) {
    if (!Array.isArray(entries) || entries.length === 0) {
      return 1;
    }
    return Math.max(1, ...entries.map((entry) => entry.cycle || 1));
  }

  function getTodayHistory() {
    return state.historyByDate[state.currentDate] || [];
  }

  function setTodayHistory(entries) {
    state.historyByDate[state.currentDate] = entries;
  }

  function getRangeNumbers() {
    const start = Number.parseInt(state.rangeStart, 10);
    const end = Number.parseInt(state.rangeEnd, 10);
    if (!Number.isFinite(start) || !Number.isFinite(end)) {
      return [];
    }

    const low = Math.min(start, end);
    const high = Math.max(start, end);
    const numbers = [];
    for (let number = low; number <= high; number += 1) {
      numbers.push(number);
    }
    return numbers;
  }

  function getExcludedNumbers() {
    return new Set(
      String(state.excludedText)
        .split(/[,\s]+/)
        .map((value) => Number.parseInt(value, 10))
        .filter(Number.isFinite)
    );
  }

  function getAllowedNumbers() {
    const excluded = getExcludedNumbers();
    return getRangeNumbers().filter((number) => !excluded.has(number));
  }

  function getTodayCycleEntries() {
    return getTodayHistory().filter((entry) => entry.cycle === state.currentCycle);
  }

  function getTodayCycleUsedSet() {
    return new Set(getTodayCycleEntries().map((entry) => entry.number));
  }

  function getDailyNumbersLeft() {
    const used = getTodayCycleUsedSet();
    return getAllowedNumbers().filter((number) => !used.has(number)).length;
  }

  function getLastFiveDates() {
    const dates = [];
    const start = new Date();
    for (let offset = 0; offset < 5; offset += 1) {
      const date = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      date.setDate(start.getDate() - offset);
      dates.push(formatDateKey(date));
    }
    return dates;
  }

  function countNumberInDates(number, dates) {
    return dates.reduce((count, date) => {
      const entries = state.historyByDate[date] || [];
      return count + entries.filter((entry) => entry.number === number).length;
    }, 0);
  }

  function countNumberAllTime(number) {
    return Object.values(state.historyByDate).reduce((count, entries) => {
      return count + entries.filter((entry) => entry.number === number).length;
    }, 0);
  }

  function getCueStatus() {
    if (state.cue === null || state.cue === undefined || state.cue === "") {
      return { text: "No cue set", kind: "muted", valid: false };
    }

    const cueNumber = Number.parseInt(state.cue, 10);
    const range = getRangeNumbers();
    const excluded = getExcludedNumbers();

    if (!range.includes(cueNumber)) {
      return { text: "Cue number is outside the current range", kind: "warning", valid: false };
    }

    if (excluded.has(cueNumber)) {
      return { text: "Cue number is currently excluded", kind: "warning", valid: false };
    }

    return { text: "Cue ready", kind: "ready", valid: true };
  }

  async function pickNumber() {
    if (isPicking) {
      return;
    }

    ensureCurrentDate();
    const allowed = getAllowedNumbers();
    if (allowed.length === 0) {
      return;
    }

    const picked = getNextNumber(allowed);

    isPicking = true;
    elements.pickButton.disabled = true;

    if (state.countdownMode) {
      await runCountdown();
    }

    setDisplay(picked, "number");
    savePick(picked);

    isPicking = false;
    elements.pickButton.disabled = false;
    render();
  }

  function getNextNumber(allowed) {
    const cueStatus = getCueStatus();
    if (cueStatus.valid) {
      const cuedNumber = Number.parseInt(state.cue, 10);
      state.cue = null;
      return cuedNumber;
    }

    if (state.cue !== null && state.cue !== undefined && state.cue !== "") {
      state.cue = null;
    }

    if (state.fairnessMode === "multiDay") {
      return chooseMultiDayBalancedNumber(allowed);
    }

    if (state.fairnessMode === "random") {
      return chooseRandom(allowed);
    }

    return chooseDailyCycleNumber(allowed);
  }

  function chooseDailyCycleNumber(allowed) {
    let available = allowed.filter((number) => !getTodayCycleUsedSet().has(number));
    if (available.length === 0) {
      state.currentCycle += 1;
      available = allowed;
    }
    return chooseRandom(available);
  }

  function chooseMultiDayBalancedNumber(allowed) {
    const dates = getLastFiveDates();
    const counts = allowed.map((number) => ({
      number,
      count: countNumberInDates(number, dates)
    }));
    const lowestCount = Math.min(...counts.map((item) => item.count));
    const leastPicked = counts.filter((item) => item.count === lowestCount).map((item) => item.number);
    return chooseRandom(leastPicked);
  }

  function chooseRandom(numbers) {
    return numbers[Math.floor(Math.random() * numbers.length)];
  }

  function savePick(number) {
    const todayHistory = getTodayHistory();
    todayHistory.push({
      number,
      timestamp: new Date().toISOString(),
      cycle: state.currentCycle
    });
    setTodayHistory(todayHistory);
    saveState();
  }

  function runCountdown() {
    return new Promise((resolve) => {
      const steps = ["3", "2", "1"];
      let index = 0;
      setDisplay(steps[index], "countdown");

      const timer = window.setInterval(() => {
        index += 1;
        if (index >= steps.length) {
          window.clearInterval(timer);
          resolve();
          return;
        }
        setDisplay(steps[index], "countdown");
      }, 650);
    });
  }

  function updateSettingsFromControls() {
    state.rangeStart = readNumberInput(elements.rangeStart.value, DEFAULT_STATE.rangeStart);
    state.rangeEnd = readNumberInput(elements.rangeEnd.value, DEFAULT_STATE.rangeEnd);
    state.excludedText = elements.excludedNumbers.value;
    state.countdownMode = elements.countdownMode.checked;
    state.showRecent = elements.showRecent.checked;
    state.showLeftCount = elements.showLeftCount.checked;
    saveState();
    render();
  }

  function updateFairnessMode() {
    state.fairnessMode = elements.fairnessMode.value;
    saveState();
    render();
  }

  function readNumberInput(value, fallback) {
    const number = Number.parseInt(value, 10);
    return Number.isFinite(number) ? number : fallback;
  }

  function resetTodayWithConfirmation() {
    if (window.confirm("Reset today's pick history? Older history and settings will be kept.")) {
      resetToday();
    }
  }

  function startNewRoundWithConfirmation() {
    if (window.confirm("Start a new daily round? Today's existing picks will stay in history.")) {
      state.currentCycle += 1;
      saveState();
      render();
    }
  }

  function resetFiveDayWithConfirmation() {
    if (window.confirm("Clear pick history from the last 5 calendar days? Settings will be kept.")) {
      getLastFiveDates().forEach((date) => {
        delete state.historyByDate[date];
      });
      state.currentCycle = 1;
      saveState();
      setDisplay("Ready", "placeholder");
      render();
    }
  }

  function resetAllHistoryWithConfirmation() {
    if (window.confirm("Clear all saved pick history across all dates? Settings will be kept.")) {
      state.historyByDate = {};
      state.currentCycle = 1;
      saveState();
      setDisplay("Ready", "placeholder");
      render();
    }
  }

  function newDayResetWithConfirmation() {
    if (window.confirm("Clear today's picks? Long-term fairness history from other dates will be kept.")) {
      resetToday();
    }
  }

  function resetToday() {
    setTodayHistory([]);
    state.currentCycle = 1;
    saveState();
    setDisplay("Ready", "placeholder");
    render();
  }

  function setCue() {
    const cueNumber = Number.parseInt(elements.cueInput.value, 10);
    if (Number.isFinite(cueNumber)) {
      state.cue = cueNumber;
      elements.cueInput.value = "";
      saveState();
      render();
    }
  }

  function clearCue() {
    state.cue = null;
    elements.cueInput.value = "";
    saveState();
    render();
  }

  function showHub() {
    elements.hubView.hidden = false;
    elements.numberPickerModule.hidden = true;
    elements.timersModule.hidden = true;
    elements.rostersModule.hidden = true;
    elements.settingsModule.hidden = true;
    elements.groupsModule.hidden = true;
    elements.placeholderView.hidden = true;
    elements.teacherView.hidden = true;
    elements.timerSettingsPanel.hidden = true;
    renderNumberPickerWidget();
    renderTimerWidget();
    renderRostersWidget();
    renderGroupsWidget();
    if (!elements.settingsModule.hidden) {
      renderSettings();
    }
    elements.openNumberPicker.focus();
  }

  function showNumberPicker() {
    elements.hubView.hidden = true;
    elements.placeholderView.hidden = true;
    elements.timersModule.hidden = true;
    elements.rostersModule.hidden = true;
    elements.settingsModule.hidden = true;
    elements.groupsModule.hidden = true;
    elements.numberPickerModule.hidden = false;
    elements.teacherView.hidden = true;
    render();
    elements.pickButton.focus();
  }

  function showTimers() {
    elements.hubView.hidden = true;
    elements.placeholderView.hidden = true;
    elements.numberPickerModule.hidden = true;
    elements.teacherView.hidden = true;
    elements.rostersModule.hidden = true;
    elements.settingsModule.hidden = true;
    elements.groupsModule.hidden = true;
    elements.timersModule.hidden = false;
    elements.timerSettingsPanel.hidden = true;
    renderTimer();
    elements.timerStartPause.focus();
  }

  function showPlaceholder(title, status) {
    elements.hubView.hidden = true;
    elements.numberPickerModule.hidden = true;
    elements.timersModule.hidden = true;
    elements.rostersModule.hidden = true;
    elements.settingsModule.hidden = true;
    elements.groupsModule.hidden = true;
    elements.teacherView.hidden = true;
    elements.timerSettingsPanel.hidden = true;
    elements.placeholderView.hidden = false;
    elements.placeholderTitle.textContent = title;
    elements.placeholderStatus.textContent = status;
    elements.placeholderBack.focus();
  }

  function showGroups() {
    elements.hubView.hidden = true;
    elements.placeholderView.hidden = true;
    elements.numberPickerModule.hidden = true;
    elements.timersModule.hidden = true;
    elements.rostersModule.hidden = true;
    elements.settingsModule.hidden = true;
    elements.teacherView.hidden = true;
    elements.groupsModule.hidden = false;
    showGroupsSetup();
    renderGroups();
  }

  function showRosters() {
    elements.hubView.hidden = true;
    elements.placeholderView.hidden = true;
    elements.numberPickerModule.hidden = true;
    elements.timersModule.hidden = true;
    elements.groupsModule.hidden = true;
    elements.settingsModule.hidden = true;
    elements.teacherView.hidden = true;
    elements.timerSettingsPanel.hidden = true;
    elements.rostersModule.hidden = false;
    renderRosterManager();
    elements.sharedRosterInput.focus();
  }

  function showSettings() {
    elements.hubView.hidden = true;
    elements.placeholderView.hidden = true;
    elements.numberPickerModule.hidden = true;
    elements.timersModule.hidden = true;
    elements.rostersModule.hidden = true;
    elements.groupsModule.hidden = true;
    elements.teacherView.hidden = true;
    elements.timerSettingsPanel.hidden = true;
    elements.settingsModule.hidden = false;
    renderSettings();
    elements.exportFullBackup.focus();
  }

  function showGroupsSetup() {
    elements.groupsSetupView.hidden = false;
    elements.groupsProjectorView.hidden = true;
    elements.rosterInput.focus();
  }

  function showGroupsProjector() {
    elements.groupsSetupView.hidden = true;
    elements.groupsProjectorView.hidden = false;
    renderGroupsProjector();
  }

  function setGroupsProjectorMode(mode) {
    groupsState.projectorMode = mode;
    if (mode === "next") {
      groupsState.currentRoundIndex = Math.min((groupsState.lastRotation?.rounds.length || 1) - 1, groupsState.currentRoundIndex + 1);
    }
    saveGroupsState();
    renderGroupsProjector();
  }

  function renderGroups() {
    syncGroupsControls();
    renderAbsences();
    renderGeneratedGroups();
    renderRotation();
    renderRostersWidget();
    renderGroupsWidget();
  }

  function syncGroupsControls() {
    const roster = activeRoster();
    elements.rosterName.value = roster?.name || "My class";
    elements.rosterInput.value = roster ? roster.students.map((student) => student.name).join("\n") : "";
    elements.groupingMode.value = groupsState.groupingMode;
    elements.numberOfGroups.value = groupsState.numberOfGroups;
    elements.studentsPerGroup.value = groupsState.studentsPerGroup;
    elements.keepApartInput.value = groupsState.keepApartText;
    elements.mustPairInput.value = groupsState.mustPairText;
    elements.lockedInput.value = groupsState.lockedText;
    elements.groupSetName.value = groupsState.groupSetName;
    elements.stationListName.value = groupsState.stationListName;
    elements.stationsInput.value = groupsState.stationsText;
    elements.rotationMinutes.value = groupsState.rotationMinutes;
    elements.transitionMinutes.value = groupsState.transitionMinutes;
    elements.rotationStartTime.value = groupsState.rotationStartTime;
    document.querySelectorAll(".group-count-setting").forEach((item) => { item.hidden = groupsState.groupingMode !== "groups"; });
    document.querySelectorAll(".group-size-setting").forEach((item) => { item.hidden = groupsState.groupingMode !== "size"; });
    fillRosterSelect(elements.rosterSelect, rosterState.activeRosterId);
    fillSelect(elements.groupSetSelect, Object.keys(groupsState.groupSets), groupsState.groupSetName);
    fillSelect(elements.stationListSelect, Object.keys(groupsState.stationLists), groupsState.selectedStationList);
    const eligible = eligibleStudents();
    elements.rosterCounts.textContent = `${roster?.students.length || 0} students. ${eligible.length} eligible today.`;
    elements.groupsWarnings.textContent = (groupsState.warnings || []).join(" ");
  }

  function fillRosterSelect(select, selectedId) {
    select.innerHTML = "";
    rosterState.rosters.forEach((roster) => {
      const option = document.createElement("option");
      option.value = roster.id;
      option.textContent = roster.name;
      select.appendChild(option);
    });
    select.value = selectedId || rosterState.rosters[0]?.id || "";
  }

  function fillSelect(select, values, selected) {
    select.innerHTML = "";
    values.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
    select.value = selected || values[0] || "";
  }

  function renderAbsences() {
    const roster = activeRoster();
    const absent = new Set(todayAbsences(roster?.id));
    elements.absenceList.innerHTML = "";
    if (!roster) return;
    roster.students.forEach((student) => {
      const label = document.createElement("label");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = absent.has(student.id);
      checkbox.addEventListener("change", () => {
        const absences = new Set(todayAbsences(roster.id));
        if (checkbox.checked) absences.add(student.id); else absences.delete(student.id);
        rosterState.absencesByDate[todayKey()][roster.id] = [...absences];
        saveRosterState();
        renderGroups();
      });
      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(student.name));
      elements.absenceList.appendChild(label);
    });
  }

  function renderGeneratedGroups() {
    elements.generatedGroups.innerHTML = "";
    elements.moveStudentSelect.innerHTML = "";
    elements.moveGroupSelect.innerHTML = "";
    groupsState.currentGroups.forEach((group, groupIndex) => {
      const card = document.createElement("div");
      card.className = "group-card";
      const nameInput = document.createElement("input");
      nameInput.value = group.name;
      nameInput.addEventListener("input", () => {
        groupsState.currentGroups[groupIndex].name = nameInput.value || `Group ${groupIndex + 1}`;
        saveGroupsState();
        renderGroupsProjector();
      });
      const size = document.createElement("p");
      size.className = "hint";
      size.textContent = `${group.students.length} students`;
      const list = document.createElement("ul");
      group.students.forEach((student) => {
        const item = document.createElement("li");
        item.textContent = student;
        list.appendChild(item);
        const option = document.createElement("option");
        option.value = student;
        option.textContent = student;
        elements.moveStudentSelect.appendChild(option);
      });
      card.appendChild(nameInput);
      card.appendChild(size);
      card.appendChild(list);
      elements.generatedGroups.appendChild(card);
      const groupOption = document.createElement("option");
      groupOption.value = groupIndex;
      groupOption.textContent = group.name;
      elements.moveGroupSelect.appendChild(groupOption);
    });
  }

  function renderRotation() {
    const rotation = groupsState.lastRotation;
    if (!rotation) {
      elements.rotationTableWrap.innerHTML = "";
      elements.rotationTotalTime.textContent = "";
      return;
    }
    elements.rotationTotalTime.textContent = `Total rotation time: ${rotation.rounds.length * rotation.rotationMinutes + Math.max(0, rotation.rounds.length - 1) * rotation.transitionMinutes} minutes`;
    elements.rotationTableWrap.innerHTML = buildRotationTable(rotation);
  }

  function buildRotationTable(rotation) {
    const headers = rotation.rounds[0]?.assignments.map((assignment) => `<th>${assignment.group}</th>`).join("") || "";
    const rows = rotation.rounds.map((round, index) => {
      const time = rotation.startTime ? `<td>${rotationTimeLabel(rotation, index)}</td>` : "";
      const cells = round.assignments.map((assignment) => `<td>${assignment.station}</td>`).join("");
      return `<tr><th>Round ${round.round}</th>${time}${cells}</tr>`;
    }).join("");
    return `<table class="rotation-table"><thead><tr><th>Round</th>${rotation.startTime ? "<th>Time</th>" : ""}${headers}</tr></thead><tbody>${rows}</tbody></table>`;
  }

  function rotationTimeLabel(rotation, index) {
    const [hours, minutes] = rotation.startTime.split(":").map((value) => Number.parseInt(value, 10));
    const start = new Date();
    start.setHours(hours, minutes + index * (rotation.rotationMinutes + rotation.transitionMinutes), 0, 0);
    const end = new Date(start);
    end.setMinutes(start.getMinutes() + rotation.rotationMinutes);
    return `${start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}-${end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  }

  function renderGroupsProjector() {
    const mode = groupsState.projectorMode;
    if (mode === "rotation" && groupsState.lastRotation) {
      elements.groupsProjectorTitle.textContent = "Rotation Schedule";
      elements.groupsProjectorOutput.innerHTML = buildRotationTable(groupsState.lastRotation);
    } else if ((mode === "current" || mode === "next") && groupsState.lastRotation) {
      const index = Math.min(groupsState.lastRotation.rounds.length - 1, groupsState.currentRoundIndex);
      const round = groupsState.lastRotation.rounds[index];
      elements.groupsProjectorTitle.textContent = `Round ${round.round}`;
      elements.groupsProjectorOutput.innerHTML = `<div class="projector-group-grid">${round.assignments.map((assignment) => `<div class="projector-group-card"><h2>${assignment.group}</h2><p>${assignment.station}</p></div>`).join("")}</div>`;
    } else {
      elements.groupsProjectorTitle.textContent = "Groups";
      elements.groupsProjectorOutput.innerHTML = groupsProjectorGroupsHtml();
    }
  }

  function groupsProjectorGroupsHtml() {
    return `<div class="projector-group-grid">${groupsState.currentGroups.map((group) => `<div class="projector-group-card"><h2>${group.name}</h2><ul>${group.students.map((student) => `<li>${student}</li>`).join("")}</ul></div>`).join("")}</div>`;
  }

  function printGroups(mode) {
    document.body.dataset.printMode = mode;
    if (typeof window.print === "function") {
      window.print();
    }
    delete document.body.dataset.printMode;
  }

  function renderRosterManager() {
    const roster = activeRoster();
    fillRosterSelect(elements.sharedRosterSelect, rosterState.activeRosterId);
    elements.sharedRosterName.value = roster?.name || "";
    elements.sharedRosterInput.value = roster ? roster.students.map((student) => student.name).join("\n") : "";
    renderSharedAbsences();
    const eligible = eligibleStudents();
    elements.sharedRosterCounts.textContent = `${roster?.students.length || 0} students. ${eligible.length} eligible today.`;
    elements.sharedRosterWarnings.textContent = (groupsState.warnings || []).join(" ");
    renderRostersWidget();
  }

  function renderSharedAbsences() {
    const roster = activeRoster();
    elements.sharedAbsenceList.innerHTML = "";
    if (!roster) {
      elements.sharedAbsenceList.textContent = "Create or load a roster to mark absences.";
      return;
    }
    const absent = new Set(todayAbsences(roster.id));
    roster.students.forEach((student) => {
      const label = document.createElement("label");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = absent.has(student.id);
      checkbox.addEventListener("change", () => {
        const absences = new Set(todayAbsences(roster.id));
        if (checkbox.checked) absences.add(student.id); else absences.delete(student.id);
        rosterState.absencesByDate[todayKey()][roster.id] = [...absences];
        saveRosterState();
        renderRosterManager();
        renderGroups();
      });
      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(student.name));
      elements.sharedAbsenceList.appendChild(label);
    });
  }

  function renderRostersWidget() {
    const roster = activeRoster();
    elements.rostersWidgetActive.textContent = roster?.name || "None";
    elements.rostersWidgetEligible.textContent = String(eligibleStudents().length);
  }

  function renderGroupsWidget() {
    elements.groupsWidgetRoster.textContent = activeRoster()?.name || "None";
    elements.groupsWidgetSet.textContent = groupsState.groupSetName || "None";
  }

  function renderSettings() {
    const roster = activeRoster();
    const summary = [
      ["Active roster", roster?.name || "None"],
      ["Number of rosters", rosterState.rosters.length],
      ["Saved group sets", Object.keys(groupsState.groupSets || {}).length],
      ["Timer presets", Array.isArray(timerState.presets) ? timerState.presets.length : 0],
      ["Number Picker history dates", Object.keys(state.historyByDate || {}).length],
      ["Last backup/export", formatStoredTimestamp(localStorage.getItem(BACKUP_META_KEY))],
      ["Hub layout saved", localStorage.getItem(HUB_LAYOUT_KEY) ? "Yes" : "No"]
    ];

    elements.settingsDataSummary.innerHTML = "";
    summary.forEach(([label, value]) => {
      const item = document.createElement("div");
      item.className = "summary-item";
      const labelElement = document.createElement("span");
      labelElement.className = "summary-label";
      labelElement.textContent = label;
      const valueElement = document.createElement("span");
      valueElement.className = "summary-value";
      valueElement.textContent = value;
      item.appendChild(labelElement);
      item.appendChild(valueElement);
      elements.settingsDataSummary.appendChild(item);
    });
  }

  function formatStoredTimestamp(value) {
    if (!value) return "None";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
  }

  function isNumberPickerActive() {
    return !elements.numberPickerModule.hidden && elements.placeholderView.hidden && elements.hubView.hidden;
  }

  function openTeacherControls() {
    elements.teacherView.hidden = false;
    render();
    elements.rangeStart.focus();
  }

  function returnToProjector() {
    elements.teacherView.hidden = true;
    elements.pickButton.focus();
  }

  function handleKeyboard(event) {
    if (event.key === "Escape") {
      if (!elements.teacherView.hidden) {
        returnToProjector();
      } else if (!elements.timerSettingsPanel.hidden) {
        closeTimerSettings();
      } else if (!elements.placeholderView.hidden) {
        showHub();
      }
      return;
    }

    const teacherVisible = !elements.teacherView.hidden;
    const activeTag = document.activeElement ? document.activeElement.tagName : "";
    const isTyping = activeTag === "INPUT" || activeTag === "TEXTAREA" || activeTag === "SELECT";

    if ((event.key === " " || event.key === "Enter") && isNumberPickerActive() && !teacherVisible && !isTyping) {
      event.preventDefault();
      pickNumber();
    }

    if ((event.key === "r" || event.key === "R") && teacherVisible && !isTyping) {
      resetTodayWithConfirmation();
    }
  }

  function render() {
    ensureCurrentDate();
    const allowed = getAllowedNumbers();
    const todayHistory = getTodayHistory();
    renderNumberPickerWidget();
    renderTimerWidget();
    renderRostersWidget();
    renderGroupsWidget();

    elements.numbersLeftText.hidden = !state.showLeftCount;
    elements.numbersLeftText.textContent = `${getDailyNumbersLeft()} numbers left`;

    elements.recentPicksPanel.hidden = !state.showRecent || todayHistory.length === 0;
    elements.recentPicksList.innerHTML = "";
    todayHistory.slice(-10).reverse().forEach((entry) => {
      const item = document.createElement("span");
      item.className = "recent-item";
      item.textContent = entry.number;
      elements.recentPicksList.appendChild(item);
    });

    elements.rangeStart.value = state.rangeStart;
    elements.rangeEnd.value = state.rangeEnd;
    elements.excludedNumbers.value = state.excludedText;
    elements.countdownMode.checked = state.countdownMode;
    elements.showRecent.checked = state.showRecent;
    elements.showLeftCount.checked = state.showLeftCount;
    elements.fairnessMode.value = state.fairnessMode;

    const excludedCount = getExcludedNumbers().size;
    elements.rangeWarning.textContent = allowed.length === 0
      ? "No available numbers in the current range."
      : `${allowed.length} available numbers. ${excludedCount} excluded.`;
    elements.rangeWarning.className = allowed.length === 0 ? "private-warning warning" : "private-warning";

    const cueStatus = getCueStatus();
    elements.cueStatus.textContent = cueStatus.text;
    elements.cueStatus.className = `cue-status ${cueStatus.kind === "warning" ? "warning" : ""} ${cueStatus.kind === "ready" ? "ready" : ""}`;

    renderFairnessDashboard(allowed, todayHistory);
  }

  function renderNumberPickerWidget() {
    elements.widgetRange.textContent = `${state.rangeStart}-${state.rangeEnd}`;
    elements.widgetFairnessMode.textContent = FAIRNESS_MODES[state.fairnessMode];
    elements.widgetNumbersLeft.textContent = String(getDailyNumbersLeft());
  }

  function renderFairnessDashboard(allowed, todayHistory) {
    const leftToday = getDailyNumbersLeft();
    const summaryItems = [
      ["Current mode", FAIRNESS_MODES[state.fairnessMode]],
      ["Picked today", todayHistory.length],
      ["Numbers left", leftToday],
      ["Current cycle", state.currentCycle]
    ];

    elements.fairnessSummary.innerHTML = "";
    summaryItems.forEach(([label, value]) => {
      const item = document.createElement("div");
      item.className = "summary-item";
      item.innerHTML = `<span class="summary-label"></span><span class="summary-value"></span>`;
      item.querySelector(".summary-label").textContent = label;
      item.querySelector(".summary-value").textContent = value;
      elements.fairnessSummary.appendChild(item);
    });

    const todayUsed = new Set(todayHistory.map((entry) => entry.number));
    const lastFiveDates = getLastFiveDates();
    elements.fairnessTableBody.innerHTML = "";

    allowed.forEach((number) => {
      const row = document.createElement("tr");
      const values = [
        number,
        todayUsed.has(number) ? "Yes" : "No",
        countNumberInDates(number, lastFiveDates),
        countNumberAllTime(number)
      ];
      values.forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.appendChild(cell);
      });
      elements.fairnessTableBody.appendChild(row);
    });
  }
})();
