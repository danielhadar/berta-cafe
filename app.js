// ============================================================
// CONFIGURATION — Change these values to customize the app
// ============================================================

// Change this value to update the punch code for all customers.
// Can be any string: "2552", "caffe", "Berta2026", "7", etc.
var PUNCH_CODE = "2552";

// Change to "text" if PUNCH_CODE contains letters. "numeric" opens the number pad on mobile.
var INPUT_MODE = "numeric";

// Total punches needed for a free coffee.
var TOTAL_PUNCHES = 10;

// Minimum selectable punch quantity.
var MIN_QUANTITY = 1;

// The localStorage key used to persist the punch card.
var LOCALSTORAGE_KEY = "berta_punch_card";

// ============================================================
// SHAPE DEFINITIONS — 16 geometric shapes inspired by the brand
// Each shape is defined relative to center (0,0) within ~34x34 box.
// Parts can be 'circle' or 'path' SVG elements.
// ============================================================

var SHAPE_DEFS = [
  // 0: Full Circle
  { parts: [{ elem: "circle", r: 17 }] },

  // 1: Quarter Circle (center at bottom-left, fills upper-right)
  { parts: [{ elem: "path", d: "M-17,17 L-17,-17 A34,34,0,0,1,17,17 Z" }] },

  // 2: Shield (flat top, rounded bottom)
  { parts: [{ elem: "path", d: "M-16,-17 L16,-17 L16,0 A16,17,0,0,1,-16,0 Z" }] },

  // 3: Crescent (C-shape, opening right)
  { parts: [{ elem: "path", d: "M13.9,-9.8 A17,17,0,1,0,13.9,9.8 A12,12,0,0,1,13.9,-9.8 Z" }] },

  // 4: Notched Circle (3/4 circle, bottom-right removed)
  { parts: [{ elem: "path", d: "M0,0 L0,17 A17,17,0,1,0,17,0 Z" }] },

  // 5: Four-Petal Clover (4 overlapping circles in 2x2)
  { parts: [
    { elem: "circle", cx: -7, cy: -7, r: 9.5 },
    { elem: "circle", cx: 7, cy: -7, r: 9.5 },
    { elem: "circle", cx: -7, cy: 7, r: 9.5 },
    { elem: "circle", cx: 7, cy: 7, r: 9.5 }
  ]},

  // 6: Pac-Man (mouth ~90deg facing right)
  { parts: [{ elem: "path", d: "M0,0 L12,12 A17,17,0,1,0,12,-12 Z" }] },

  // 7: Arch (thick inverted U with hollow center)
  { parts: [{ elem: "path", d: "M-17,3.5 L-17,-8.5 A17,17,0,0,1,17,-8.5 L17,3.5 L9,3.5 L9,-8.5 A9,9,0,0,0,-9,-8.5 L-9,3.5 Z" }] },

  // 8: Circle Cluster (5 circles in quincunx/dice-5 pattern)
  { parts: [
    { elem: "circle", cx: -9, cy: -9, r: 6.5 },
    { elem: "circle", cx: 9, cy: -9, r: 6.5 },
    { elem: "circle", cx: 0, cy: 0, r: 6.5 },
    { elem: "circle", cx: -9, cy: 9, r: 6.5 },
    { elem: "circle", cx: 9, cy: 9, r: 6.5 }
  ]},

  // 9: 8-pointed Star / Asterisk
  { parts: [{ elem: "path", d: "M0,-17 L3.1,-7.4 L12,-12 L7.4,-3.1 L17,0 L7.4,3.1 L12,12 L3.1,7.4 L0,17 L-3.1,7.4 L-12,12 L-7.4,3.1 L-17,0 L-7.4,-3.1 L-12,-12 L-3.1,-7.4 Z" }] },

  // 10: Circle Grid (4x4 small circles)
  { parts: [
    { elem: "circle", cx: -12, cy: -12, r: 3.2 },
    { elem: "circle", cx: -4, cy: -12, r: 3.2 },
    { elem: "circle", cx: 4, cy: -12, r: 3.2 },
    { elem: "circle", cx: 12, cy: -12, r: 3.2 },
    { elem: "circle", cx: -12, cy: -4, r: 3.2 },
    { elem: "circle", cx: -4, cy: -4, r: 3.2 },
    { elem: "circle", cx: 4, cy: -4, r: 3.2 },
    { elem: "circle", cx: 12, cy: -4, r: 3.2 },
    { elem: "circle", cx: -12, cy: 4, r: 3.2 },
    { elem: "circle", cx: -4, cy: 4, r: 3.2 },
    { elem: "circle", cx: 4, cy: 4, r: 3.2 },
    { elem: "circle", cx: 12, cy: 4, r: 3.2 },
    { elem: "circle", cx: -12, cy: 12, r: 3.2 },
    { elem: "circle", cx: -4, cy: 12, r: 3.2 },
    { elem: "circle", cx: 4, cy: 12, r: 3.2 },
    { elem: "circle", cx: 12, cy: 12, r: 3.2 }
  ]},

  // 11: Double Dome (small dome on top, large dome on bottom)
  { parts: [
    { elem: "path", d: "M-10,-2 A10,10,0,0,0,10,-2 Z" },
    { elem: "path", d: "M-17,12 A17,17,0,0,0,17,12 Z" }
  ]},

  // 12: Triple Dome (3 stacked semicircles, smallest on top)
  { parts: [
    { elem: "path", d: "M-5,-8 A5,5,0,0,0,5,-8 Z" },
    { elem: "path", d: "M-10,2 A10,10,0,0,0,10,2 Z" },
    { elem: "path", d: "M-16,13 A16,16,0,0,0,16,13 Z" }
  ]},

  // 13: Triangle Grid (8 right triangles in checkerboard pattern)
  { parts: [
    { elem: "path", d: "M-14,-14 L0,-14 L-14,0 Z" },
    { elem: "path", d: "M0,-14 L14,-14 L14,0 Z" },
    { elem: "path", d: "M0,0 L0,-14 L14,0 Z" },
    { elem: "path", d: "M-14,0 L0,0 L-14,14 Z" },
    { elem: "path", d: "M0,0 L14,0 L14,14 Z" },
    { elem: "path", d: "M0,0 L0,14 L-14,14 Z" },
    { elem: "path", d: "M0,14 L14,0 L14,14 Z" }
  ]},

  // 14: 5-Petal Flower (teardrop petals at 72deg intervals)
  { parts: [
    { elem: "path", d: "M0,1.5 C-5,-3.5 -5,-11.5 0,-14.5 C5,-11.5 5,-3.5 0,1.5 Z" },
    { elem: "path", d: "M0,1.5 C3.2,-4.8 10.8,-7.3 15.2,-3.4 C13.9,2.2 6.3,4.7 0,1.5 Z" },
    { elem: "path", d: "M0,1.5 C7.0,2.6 11.7,9.1 9.4,14.4 C3.6,15.0 -1.1,8.5 0,1.5 Z" },
    { elem: "path", d: "M0,1.5 C1.1,8.5 -3.6,15.0 -9.4,14.4 C-11.7,9.1 -7.0,2.6 0,1.5 Z" },
    { elem: "path", d: "M0,1.5 C-6.3,4.7 -13.9,2.2 -15.2,-3.4 C-10.8,-7.3 -3.2,-4.8 0,1.5 Z" }
  ]},

  // 15: Triple Chevron (3 wide leaf shapes fanning upward)
  { parts: [
    { elem: "path", d: "M0,14 C-3,6 -16,-2 -14,-12 C-10,-6 -2,4 0,14 Z" },
    { elem: "path", d: "M0,14 C-3,4 -3,-10 0,-14 C3,-10 3,4 0,14 Z" },
    { elem: "path", d: "M0,14 C3,6 16,-2 14,-12 C10,-6 2,4 0,14 Z" }
  ]}
];

