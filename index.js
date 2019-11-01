// Import stylesheets
// https://5dbc736530411e0014f26e5f.mockapi.io/api/tasks
import "./style.css";

var API_URL = "https://5dbc736530411e0014f26e5f.mockapi.io/api/tasks";
var btnCreateTask = document.getElementById("btnCreateTask");
var toggleColorsItems = document.querySelectorAll(".js-toggle-color");
var toggleCompleteItems = document.querySelectorAll(".js-toggle-complete");
var todoList = document.querySelector(".todo-list");

var toggleColor = function(event) {
  event.preventDefault();
  var color = event.currentTarget.dataset.color;
  var nearestTask = event.currentTarget.closest("li");
  var is_active = nearestTask.classList.contains(color);

  nearestTask.classList.remove("blue", "green", "red");
  nearestTask.style.color = "#000000";

  if (!is_active) {
    nearestTask.style.color = "#ffffff";
    nearestTask.classList.add(color);
  }
};

// TODO - Mark task as done at the API.
var toggleComplete = function(event) {
  var isTaskDone = event.currentTarget.dataset.done;
  var taskId = event.currentTarget.dataset.id;
  var nearestTask = event.currentTarget.closest("li");
  var is_complete = nearestTask.classList.contains("completed");

  fetch(API_URL + `/${taskId}`, {
    method: "PUT",
     headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ "done": !isTaskDone })
  })
    .then(function(response) {
      switch (response.status) {
        case 200:
          console.log(response);
          break;
      }
    })
    .catch(function(error) {
      // TODO - Handle adding new errors.
      console.log(error);
    });

  nearestTask.classList.remove("completed");

  if (!is_complete) {
    nearestTask.classList.add("completed");
  }
};

var removeTask = function(event) {
  event.preventDefault();
  var taskId = event.currentTarget.dataset.id;
  var nearestTask = event.currentTarget.closest("li");

  fetch(API_URL + `/${taskId}`, {
    method: "DELETE"
  })
    .then(function(response) {
      switch (response.status) {
        case 200:
          nearestTask.remove();
          break;
      }
    })
    .catch(function(error) {
      // TODO - Handle adding new errors.
      console.log(error);
    });
};

var createTask = function(event) {
  event.preventDefault();
  var taskInput = document.getElementById("taskTitle");
  var newItem = {
    title: taskInput.value,
    done: false,
    color: ""
  };

  fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(newItem)
  })
    .then(function(response) {
      switch (response.status) {
        case 201:
          return response.json();
      }
    })
    .then(function(newTask) {
      var newTaskElement = appendItem(newTask);
      newTaskElement.focus();
    })
    .catch(function(error) {
      // TODO - Handle adding new errors.
      console.log(error);
    });
};

var appendItem = function(item) {
  var newTask = generateListItem(item);
  todoList.appendChild(newTask);
  return newTask;
};

var generateListItem = function(item) {
  var newListItem = document.createElement("li");
  newListItem.innerHTML = `
      <span class="task-title">${item.id} - ${item.title}</span>
      <div class="toggle-color-box">
        <button class="js-toggle-color" data-color="blue">Blue</button>
        <button class="js-toggle-color" data-color="green">Green</button>
        <button class="js-toggle-color" data-color="red">Red</button>
      </div>
      <div class="actions">
        <button class="js-toggle-complete" data-id="${item.id}" data-done="0"><i class="fas fa-check"></i></button>
        <button class="js-remove btn-remove" data-id="${item.id}"><i class="fas fa-trash"></i></button>
      </div>
    `;
  newListItem
    .getElementsByClassName("js-toggle-complete")[0]
    .addEventListener("click", toggleComplete);

  newListItem
    .getElementsByClassName("js-remove")[0]
    .addEventListener("click", removeTask);

  var colorButtons = newListItem.getElementsByClassName("js-toggle-color");
  Array.from(colorButtons).forEach(function(current) {
    current.addEventListener("click", toggleColor);
  });

  if (item.done) newListItem.classList.add("completed");

  if (item.color) newListItem.classList.add(item.color);

  newListItem.classList.add("todo-task");
  newListItem.setAttribute("tabindex", -1);
  return newListItem;
};

var loadTasksAPI = function() {
  return fetch(API_URL)
    .then(function(response) {
      switch (response.status) {
        case 200:
          return response.json();
      }
    })
    .then(function(tasks) {
      tasks.forEach(function(currentTask) {
        appendItem(currentTask);
      });
    })
    .catch(function(error) {
      // TODO - Handle API request error.
    });
};

btnCreateTask.addEventListener("click", createTask, false);

(function() {
  loadTasksAPI();
})();
