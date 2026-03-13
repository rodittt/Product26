/**
 * Mordo App - Core Logic
 */

// App State
const state = {
    onboarding: {
        currentStep: 1,
        wakeTime: '06:30 AM',
        routines: [],
        alarmSound: 'Morning Calm'
    },
    activeRoutineId: null,
    completedRoutines: new Set(),
    capturedPhotos: ["🧘", "💧", "📖"], // Initial mock photos
    achievement: {
        currentDate: new Date(2026, 1, 1), // Feb 2026 as per request start
        growthLevel: 3
    },
    screens: ["onboarding-screen", "app-screen", "camera-screen", "add-routine-screen", "history-screen"],
    currentTab: "home",
    appTabScreens: ["home-tab", "record-tab", "achievement-tab", "alarm-tab"]
};

document.addEventListener("DOMContentLoaded", () => {
    console.log("Mordo App Initializing...");
    
    // Core App Initialization
    initApp();
});

function initApp() {
    // 1. Core Navigation & Screens
    initNavigation();
    initScreenManagement();
    
    // 2. Onboarding Flow
    initOnboarding();
    
    // 3. Home Screen Interactions
    initRoutineToggle();
    initAddButton();
    initEditMode();
    
    // 4. Record & Achievement (Guarded)
    initPhotoCellLogic();
    initSeeMoreHistory();
    initCalendarLogic();
    initGrowthStepLogic();
    
    // 5. Alarm Settings
    initAlarmLogic();
    
    // 6. Camera Cert (Mock)
    initCameraLogic();
    
    // 7. Add Routine Logic
    initAddRoutineFlow();

    // 8. History Logic
    initHistoryLogic();

    // Initial State Check
    initializeHomeState();
}

/**
 * Global Screen Management
 */
function showScreen(screenId) {
    state.screens.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (id === screenId) {
                el.classList.remove("hidden");
            } else {
                el.classList.add("hidden");
            }
        }
    });
}

function showAppTab(tabId) {
    state.currentTab = tabId;
    const screens = state.appTabScreens;
    
    screens.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (id === `${tabId}-tab`) {
                el.classList.remove("hidden");
            } else {
                el.classList.add("hidden");
            }
        }
    });

    // Update Bottom Navigation UI
    const tabs = document.querySelectorAll(".tab-item");
    tabs.forEach(tab => {
        if (tab.dataset.tab === tabId) {
            tab.classList.add("active");
        } else {
            tab.classList.remove("active");
        }
    });

    // Refresh Tab UI
    if (tabId === "home") {
        injectRoutinesToHome();
        updateRoutineProgress();
    } else if (tabId === "record") {
        updateRecordUI();
    } else if (tabId === "achievement") {
        renderCalendar(state.achievement.currentDate);
    }
}

function initScreenManagement() {
    // Determine starting screen (MVP starts with Onboarding)
    const onboarding = document.getElementById("onboarding-screen");
    if (onboarding && !onboarding.classList.contains("hidden")) {
        showScreen("onboarding-screen");
    }
}

/**
 * Onboarding Flow
 */
function initOnboarding() {
    const nextBtns = document.querySelectorAll(".next-btn");
    const prevBtns = document.querySelectorAll(".prev-btn");
    const startBtn = document.getElementById("start-app-btn");
    const addRoutineBtn = document.getElementById("btn-add-routine");
    const soundOptions = document.querySelectorAll(".sound-option");
    const ampmBtns = document.querySelectorAll(".pill-btn"); // Updated to match HTML

    nextBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            if (state.onboarding.currentStep < 3) {
                state.onboarding.currentStep++;
                updateOnboardingUI();
            }
        });
    });

    prevBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            if (state.onboarding.currentStep > 1) {
                state.onboarding.currentStep--;
                updateOnboardingUI();
            }
        });
    });

    ampmBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            ampmBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            state.onboarding.wakeTime = `06:30 ${btn.dataset.ampm || 'AM'}`;
        });
    });

    if (addRoutineBtn) {
        addRoutineBtn.addEventListener("click", () => {
            const thirdRow = document.getElementById("routine-3-row");
            if (thirdRow) {
                thirdRow.classList.remove("hidden");
                addRoutineBtn.classList.add("hidden");
            }
        });
    }

    soundOptions.forEach(opt => {
        opt.addEventListener("click", () => {
            soundOptions.forEach(s => s.classList.remove("active"));
            const checks = document.querySelectorAll(".sound-option .check");
            checks.forEach(c => c.remove());
            
            opt.classList.add("active");
            const check = document.createElement("span");
            check.className = "check";
            check.innerText = "✓";
            check.style.color = "var(--color-green)";
            opt.appendChild(check);
            
            state.onboarding.alarmSound = opt.dataset.sound;
        });
    });

    if (startBtn) {
        startBtn.addEventListener("click", () => {
            const inputs = document.querySelectorAll(".routine-input");
            state.onboarding.routines = Array.from(inputs)
                .map(i => i.value.trim())
                .filter(v => v !== "");

            completeOnboarding();
        });
    }
}