// Grid positions: 5 columns x 2 rows
var SLOT_POSITIONS = [
  { x: 30, y: 30 },  { x: 90, y: 30 },  { x: 150, y: 30 },  { x: 210, y: 30 },  { x: 270, y: 30 },
  { x: 30, y: 100 }, { x: 90, y: 100 }, { x: 150, y: 100 }, { x: 210, y: 100 }, { x: 270, y: 100 }
];

// ============================================================
// DOM REFERENCES
// ============================================================

var appEl = document.getElementById("app");
var storageErrorEl = document.getElementById("storage-error");
var toastEl = document.getElementById("toast");
var progressCountEl = document.getElementById("progress-count");
var stepperMinusEl = document.getElementById("stepper-minus");
var stepperPlusEl = document.getElementById("stepper-plus");
var stepperValueEl = document.getElementById("stepper-value");
var codeInputEl = document.getElementById("code-input");
var punchBtnEl = document.getElementById("punch-btn");
var statusMessageEl = document.getElementById("status-message");
var celebrationEl = document.getElementById("celebration");
var celebrationCloseEl = document.getElementById("celebration-close");
var cardSvgEl = document.querySelector(".card-svg");
var slotGroups = []; // populated by renderSVGSlots

// ============================================================
// STATE
// ============================================================

