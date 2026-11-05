// ======================================
// SMARTDESK 2.0 - MAIN JAVASCRIPT
// ======================================

const $ = id => document.getElementById(id);

// ======================================
// NAVIGATION
// ======================================

function showPage(pageId) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.toggle("active", page.id === pageId);
  });

  document.querySelectorAll(".nav-btn").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.page === pageId
    );
  });

  window.scrollTo(0, 0);
}

document.querySelectorAll("[data-page]").forEach(button => {
  button.addEventListener("click", () => {
    showPage(button.dataset.page);
  });
});

// ======================================
// DATE
// ======================================

$("todayDate").textContent = new Date().toLocaleDateString("en-IN", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric"
});

// ======================================
// THEME
// ======================================

function applyTheme(theme) {
  document.body.classList.toggle("light", theme === "light");

  localStorage.setItem("smartdesk_theme", theme);

  $("themeBtn").textContent =
    theme === "light" ? "☾" : "☀";
}

function toggleTheme() {
  const light = document.body.classList.contains("light");

  applyTheme(light ? "dark" : "light");
}

applyTheme(
  localStorage.getItem("smartdesk_theme") || "dark"
);

$("themeBtn").addEventListener("click", toggleTheme);

$("settingsTheme").addEventListener("click", toggleTheme);

// ======================================
// NOTES
// ======================================

let notes = [];

try {
  notes = JSON.parse(
    localStorage.getItem("smartdesk_notes") || "[]"
  );

  if (!Array.isArray(notes)) {
    notes = [];
  }
} catch (error) {
  notes = [];
}

function saveNotes() {
  localStorage.setItem(
    "smartdesk_notes",
    JSON.stringify(notes)
  );

  renderNotes();
}

function renderNotes() {
  const list = $("notesList");

  list.replaceChildren();

  $("noteCount").textContent = notes.length;

  if (notes.length === 0) {
    list.textContent = "No notes saved yet.";
    return;
  }

  notes.forEach((note, index) => {
    const card = document.createElement("div");

    card.className = "saved-item";

    const paragraph = document.createElement("p");

    paragraph.textContent = note;

    const actions = document.createElement("div");

    actions.className = "item-actions";

    const deleteButton = document.createElement("button");

    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", () => {
      notes.splice(index, 1);
      saveNotes();
    });

    actions.appendChild(deleteButton);

    card.append(paragraph, actions);

    list.appendChild(card);
  });
}

$("saveNote").addEventListener("click", () => {
  const value = $("noteInput").value.trim();

  if (!value) {
    alert("Please write a note first.");
    return;
  }

  notes.unshift(value);

  $("noteInput").value = "";

  saveNotes();
});

renderNotes();

// ======================================
// TASKS
// ======================================

let tasks = [];

try {
  tasks = JSON.parse(
    localStorage.getItem("smartdesk_tasks") || "[]"
  );

  if (!Array.isArray(tasks)) {
    tasks = [];
  }
} catch (error) {
  tasks = [];
}

function saveTasks() {
  localStorage.setItem(
    "smartdesk_tasks",
    JSON.stringify(tasks)
  );

  renderTasks();
}

function renderTasks() {
  const list = $("tasksList");

  list.replaceChildren();

  $("taskCount").textContent = tasks.length;

  if (tasks.length === 0) {
    list.textContent = "No tasks added yet.";
    return;
  }

  tasks.forEach((task, index) => {
    const card = document.createElement("div");

    card.className = "saved-item";

    const row = document.createElement("div");

    row.className = "task-row";

    const checkbox = document.createElement("input");

    checkbox.type = "checkbox";

    checkbox.checked = task.done;

    const label = document.createElement("span");

    label.textContent = task.text;

    label.classList.toggle("done", task.done);

    checkbox.addEventListener("change", () => {
      tasks[index].done = checkbox.checked;

      saveTasks();
    });

    const deleteButton = document.createElement("button");

    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", () => {
      tasks.splice(index, 1);

      saveTasks();
    });

    row.append(checkbox, label, deleteButton);

    card.appendChild(row);

    list.appendChild(card);
  });
}

$("taskForm").addEventListener("submit", event => {
  event.preventDefault();

  const value = $("taskInput").value.trim();

  if (!value) return;

  tasks.unshift({
    text: value,
    done: false
  });

  $("taskInput").value = "";

  saveTasks();
});

renderTasks();

// ======================================
// CHAT MESSAGES
// ======================================

function addMessage(text, type) {
  const message = document.createElement("div");

  message.className = "message " + type;

  message.textContent = text;

  $("chatBox").appendChild(message);

  $("chatBox").scrollTop =
    $("chatBox").scrollHeight;
}

// ======================================
// VOICE REPLY
// ======================================

