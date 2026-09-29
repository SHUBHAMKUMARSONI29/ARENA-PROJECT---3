
"use strict";

// ---------- Reusable DOM helpers ----------
const $ = (selector) => document.querySelector(selector);

function setText(selector, text) {
  const element = $(selector);
  if (element) element.textContent = text;
}

// ---------- Footer year ----------
setText("#year", new Date().getFullYear());

// ---------- Dark / light mode with Local Storage ----------
const themeBtn = $("#themeBtn");

function applyTheme(isDark) {
  document.body.classList.toggle("dark-mode", isDark);
  themeBtn.textContent = isDark ? "☀️ Light" : "🌙 Dark";
  themeBtn.setAttribute(
    "aria-label",
    isDark ? "Switch to light mode" : "Switch to dark mode"
  );
}

let savedTheme = null;

try {
  savedTheme = localStorage.getItem("portfolioTheme");
} catch (error) {
  console.warn("Theme preference storage is unavailable.");
}

applyTheme(savedTheme === "dark");

themeBtn.addEventListener("click", () => {
  const isDark = !document.body.classList.contains("dark-mode");
  applyTheme(isDark);

  try {
    localStorage.setItem("portfolioTheme", isDark ? "dark" : "light");
  } catch (error) {
    console.warn("Could not save theme preference.");
  }
});

// ---------- Mobile navigation ----------
const menuBtn = $("#menuBtn");
const navLinks = $("#navLinks");

menuBtn.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", String(isOpen));
  menuBtn.textContent = isOpen ? "✕" : "☰";
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.textContent = "☰";
  });
});

// ---------- Show / hide About content ----------
const aboutBtn = $("#aboutBtn");
const extraAbout = $("#extraAbout");

aboutBtn.addEventListener("click", () => {
  const isHidden = extraAbout.classList.toggle("hidden");
  aboutBtn.textContent = isHidden ? "Read More" : "Read Less";
});

// ---------- Dynamic role text ----------
const roles = [
  "Web Developer",
  "Computer Science Student",
  "Problem Solver"
];

let roleIndex = 0;

function changeRole() {
  roleIndex = (roleIndex + 1) % roles.length;
  setText("#roleText", roles[roleIndex]);
}

// Change the role when the heading is clicked.
$("#roleText").addEventListener("click", changeRole);
$("#roleText").style.cursor = "pointer";
$("#roleText").title = "Click to change role";

// ---------- Interactive project slider ----------
const projects = [
  {
    icon: "💬",
    title: "Mesh Network Chat App",
    description:
      "A project concept for device-to-device messaging without relying on a traditional internet connection."
  },
  {
    icon: "🚑",
    title: "MediRoute AI",
    description:
      "An emergency response platform concept for finding nearby hospitals and planning routes using available data."
  },
  {
    icon: "🔥",
    title: "FIREWATCH AI",
    description:
      "A project concept for identifying and classifying industrial fire signals using satellite data and map information."
  }
];

let currentSlide = 0;

function showSlide(index) {
  currentSlide = (index + projects.length) % projects.length;
  const project = projects[currentSlide];

  setText("#slideArt", project.icon);
  setText("#slideTitle", project.title);
  setText("#slideDescription", project.description);
  setText("#slideCount", `Project ${currentSlide + 1} of ${projects.length}`);

  document.querySelectorAll(".dot").forEach((dot, i) => {
    dot.classList.toggle("active", i === currentSlide);
    dot.setAttribute("aria-pressed", String(i === currentSlide));
  });
}

$("#prevSlide").addEventListener("click", () => {
  showSlide(currentSlide - 1);
});

$("#nextSlide").addEventListener("click", () => {
  showSlide(currentSlide + 1);
});

document.querySelectorAll(".dot").forEach((dot) => {
  dot.addEventListener("click", () => {
    showSlide(Number(dot.dataset.slide));
  });
});

showSlide(0);

// ---------- To-do list with Local Storage ----------
const todoForm = $("#todoForm");
const todoInput = $("#todoInput");
const todoList = $("#todoList");
const todoStatus = $("#todoStatus");

let tasks = [];
let nextTaskId = 1;

try {
  const storedTasks = localStorage.getItem("portfolioTasks");

  if (storedTasks) {
    const parsedTasks = JSON.parse(storedTasks);

    if (Array.isArray(parsedTasks)) {
      tasks = parsedTasks
        .filter(
          (task) =>
            task &&
            typeof task.text === "string" &&
            typeof task.done === "boolean"
        )
        .map((task) => ({
          id: nextTaskId++,
          text: task.text.slice(0, 100),
          done: task.done
        }));
    }
  }
} catch (error) {
  console.warn("Could not load saved tasks.");
}

function saveTasks() {
  try {
    localStorage.setItem(
      "portfolioTasks",
      JSON.stringify(tasks.map(({ text, done }) => ({ text, done })))
    );
  } catch (error) {
    todoStatus.textContent = "Tasks could not be saved on this device.";
  }
}