var state = { punches: 0, celebrationPending: false, shapeIndices: [] };
var quantity = 1;
var toastTimer = null;
var errorTimer = null;
var isAnimating = false;

// ============================================================
// SHAPE RENDERING
// ============================================================

/**
 * Pick 10 random shape indices from the 16 available (no repeats).
 */
function generateShapeIndices() {
  var indices = [];
  for (var i = 0; i < SHAPE_DEFS.length; i++) {
    indices.push(i);
  }
  // Fisher-Yates shuffle
  for (var i = indices.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = indices[i];
    indices[i] = indices[j];
    indices[j] = temp;
  }
  return indices.slice(0, TOTAL_PUNCHES);
}

/**
 * Create SVG markup for a single element (circle or path).
 * className: "slot-outline" or "slot-fill"
 * isFill: true for the colored fill layer
 */
function createSVGElement(part, className, isFill) {
  var fillAttr, strokeAttr;

  if (isFill) {
    fillAttr = 'fill="rgb(63,92,56)"';
    strokeAttr = 'stroke="rgb(63,92,56)" stroke-width="1.5"';
  } else {
    fillAttr = 'fill="none"';
    strokeAttr = 'stroke="#B5C2A8" stroke-width="1.5"';
  }

  var vecEffect = ' vector-effect="non-scaling-stroke"';

  if (part.elem === "circle") {
    var cx = part.cx || 0;
    var cy = part.cy || 0;
    return '<circle class="' + className + '" cx="' + cx + '" cy="' + cy + '" r="' + part.r + '" ' + fillAttr + ' ' + strokeAttr + vecEffect + '/>';
  } else if (part.elem === "path") {
    return '<path class="' + className + '" d="' + part.d + '" ' + fillAttr + ' ' + strokeAttr + vecEffect + '/>';
  }
  return '';
}

/**
 * Render all 10 SVG slot groups into the card SVG based on shapeIndices.
 */
function renderSVGSlots(shapeIndices) {
  var TARGET_SIZE = 34;

  // Remove existing slots
  var existing = cardSvgEl.querySelectorAll(".slot");
  for (var j = existing.length - 1; j >= 0; j--) {
    cardSvgEl.removeChild(existing[j]);
  }

  // Build and insert new slots with inner group wrapper
  for (var i = 0; i < TOTAL_PUNCHES; i++) {
    var shapeDef = SHAPE_DEFS[shapeIndices[i]];
    var pos = SLOT_POSITIONS[i];
    var html = '';

    // Outline elements
    for (var p = 0; p < shapeDef.parts.length; p++) {
      html += createSVGElement(shapeDef.parts[p], "slot-outline", false);
    }
    // Fill elements
    for (var p = 0; p < shapeDef.parts.length; p++) {
      html += createSVGElement(shapeDef.parts[p], "slot-fill", true);
    }

    // Create the group with inner wrapper for normalization
    var temp = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    temp.innerHTML = '<g class="slot" data-slot="' + i + '" transform="translate(' + pos.x + ',' + pos.y + ')"><g class="slot-inner">' + html + '</g></g>';
    cardSvgEl.appendChild(temp.firstChild);
  }

  // Re-query slot groups
  slotGroups = cardSvgEl.querySelectorAll(".slot");

  // Normalize each shape to fit uniformly in TARGET_SIZE x TARGET_SIZE
  for (var i = 0; i < slotGroups.length; i++) {
    var inner = slotGroups[i].querySelector(".slot-inner");
    try {
      var bbox = inner.getBBox();
      if (bbox.width === 0 || bbox.height === 0) continue;

      var cx = bbox.x + bbox.width / 2;
      var cy = bbox.y + bbox.height / 2;
      var maxDim = Math.max(bbox.width, bbox.height);
      var scale = TARGET_SIZE / maxDim;

      // scale() then translate(): translate runs first (centers shape at origin),
      // then scale resizes to target. vector-effect keeps strokes consistent.
      inner.setAttribute("transform",
        "scale(" + scale + ") translate(" + (-cx) + "," + (-cy) + ")");
    } catch (e) {
      // Shape failed to measure — leave as-is
    }
  }
}