function speakReply(text) {
  if (!$("voiceReply").checked) return;

  if (!("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(text);

  speech.lang = "en-IN";

  speech.rate = 1;

  speech.pitch = 1;

  window.speechSynthesis.speak(speech);
}

// ======================================
// ASSISTANT REPLY
// ======================================

function getReply(message) {
  const lower = message.toLowerCase();

  let reply =
    "I'm running in offline demo mode. Real AI connection will be added later.";

  if (
    lower.includes("hello") ||
    lower.includes("hi") ||
    lower.includes("namaste")
  ) {
    reply = "Hello! Welcome to SmartDesk. How can I help you?";
  }

  else if (lower.includes("your name")) {
    reply = "I'm SmartDesk, your personal assistant.";
  }

  else if (lower.includes("time")) {
    reply =
      "Your current time is " +
      new Date().toLocaleTimeString("en-IN");
  }

  else if (lower.includes("date")) {
    reply =
      "Today's date is " +
      new Date().toLocaleDateString("en-IN");
  }

  else if (lower.includes("note")) {
    reply = "Open My Notes to save your ideas.";
  }

  else if (lower.includes("task")) {
    reply = "Open My Tasks to organize your work.";
  }

  else if (lower.includes("help")) {
    reply =
      "I can tell you the date and time and guide you to your Notes and Tasks.";
  }

  else if (lower.includes("thank")) {
    reply = "You're welcome! I'm always ready to help.";
  }

  return reply;
}

// ======================================
// SEND MESSAGE
// ======================================

function sendMessage(message) {
  if (!message.trim()) return;

  addMessage(message, "user");

  const reply = getReply(message);

  setTimeout(() => {
    addMessage(reply, "bot");

    speakReply(reply);
  }, 300);
}

$("chatForm").addEventListener("submit", event => {
  event.preventDefault();

  const input = $("chatInput");

  const message = input.value.trim();

  if (!message) return;

  input.value = "";

  sendMessage(message);
});

// ======================================
// VOICE RECOGNITION
// ======================================

const SpeechRecognition =
  window.SpeechRecognition ||
  window.webkitSpeechRecognition;

let recognition = null;

let listening = false;

if (SpeechRecognition) {

  recognition = new SpeechRecognition();

  recognition.lang = "en-IN";

  recognition.continuous = false;

  recognition.interimResults = false;

  recognition.onstart = () => {
    listening = true;

    $("micBtn").classList.add("listening");

    $("voiceStatus").textContent =
      "Listening... Speak now";
  };

  recognition.onresult = event => {
    const spokenText =
      event.results[0][0].transcript.trim();

    if (!spokenText) return;

    $("chatInput").value = spokenText;

    sendMessage(spokenText);
  };

  recognition.onerror = event => {
    listening = false;

    $("micBtn").classList.remove("listening");

    $("voiceStatus").textContent =
      "Voice error: " + event.error;
  };

  recognition.onend = () => {
    listening = false;

    $("micBtn").classList.remove("listening");

    if (
      $("voiceStatus").textContent ===
      "Listening... Speak now"
    ) {
      $("voiceStatus").textContent =
        "Tap microphone to speak";
    }
  };

} else {

  $("micBtn").disabled = true;

  $("voiceStatus").textContent =
    "Voice recognition is not supported in this browser.";
}

// MICROPHONE BUTTON

$("micBtn").addEventListener("click", () => {

  if (!recognition) {
    alert(
      "Please use a supported browser such as Chrome."
    );

    return;
  }

  if (listening) {
    recognition.stop();

    return;
  }

  $("voiceStatus").textContent =
    "Starting microphone...";

  try {
    recognition.start();
  } catch (error) {
    $("voiceStatus").textContent =
      "Please try again.";
  }

});

// ======================================
// CLEAR DATA
// ======================================

$("clearData").addEventListener("click", () => {

  const confirmed = confirm(
    "Are you sure you want to delete all notes and tasks?"
  );

  if (!confirmed) return;

  notes = [];

  tasks = [];

  localStorage.removeItem("smartdesk_notes");

  localStorage.removeItem("smartdesk_tasks");

  renderNotes();

  renderTasks();

  alert("Notes and tasks cleared.");

});

// ======================================
// PWA INSTALLATION
// ======================================

let installPrompt = null;

window.addEventListener("beforeinstallprompt", event => {

  event.preventDefault();

  installPrompt = event;

  $("installBtn").textContent = "Install Now";

});

$("installBtn").addEventListener("click", async () => {

  if (!installPrompt) {

    alert(
      "Open SmartDesk using Chrome HTTPS hosting, then use browser menu > Install app or Add to Home screen."
    );

    return;
  }

  installPrompt.prompt();

  await installPrompt.userChoice;

  installPrompt = null;

});

// ======================================
// SERVICE WORKER
// ======================================

if (
  "serviceWorker" in navigator &&
  location.protocol.startsWith("http")
) {

  window.addEventListener("load", () => {

    navigator.serviceWorker
      .register("./sw.js")
      .catch(error => {
        console.log(
          "Service worker error:",
          error
        );
      });

  });

}