// Import stylesheets
// https://5dbc736530411e0014f26e5f.mockapi.io/api/tasks
import "./style.css";

var API_URL = "https://5dbc736530411e0014f26e5f.mockapi.io/api/tasks";
var btnCreateTask = document.getElementById("btnCreateTask");
var toggleColorsItems = document.querySelectorAll(".js-toggle-color");
var toggleCompleteItems = document.querySelectorAll(".js-toggle-complete");
var todoList = document.querySelector(".todo-list");

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
      <span class="task-title"> ${item.title}</span>
      <div class="actions">
        <a href="#" class="js-toggle-complete ${(item.done == true)?'done':''}" data-id="${item.id}" data-done="0"><i class="fas fa-check-circle"></i></a>
      </div>
    `;
  newListItem
    .getElementsByClassName("js-toggle-complete")[0]
    .addEventListener("click", toggleComplete);

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