// ============================================================
// LOCALSTORAGE HELPERS
// ============================================================

/**
 * Check if localStorage is available by writing and reading a test value.
 */
function checkLocalStorageAvailable() {
  try {
    var testKey = "__berta_test__";
    localStorage.setItem(testKey, "1");
    var result = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    return result === "1";
  } catch (e) {
    return false;
  }
}

/**
 * Load state from localStorage. Returns defaults if data is
 * missing, unparseable, or fails validation.
 */
function loadState() {
  var defaults = { punches: 0, celebrationPending: false, shapeIndices: generateShapeIndices() };
  var raw;

  try {
    raw = localStorage.getItem(LOCALSTORAGE_KEY);
  } catch (e) {
    return defaults;
  }

  if (raw === null) {
    return defaults;
  }

  var parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    return defaults;
  }

  // Validate punches
  if (typeof parsed.punches !== "number" ||
      !Number.isInteger(parsed.punches) ||
      parsed.punches < 0 ||
      parsed.punches > TOTAL_PUNCHES) {
    return defaults;
  }

  // Validate celebrationPending
  if (typeof parsed.celebrationPending !== "boolean") {
    return defaults;
  }

  // Validate shapeIndices
  if (!Array.isArray(parsed.shapeIndices) ||
      parsed.shapeIndices.length !== TOTAL_PUNCHES) {
    // Keep punches/celebration but assign new shapes
    return {
      punches: parsed.punches,
      celebrationPending: parsed.celebrationPending,
      shapeIndices: generateShapeIndices()
    };
  }

  var seen = {};
  for (var i = 0; i < parsed.shapeIndices.length; i++) {
    var idx = parsed.shapeIndices[i];
    if (typeof idx !== "number" || !Number.isInteger(idx) || idx < 0 || idx >= SHAPE_DEFS.length || seen[idx]) {
      return {
        punches: parsed.punches,
        celebrationPending: parsed.celebrationPending,
        shapeIndices: generateShapeIndices()
      };
    }
    seen[idx] = true;
  }

  return {
    punches: parsed.punches,
    celebrationPending: parsed.celebrationPending,
    shapeIndices: parsed.shapeIndices.slice()
  };
}

/**
 * Save state to localStorage. Shows a toast on error.
 */
function saveState(newState) {
  state = newState;
  try {
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    showToast("לא ניתן לשמור את הכרטיס");
  }
}

// ============================================================
// RENDERING
// ============================================================

/**
 * Render the entire UI from the current state (static, no animation).
 */
function render() {
  for (var i = 0; i < slotGroups.length; i++) {
    slotGroups[i].classList.remove("animating");
    if (i < state.punches) {
      slotGroups[i].classList.add("punched");
    } else {
      slotGroups[i].classList.remove("punched");
    }
  }

  progressCountEl.textContent = state.punches;

  var maxQuantity = TOTAL_PUNCHES - state.punches;
  if (maxQuantity < MIN_QUANTITY) {
    maxQuantity = MIN_QUANTITY;
  }
  if (quantity > maxQuantity) {
    quantity = maxQuantity;
  }
  if (quantity < MIN_QUANTITY) {
    quantity = MIN_QUANTITY;
  }
  renderStepper(maxQuantity);
}

/**
 * Animate new punches filling in one by one with a 200ms stagger.
 */