function updateOnboardingUI() {
    const steps = document.querySelectorAll(".onboarding-step");
    const dots = document.querySelectorAll(".step-dot");

    steps.forEach((s, idx) => {
        if (idx + 1 === state.onboarding.currentStep) {
            s.classList.remove("hidden");
        } else {
            s.classList.add("hidden");
        }
    });

    dots.forEach((d, idx) => {
        if (idx + 1 === state.onboarding.currentStep) {
            d.classList.add("active");
        } else {
            d.classList.remove("active");
        }
    });

    // Update header back button visibility
    const headerPrevBtn = document.querySelector(".header-prev-btn");
    if (headerPrevBtn) {
        if (state.onboarding.currentStep > 1) {
            headerPrevBtn.classList.remove("hidden");
        } else {
            headerPrevBtn.classList.add("hidden");
        }
    }
}

function initAddRoutineFlow() {
    const backBtn = document.getElementById("add-routine-back-btn");
    const saveBtn = document.getElementById("save-routine-btn");
    const input = document.getElementById("new-routine-input");

    if (backBtn) {
        backBtn.addEventListener("click", () => showScreen("app-screen"));
    }

    if (saveBtn) {
        saveBtn.addEventListener("click", () => {
            const name = input.value.trim();
            if (name) {
                state.onboarding.routines.push(name);
                input.value = "";
                showScreen("app-screen");
                injectRoutinesToHome();
                updateRoutineProgress();
            } else {
                alert("루틴 이름을 입력해주세요.");
            }
        });
    }
}

function completeOnboarding() {
    showScreen("app-screen");
    showAppTab("home");
    injectRoutinesToHome();
    updateRoutineProgress();
    console.log("Onboarding Finished", state.onboarding);
}

/**
 * Home Screen Logic
 */
function initializeHomeState() {
    // If we start in home directly (for debug)
    const appScreen = document.getElementById("app-screen");
    if (appScreen && !appScreen.classList.contains("hidden")) {
        injectRoutinesToHome();
        updateRoutineProgress();
    }
}

function injectRoutinesToHome() {
    const homeRoutineList = document.getElementById("home-routine-list");
    if (!homeRoutineList) return;
    
    const routines = state.onboarding.routines.length > 0 
        ? state.onboarding.routines 
        : ["스트레칭 10분", "물 한 잔 마시기", "책 10페이지 읽기"];

    // Ensure state reflects initial routines if empty
    if (state.onboarding.routines.length === 0) {
        state.onboarding.routines = [...routines];
    }

    homeRoutineList.innerHTML = state.onboarding.routines.map((r, idx) => {
        const id = `routine-${idx}`;
        const isDone = state.completedRoutines.has(id);
        const icons = ["🧘", "💧", "📖"];
        return `
            <div class="routine-item glass-white ${isDone ? 'completed' : ''}" 
                 data-id="${id}" 
                 data-index="${idx}"
                 data-name="${r}"
                 draggable="false">
                <div class="delete-routine-btn" data-index="${idx}">✕</div>
                <label class="checkbox-container">
                    <input type="checkbox" class="routine-checkbox" ${isDone ? 'checked' : ''}>
                    <span class="checkmark"></span>
                </label>
                <span class="icon">${icons[idx] || "🌱"}</span>
                <span class="routine-name">${r}</span>
                <div class="drag-handle">⠿</div>
            </div>
        `;
    }).join("");

    initDragAndDrop();
    initDeleteLogic();
}

function initDeleteLogic() {
    const deleteBtns = document.querySelectorAll(".delete-routine-btn");
    deleteBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const index = parseInt(btn.dataset.index);
            state.onboarding.routines.splice(index, 1);
            injectRoutinesToHome();
            updateRoutineProgress();
        });
    });
}