function updateTaskCount() {
  const remaining = tasks.filter((task) => !task.done).length;
  const total = tasks.length;

  setText(
    "#taskCount",
    `${remaining} task${remaining !== 1 ? "s" : ""} remaining · ${total} total`
  );
}

function renderTasks() {
  // Remove old elements before rendering the current list.
  todoList.replaceChildren();

  tasks.forEach((task) => {
    const li = document.createElement("li");

    const label = document.createElement("label");
    label.className = "todo-task";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.setAttribute("aria-label", `Complete ${task.text}`);

    const text = document.createElement("span");
    text.textContent = task.text;

    if (task.done) {
      label.classList.add("completed");
    }

    checkbox.addEventListener("change", () => {
      task.done = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    label.append(checkbox, text);

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Remove";
    deleteBtn.setAttribute("aria-label", `Remove ${task.text}`);

    deleteBtn.addEventListener("click", () => {
      tasks = tasks.filter((item) => item.id !== task.id);
      saveTasks();
      renderTasks();
      setText("#todoStatus", "Task removed.");
    });

    li.append(label, deleteBtn);
    todoList.append(li);
  });

  updateTaskCount();
}

todoForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = todoInput.value.trim();

  if (!text) {
    setText("#todoStatus", "Please enter a task.");
    return;
  }

  tasks.push({
    id: nextTaskId++,
    text: text.slice(0, 100),
    done: false
  });

  saveTasks();
  renderTasks();
  todoInput.value = "";
  todoInput.focus();
  setText("#todoStatus", "Task added successfully.");
});

renderTasks();

// ---------- Contact form validation ----------
const contactForm = $("#contactForm");
const nameInput = $("#name");
const emailInput = $("#email");
const messageInput = $("#message");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function showError(field, message) {
  setText(`#${field}Error`, message);

  const input = $(`#${field}`);
  input.setAttribute("aria-invalid", message ? "true" : "false");
}

function validateName() {
  const value = nameInput.value.trim();

  if (value.length < 2) {
    showError("name", "Name must contain at least 2 characters.");
    return false;
  }

  showError("name", "");
  return true;
}

function validateEmail() {
  const value = emailInput.value.trim();

  if (!emailPattern.test(value)) {
    showError("email", "Please enter a valid email address.");
    return false;
  }

  showError("email", "");
  return true;
}

function validateMessage() {
  const value = messageInput.value.trim();

  if (value.length < 10) {
    showError("message", "Message must be at least 10 characters.");
    return false;
  }

  showError("message", "");
  return true;
}

// Live character counter.
function updateCharacterCount() {
  setText("#charCount", `${messageInput.value.length} / 1000`);
}

messageInput.addEventListener("input", () => {
  updateCharacterCount();

  if (messageInput.value.trim().length >= 10) {
    showError("message", "");
  }
});

nameInput.addEventListener("input", () => {
  if (nameInput.value.trim().length >= 2) {
    showError("name", "");
  }
});

emailInput.addEventListener("input", () => {
  if (emailPattern.test(emailInput.value.trim())) {
    showError("email", "");
  }
});

function validateForm(event) {
  event.preventDefault();
  setText("#formStatus", "");

  const isNameValid = validateName();
  const isEmailValid = validateEmail();
  const isMessageValid = validateMessage();

  if (!isNameValid || !isEmailValid || !isMessageValid) {
    setText("#formStatus", "Please correct the errors above.");

    if (!isNameValid) {
      nameInput.focus();
    } else if (!isEmailValid) {
      emailInput.focus();
    } else {
      messageInput.focus();
    }

    return;
  }

  // The form is validated, but no backend or email service is connected.
  setText(
    "#formStatus",
    "Validation successful! Your message is ready. This demo does not send or store messages."
  );

  const subject = encodeURIComponent(
    `Portfolio message from ${nameInput.value.trim()}`
  );

  const body = encodeURIComponent(
    `Name: ${nameInput.value.trim()}\n` +
    `Email: ${emailInput.value.trim()}\n\n` +
    `Message:\n${messageInput.value.trim()}`
  );

  // Opens the visitor's default email application for sending.
  const mailtoLink =
    `mailto:?subject=${subject}&body=${body}`;

  const openEmailBtn = document.createElement("a");
  openEmailBtn.href = mailtoLink;
  openEmailBtn.className = "btn secondary";
  openEmailBtn.textContent = "Open Email App to Send";
  openEmailBtn.style.marginTop = "12px";

  const oldLink = $("#emailAction");
  if (oldLink) oldLink.remove();

  openEmailBtn.id = "emailAction";
  $("#formStatus").after(openEmailBtn);
}

contactForm.addEventListener("submit", validateForm);

updateCharacterCount();

console.log("Interactive portfolio JavaScript loaded successfully!");