function animatePunches(startSlot, count, onComplete) {
  var animationDuration = 400;
  var stagger = 200;

  for (var i = 0; i < count; i++) {
    (function (slotIndex, delay) {
      setTimeout(function () {
        slotGroups[slotIndex].classList.add("punched", "animating");
        progressCountEl.textContent = slotIndex + 1;
      }, delay);
    })(startSlot + i, i * stagger);
  }

  var totalTime = (count - 1) * stagger + animationDuration;
  if (onComplete) {
    setTimeout(onComplete, totalTime);
  }
}

/**
 * Render the stepper value and button disabled states.
 */
function renderStepper(maxQuantity) {
  stepperValueEl.textContent = quantity;
  stepperMinusEl.disabled = (quantity <= MIN_QUANTITY);
  stepperPlusEl.disabled = (quantity >= maxQuantity);
}

/**
 * Update the punch button disabled state based on input content.
 */
function updatePunchButtonState() {
  punchBtnEl.disabled = (codeInputEl.value.length === 0);
}

// ============================================================
// TOAST
// ============================================================

function showToast(message, duration) {
  if (duration === undefined) {
    duration = 1500;
  }

  if (toastTimer !== null) {
    clearTimeout(toastTimer);
    toastTimer = null;
  }

  toastEl.textContent = message;
  toastEl.classList.remove("hidden");
  void toastEl.offsetWidth;
  toastEl.classList.add("visible");

  toastTimer = setTimeout(function () {
    toastEl.classList.remove("visible");
    setTimeout(function () {
      toastEl.classList.add("hidden");
    }, 300);
    toastTimer = null;
  }, duration);
}

// ============================================================
// STATUS MESSAGE (error / success below input)
// ============================================================

function showStatusMessage(text, type) {
  if (errorTimer !== null) {
    clearTimeout(errorTimer);
    errorTimer = null;
  }

  statusMessageEl.textContent = text;
  statusMessageEl.className = "status-message " + type;

  if (type === "error") {
    errorTimer = setTimeout(function () {
      clearStatusMessage();
      errorTimer = null;
    }, 3000);
  }
}

function clearStatusMessage() {
  statusMessageEl.textContent = "";
  statusMessageEl.className = "status-message hidden";
  if (errorTimer !== null) {
    clearTimeout(errorTimer);
    errorTimer = null;
  }
}

// ============================================================
// CELEBRATION
// ============================================================

function trapFocusCelebration(e) {
  if (e.key === "Tab") {
    e.preventDefault();
    celebrationCloseEl.focus();
  }
  if (e.key === "Escape") {
    dismissCelebration();
  }
}

function showCelebration() {
  celebrationEl.classList.add("visible");
  document.body.classList.add("celebration-active");
  appEl.setAttribute("aria-hidden", "true");
  document.addEventListener("keydown", trapFocusCelebration);
  setTimeout(function () {
    celebrationCloseEl.focus();
  }, 300);
}

function dismissCelebration() {
  if (!celebrationEl.classList.contains("visible")) return;

  celebrationEl.classList.remove("visible");
  document.removeEventListener("keydown", trapFocusCelebration);

  setTimeout(function () {
    document.body.classList.remove("celebration-active");
    appEl.removeAttribute("aria-hidden");

    // Generate new shapes for the new card
    var newIndices = generateShapeIndices();
    saveState({ punches: 0, celebrationPending: false, shapeIndices: newIndices });

    // Re-render SVG with new shapes
    renderSVGSlots(state.shapeIndices);

    quantity = 1;
    render();
    unlockUI();

    showToast("כרטיסיה חדשה :)");
  }, 300);
}

// ============================================================
// PUNCH LOGIC
// ============================================================

function lockUI() {
  isAnimating = true;
  punchBtnEl.disabled = true;
  stepperMinusEl.disabled = true;
  stepperPlusEl.disabled = true;
  codeInputEl.disabled = true;
}

function unlockUI() {
  isAnimating = false;
  codeInputEl.disabled = false;
  updatePunchButtonState();
  var maxQuantity = TOTAL_PUNCHES - state.punches;
  if (maxQuantity < MIN_QUANTITY) maxQuantity = MIN_QUANTITY;
  renderStepper(maxQuantity);
}