function initDragAndDrop() {
    const list = document.getElementById("home-routine-list");
    const items = list.querySelectorAll(".routine-item");
    const section = document.querySelector(".routine-section");

    items.forEach(item => {
        item.addEventListener("dragstart", (e) => {
            if (!section.classList.contains("edit-mode")) {
                e.preventDefault();
                return;
            }
            item.classList.add("dragging");
            e.dataTransfer.setData("text/plain", item.dataset.index);
        });

        item.addEventListener("dragend", () => {
            item.classList.remove("dragging");
        });

        item.addEventListener("dragover", (e) => {
            e.preventDefault();
            const draggingItem = list.querySelector(".dragging");
            if (!draggingItem || draggingItem === item) return;

            const bounding = item.getBoundingClientRect();
            const offset = e.clientY - bounding.top - bounding.height / 2;
            if (offset > 0) {
                item.after(draggingItem);
            } else {
                item.before(draggingItem);
            }
        });

        item.addEventListener("drop", (e) => {
            e.preventDefault();
            const newOrder = Array.from(list.querySelectorAll(".routine-item")).map(el => 
                state.onboarding.routines[parseInt(el.dataset.index)]
            );
            state.onboarding.routines = newOrder;
            injectRoutinesToHome();
        });
    });
}

function updateRoutineProgress() {
    const total = document.querySelectorAll(".routine-item").length;
    const completed = state.completedRoutines.size;
    
    const statsText = document.querySelector(".plant-card .card-stats");
    const progressFill = document.querySelector(".plant-card .fill");
    
    if (statsText) {
        statsText.innerText = `${completed}/${total} 완료`;
    }
    
    if (progressFill) {
        const percent = total > 0 ? (completed / total) * 100 : 0;
        progressFill.style.width = `${percent}%`;
    }
}

function initRoutineToggle() {
    document.addEventListener("change", (e) => {
        if (e.target.classList.contains("routine-checkbox")) {
            const routineItem = e.target.closest(".routine-item");
            if (routineItem) {
                const id = routineItem.dataset.id;
                const name = routineItem.dataset.name;
                if (e.target.checked) {
                    routineItem.classList.add("completed");
                    state.completedRoutines.add(id);
                    // Open camera on check
                    openCamera(id, name);
                } else {
                    routineItem.classList.remove("completed");
                    state.completedRoutines.delete(id);
                }
                updateRoutineProgress();
            }
        }
    });
}

/**
 * Camera Mock Flow
 */
function initCameraLogic() {
    const backBtn = document.getElementById("camera-back-btn");
    const captureBtn = document.getElementById("capture-btn");
    const completeBtn = document.getElementById("camera-complete-btn");

    if (backBtn) {
        backBtn.addEventListener("click", () => {
            showScreen("app-screen");
            showAppTab(state.currentTab);
        });
    }

    if (captureBtn) {
        captureBtn.addEventListener("click", () => {
            const overlay = document.getElementById("capture-overlay");
            if (overlay) overlay.classList.remove("hidden");
        });
    }

    if (completeBtn) {
        completeBtn.addEventListener("click", () => finalizeCompletion());
    }
}

function openCamera(id, name) {
    state.activeRoutineId = id;
    const titleEl = document.getElementById("selected-routine-title");
    if (titleEl) titleEl.innerText = name;
    
    const timeEl = document.getElementById("camera-time");
    if (timeEl) {
        const now = new Date();
        timeEl.innerText = now.toLocaleString('ko-KR', { 
            year: 'numeric', month: '2-digit', day: '2-digit', 
            hour: '2-digit', minute: '2-digit', hour12: true 
        }).toUpperCase();
    }

    const overlay = document.getElementById("capture-overlay");
    if (overlay) overlay.classList.add("hidden");
    
    showScreen("camera-screen");
}

function finalizeCompletion() {
    if (state.activeRoutineId) {
        state.completedRoutines.add(state.activeRoutineId);
        
        // Push routine icon to captured photos
        const routineItem = document.querySelector(`.routine-item[data-id="${state.activeRoutineId}"]`);
        if (routineItem) {
            const icon = routineItem.querySelector(".icon").innerText;
            state.capturedPhotos.unshift(icon); // Latest at the front
        }

        showScreen("app-screen");
        showAppTab(state.currentTab);
        injectRoutinesToHome();
        updateRoutineProgress();
        updateRecordUI();
    }
}

