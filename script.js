// ------- State -------
let todos = [];
let currentFilter = "all";

const STORAGE_KEY = "my_todo_list";

// ------- DOM Elements -------
const todoForm = document.getElementById("todo-form");
const todoInput = document.getElementById("todo-input");
const todoList = document.getElementById("todo-list");
const itemsLeft = document.getElementById("items-left");
const taskCountBadge = document.getElementById("task-count-badge");
const filterButtons = document.querySelectorAll(".filter-btn");

// ------- Load + Save to Local Storage -------
function loadTodos() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      todos = JSON.parse(stored);
    } catch (e) {
      console.error("Error parsing todos from storage", e);
      todos = [];
    }
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// ------- Rendering -------
function renderTodos() {
  todoList.innerHTML = "";

  const filteredTodos = todos.filter((todo) => {
    if (currentFilter === "active") return !todo.completed;
    if (currentFilter === "completed") return todo.completed;
    return true; // all
  });

  filteredTodos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "todo-item";
    li.dataset.id = todo.id;

    li.innerHTML = `
      <div class="left">
        <input
          type="checkbox"
          class="todo-checkbox"
          ${todo.completed ? "checked" : ""}
        />
        <span class="todo-text ${todo.completed ? "completed" : ""}">
          ${escapeHtml(todo.text)}
        </span>
      </div>
      <button class="delete-btn" title="Delete task">&times;</button>
    `;

    todoList.appendChild(li);
  });

  updateCounts();
}

function updateCounts() {
  const total = todos.length;
  const activeCount = todos.filter((t) => !t.completed).length;

  itemsLeft.textContent =
    activeCount === 1 ? "1 item left" : activeCount + " items left";

  taskCountBadge.textContent =
    total === 1 ? "1 task" : total + " tasks";
}

// ------- Helpers -------
function addTodo(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  const newTodo = {
    id: Date.now().toString(),
    text: trimmed,
    completed: false,
  };

  todos.unshift(newTodo);
  saveTodos();
  renderTodos();
}

function toggleTodo(id) {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  saveTodos();
  renderTodos();
}

function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos();
  renderTodos();
}

// Escape HTML to avoid issues if user types < or >
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ------- Event Listeners -------
// Add new task (form submit)
todoForm.addEventListener("submit", function (e) {
  e.preventDefault();
  addTodo(todoInput.value);
  todoInput.value = "";
  todoInput.focus();
});

// Toggle / delete using event delegation
todoList.addEventListener("click", function (e) {
  const li = e.target.closest(".todo-item");
  if (!li) return;
  const id = li.dataset.id;

  if (e.target.classList.contains("todo-checkbox")) {
    toggleTodo(id);
  } else if (e.target.classList.contains("delete-btn")) {
    deleteTodo(id);
  }
});

// Filter buttons
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;

    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    renderTodos();
  });
});

// ------- Init -------
loadTodos();
renderTodos();