function handlePunch() {
  if (isAnimating) return;

  var enteredCode = codeInputEl.value.trim().toLowerCase();
  var correctCode = PUNCH_CODE.toLowerCase();

  if (enteredCode === correctCode) {
    var oldPunches = state.punches;
    var awardedQuantity = quantity;
    var newPunches = oldPunches + awardedQuantity;

    if (newPunches > TOTAL_PUNCHES) {
      newPunches = TOTAL_PUNCHES;
      awardedQuantity = TOTAL_PUNCHES - oldPunches;
    }

    codeInputEl.value = "";
    quantity = 1;
    clearStatusMessage();
    lockUI();

    if (newPunches === TOTAL_PUNCHES) {
      saveState({ punches: 0, celebrationPending: true, shapeIndices: state.shapeIndices });

      animatePunches(oldPunches, awardedQuantity, function () {
        setTimeout(function () {
          showCelebration();
        }, 500);
      });
    } else {
      saveState({ punches: newPunches, celebrationPending: false, shapeIndices: state.shapeIndices });

      animatePunches(oldPunches, awardedQuantity, function () {
        unlockUI();

        if (awardedQuantity === 1) {
          showToast("ניקוב נוסף בהצלחה");
        } else {
          showToast(awardedQuantity + " ניקובים נוספו בהצלחה");
        }
      });
    }
  } else {
    codeInputEl.value = "";
    updatePunchButtonState();

    codeInputEl.classList.add("shake");

    showStatusMessage("קוד לא נכון, נסו שוב", "error");
  }
}

// ============================================================
// EVENT HANDLERS
// ============================================================

stepperMinusEl.addEventListener("click", function () {
  if (isAnimating) return;
  if (quantity > MIN_QUANTITY) {
    quantity--;
    var maxQuantity = TOTAL_PUNCHES - state.punches;
    if (maxQuantity < MIN_QUANTITY) maxQuantity = MIN_QUANTITY;
    renderStepper(maxQuantity);
  }
});

stepperPlusEl.addEventListener("click", function () {
  if (isAnimating) return;
  var maxQuantity = TOTAL_PUNCHES - state.punches;
  if (maxQuantity < MIN_QUANTITY) maxQuantity = MIN_QUANTITY;
  if (quantity < maxQuantity) {
    quantity++;
    renderStepper(maxQuantity);
  }
});

codeInputEl.addEventListener("input", function () {
  updatePunchButtonState();
  if (statusMessageEl.classList.contains("error")) {
    clearStatusMessage();
  }
});

punchBtnEl.addEventListener("click", function () {
  if (!punchBtnEl.disabled) {
    handlePunch();
  }
});

codeInputEl.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && codeInputEl.value.length > 0) {
    e.preventDefault();
    handlePunch();
  }
});

codeInputEl.addEventListener("animationend", function () {
  codeInputEl.classList.remove("shake");
});

celebrationCloseEl.addEventListener("click", function () {
  dismissCelebration();
});

// Cross-tab sync via storage event
window.addEventListener("storage", function (e) {
  if (e.key === LOCALSTORAGE_KEY) {
    if (isAnimating || celebrationEl.classList.contains("visible")) return;
    state = loadState();
    renderSVGSlots(state.shapeIndices);
    quantity = 1;
    render();
    if (state.celebrationPending) {
      lockUI();
      showCelebration();
    }
  }
});

// ============================================================
// INITIALIZATION
// ============================================================

(function init() {
  // Set inputmode from config constant
  codeInputEl.setAttribute("inputmode", INPUT_MODE);

  // Check localStorage availability
  if (!checkLocalStorageAvailable()) {
    appEl.classList.add("hidden");
    storageErrorEl.classList.remove("hidden");
    return;
  }

  // Load persisted state
  state = loadState();

  // Render SVG shapes
  renderSVGSlots(state.shapeIndices);

  // Initial render
  render();
  updatePunchButtonState();

  // Save state if shapes were newly generated (first load or migration)
  saveState(state);

  // Check for pending celebration
  if (state.celebrationPending) {
    // Show full card behind celebration overlay
    for (var i = 0; i < slotGroups.length; i++) {
      slotGroups[i].classList.add("punched");
    }
    progressCountEl.textContent = TOTAL_PUNCHES;
    lockUI();
    showCelebration();
  }
})();