function updateRecordUI() {
    const photoGrid = document.getElementById("record-photo-grid");
    if (!photoGrid) return;

    // First 3 filled, then empty slots
    const totalSlots = 6;
    let html = state.capturedPhotos.slice(0, 6).map(icon => `
        <div class="photo-cell filled">${icon}</div>
    `).join("");

    const emptyCount = totalSlots - state.capturedPhotos.slice(0, 6).length;
    for(let i=0; i<emptyCount; i++) {
        html += `<div class="photo-cell add-slot"></div>`;
    }

    photoGrid.innerHTML = html;
}

function initHistoryLogic() {
    const seeMoreBtn = document.querySelector(".see-more");
    const backBtn = document.getElementById("history-back-btn");

    if (seeMoreBtn) {
        seeMoreBtn.addEventListener("click", (e) => {
            e.preventDefault();
            renderFullHistory();
            showScreen("history-screen");
        });
    }

    if (backBtn) {
        backBtn.addEventListener("click", () => showScreen("app-screen"));
    }
}

function renderFullHistory() {
    const list = document.getElementById("full-history-list");
    if (!list) return;

    // Mock longer history
    const historyData = [
        { date: "01.14", routines: ["🧘 스트레칭", "💧 물 마시기"], count: "2/3" },
        { date: "01.13", routines: ["🧘 스트레칭"], count: "1/3" },
        { date: "01.12", routines: ["🧘 스트레칭", "💧 물 마시기", "📖 독서"], count: "3/3" },
        { date: "01.11", routines: ["💧 물 마시기"], count: "1/3" },
        { date: "01.10", routines: ["🧘 스트레칭", "📖 독서"], count: "2/3" },
        { date: "01.09", routines: ["💧 물 마시기", "🌱 명상"], count: "2/3" }
    ];

    list.innerHTML = historyData.map(item => `
        <div class="history-item glass-white">
            <span class="date">${item.date}</span>
            <div class="history-tags">
                ${item.routines.map(r => `<span class="history-chip">${r}</span>`).join("")}
            </div>
            <span class="completion">${item.count}</span>
        </div>
    `).join("");
}

/**
 * Aux UI Components (Guarded)
 */
function initNavigation() {
    const tabs = document.querySelectorAll(".tab-item");
    tabs.forEach(tab => {
        tab.addEventListener("click", (e) => {
            e.preventDefault();
            const tabName = tab.dataset.tab;
            if (tabName) {
                showAppTab(tabName);
            }
        });
    });
}

function initAddButton() {
    const btn = document.getElementById("fab-add");
    if (btn) {
        btn.addEventListener("click", () => showScreen("add-routine-screen"));
    }
}

function initEditMode() {
    const btn = document.querySelector(".edit-btn");
    const section = document.querySelector(".routine-section");
    const list = document.getElementById("home-routine-list");
    if (btn && section) {
        btn.addEventListener("click", () => {
            const isEditing = section.classList.toggle("edit-mode");
            btn.innerText = isEditing ? "완료" : "편집";
            btn.style.background = isEditing ? "var(--text-primary)" : "none";
            btn.style.color = isEditing ? "white" : "inherit";

            // Enable/Disable draggable
            const items = list.querySelectorAll(".routine-item");
            items.forEach(item => {
                item.setAttribute("draggable", isEditing ? "true" : "false");
            });
        });
    }
}

function initPhotoCellLogic() {
    const cells = document.querySelectorAll(".photo-cell");
    cells.forEach(cell => {
        cell.addEventListener("click", () => {
            cells.forEach(c => c.classList.remove("active"));
            cell.classList.add("active");
        });
    });
}

function initSeeMoreHistory() {
    const btn = document.querySelector(".see-more");
    if (btn) btn.addEventListener("click", (e) => {
        e.preventDefault();
        alert("📜 전체 히스토리 목록으로 이동합니다.");
    });
}

function initCalendarLogic() {
    const prevBtn = document.getElementById("prev-month-btn");
    const nextBtn = document.getElementById("next-month-btn");

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener("click", () => {
            state.achievement.currentDate.setMonth(state.achievement.currentDate.getMonth() - 1);
            renderCalendar(state.achievement.currentDate);
        });
        nextBtn.addEventListener("click", () => {
            state.achievement.currentDate.setMonth(state.achievement.currentDate.getMonth() + 1);
            renderCalendar(state.achievement.currentDate);
        });
    }

    renderCalendar(state.achievement.currentDate);
}

