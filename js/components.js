/**
 * Mordo App UI Components
 */

/**
 * Creates a Glass Card container
 * @param {string} content HTML content inside the card
 * @param {string} extraClass Optional extra CSS classes
 */
function createGlassCard(content, extraClass = "") {
  const card = document.createElement("div");
  card.className = `card glass ${extraClass}`;
  card.innerHTML = content;
  return card;
}

/**
 * Creates a Routine Item HTML string
 * @param {string} title
 * @param {string} icon
 */
function createRoutineItem(title, icon = "🌱") {
    return `
        <div class="routine-item glass-white">
            <label class="checkbox-container">
                <input type="checkbox" class="routine-checkbox">
                <span class="checkmark"></span>
            </label>
            <span class="icon">${icon}</span>
            <span class="routine-name">${title}</span>
        </div>
    `;
}

/**
 * Creates a Plant Card HTML string
 * @param {string} name
 * @param {number} level
 * @param {number} progress
 */
function createPlantCard(name, level, progress) {
  return `
        <div class="plant-info">
            <span class="category">Level ${level}</span>
            <h2>${name}</h2>
            <p>Growing since Jan 2026</p>
        </div>
        <div class="plant-visual">
            <div class="plant-placeholder">🌿</div>
        </div>
        <div class="progress-container">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%;"></div>
            </div>
            <span class="progress-text">${progress}% to Level ${level + 1}</span>
        </div>
    `;
}

/**
 * Creates a Timer Card HTML string
 * @param {string} label
 * @param {string} initialTime
 */
function createTimerCard(label, initialTime) {
  return `
        <div class="timer-content">
            <div class="timer-display">
                <span class="time-label">${label}</span>
                <div class="time">${initialTime}</div>
            </div>
            <button class="btn-play gradient-bg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z"/>
                </svg>
            </button>
        </div>
    `;
}

/**
 * Creates a Floating Add Button element
 */
function createFloatingButton() {
  const btn = document.createElement("button");
  btn.className = "floating-btn gradient-bg";
  btn.id = "add-btn";
  btn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
        </svg>
    `;
  return btn;
}