function renderCalendar(date) {
    const grid = document.querySelector(".calendar-grid");
    const title = document.querySelector(".month-title");
    if (!grid || !title) return;

    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Set Header Title (e.g., 2026 January)
    const monthNames = ["January", "February", "March", "April", "May", "June", 
                      "July", "August", "September", "October", "November", "December"];
    title.innerText = `${year} ${monthNames[month]}`;

    grid.innerHTML = "";

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Fill empty slots for previous month
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement("div");
        emptyCell.className = "calendar-cell empty";
        grid.appendChild(emptyCell);
    }

    // Fill days
    const today = new Date();
    for (let d = 1; d <= daysInMonth; d++) {
        const cell = document.createElement("div");
        cell.className = "calendar-cell";
        cell.innerText = d;

        // Mock some completed days for current/past months
        if (year < today.getFullYear() || (year === today.getFullYear() && month <= today.getMonth())) {
            if (d <= 15) {
                cell.classList.add("done", `level-${Math.floor(Math.random() * 4) + 1}`);
            }
        }
        
        if (d === 15 && month === 1) cell.classList.add("selected");

        cell.addEventListener("click", () => {
            grid.querySelectorAll(".calendar-cell").forEach(c => c.classList.remove("selected"));
            cell.classList.add("selected");
        });

        grid.appendChild(cell);
    }

    // Fill future empty slots to keep 6 rows (42 cells)
    const totalCells = grid.children.length;
    const remainingCells = 42 - totalCells;
    for (let i = 0; i < remainingCells; i++) {
        const futureCell = document.createElement("div");
        futureCell.className = "calendar-cell future";
        grid.appendChild(futureCell);
    }
}

function initGrowthStepLogic() {
    const steps = document.querySelectorAll(".growth-step");
    const stageLabel = document.querySelector(".stage-now");
    
    steps.forEach((step, idx) => {
        // Growth logic could be more dynamic, but here we just handle the visual selection
        step.addEventListener("click", () => {
            steps.forEach(s => s.classList.remove("active"));
            step.classList.add("active");
            
            const label = step.querySelector(".step-label").innerText;
            if (stageLabel) stageLabel.innerText = label;
        });
    });
}

function initAlarmLogic() {
    const days = document.querySelectorAll(".repeat-day");
    if (days.length > 0) {
        days.forEach(d => d.addEventListener("click", () => d.classList.toggle("active")));
    }

    const openSheetBtn = document.getElementById("open-repeat-sheet");
    const overlay = document.getElementById("sheet-overlay");
    const saveBtn = document.getElementById("save-sheet");
    const repeatToggle = document.getElementById("repeat-toggle");
    const sheetRepeatToggle = document.getElementById("sheet-repeat-toggle");

    if (openSheetBtn && overlay) {
        openSheetBtn.addEventListener("click", (e) => {
            // Only open if not clicking the toggle itself
            if (e.target.type !== "checkbox" && !e.target.closest(".switch")) {
                overlay.classList.add("active");
            }
        });

        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) overlay.classList.remove("active");
        });

        if (saveBtn) {
            saveBtn.addEventListener("click", () => {
                overlay.classList.remove("active");
                if (repeatToggle && sheetRepeatToggle) {
                    repeatToggle.checked = sheetRepeatToggle.checked;
                }
            });
        }
        
        if (repeatToggle && sheetRepeatToggle) {
            repeatToggle.addEventListener("change", () => {
                sheetRepeatToggle.checked = repeatToggle.checked;
            });
            sheetRepeatToggle.addEventListener("change", () => {
                repeatToggle.checked = sheetRepeatToggle.checked;
            });
        }
    }

    const snoozeOptions = document.querySelectorAll(".snooze-option");
    if (snoozeOptions.length > 0) {
        snoozeOptions.forEach(opt => {
            opt.addEventListener("click", () => {
                snoozeOptions.forEach(o => o.classList.remove("active"));
                opt.classList.add("active");
            });
        });
    }

    const mainToggle = document.getElementById("main-alarm-toggle");
    if (mainToggle) {
        mainToggle.addEventListener("change", () => {
            const card = document.querySelector(".alarm-time-card");
            if (card) card.style.opacity = mainToggle.checked ? "1" : "0.6";
        });
    }
}
