// Import stylesheets
// https://5dbc736530411e0014f26e5f.mockapi.io/api/tasks
import "./style.css";

var HttpService = (function() {
  var API_URL = "https://5dbc736530411e0014f26e5f.mockapi.io/api/tasks";

  var get = function() {
    return fetch(API_URL).then(function(response) {
      switch (response.status) {
        case 200:
          return response.json();
      }
    });
  };

  // Remover o post. Mover fetch para dentro da função que invoca
  var post = function(object) {
    return fetch(API_URL, {
      headers: { "Content-Type": "application/json; charset=utf-8" },
      method: "POST",
      body: JSON.stringify(object)
    }).then(function(response) {
      switch (response.status) {
        case 201:
          return response.json();
          break;
      }
    });
  };

  return {
    get: get,
    post: post
  };
})();

// var API_URL = "https://5dbc736530411e0014f26e5f.mockapi.io/api/tasks";
var btnCreateTask = document.getElementById("btnCreateTask");
var todoList = document.querySelector(".todo-list");

// TODO - Mark task as done at the API.
var toggleComplete = function(event) {
  var nearestTask = event.currentTarget.closest("li");
  var isTaskDone = nearestTask.dataset.done == "true";
  var taskId = nearestTask.dataset.id;
  var btnEdit = nearestTask.querySelector(".btn-edit");

  fetch(API_URL + `/${taskId}`, {
    headers: { "Content-Type": "application/json; charset=utf-8" },
    method: "PUT",
    body: JSON.stringify({ done: !isTaskDone })
  })
    .then(function(response) {
      switch (response.status) {
        case 200:
          return response.json();
          break;
      }
    })
    .then(function(data) {
      if (data.done) {
        nearestTask.classList.add("completed");
        btnEdit.style.display = "none";
      } else {
        nearestTask.classList.remove("completed");
        btnEdit.style.display = "inline-block";
      }
      nearestTask.dataset.done = data.done;
    })
    .catch(function(error) {
      // TODO - Handle adding new errors.
      console.log(error);
    });
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
    done: false
  };
  HttpService.post(newItem)
    .then(function(newTask) {
      appendItem(newTask);
      taskInput.value = "";
      taskInput.focus();
    })
    .catch(function(error) {
      // TODO - Handle adding new errors.
      console.log(error);
    });
};

var toggleEditField = function(event) {
  var nearestTask = event.currentTarget.closest("li");
  var taskTitle = nearestTask.getElementsByClassName("task-title")[0];
  var editField = nearestTask.getElementsByClassName("edit-field")[0];
  var icon = nearestTask.getElementsByClassName("fas")[1];

  if (taskTitle.style.display === "none") {
    editTask(nearestTask)
      .then(function(response) {
        switch (response.status) {
          case 200:
            return response.json();
        }
      })
      .then(function(data) {
        taskTitle.innerHTML = data.title;
        icon.classList.add("fa-edit");
        icon.classList.remove("fa-save");

        taskTitle.style.display = "flex";

        editField.style.display = "none";
      });
  } else {
    taskTitle.style.display = "none";

    editField.style.display = "inline-block";
    editField.focus();

    icon.classList.add("fa-save");
    icon.classList.remove("fa-edit");
  }
};

var editTask = function(itemElement) {
  var editItem = {
    id: itemElement.dataset.id,
    title: itemElement.dataset.value
  };
  var newValue = itemElement.querySelector("input").value;

  // quebrar removendo a atribuição
  editItem.title = editTaskValue(editItem.title, newValue);

  return fetch(API_URL + `/${editItem.id}`, {
    headers: { "Content-Type": "application/json; charset=utf-8" },
    method: "PUT",
    body: JSON.stringify(editItem)
  });
};

var editTaskValue = function(field, newValue) {
  field = newValue;
  // quebrar removendo o retorno
  return field;
};

var appendItem = function(item) {
  var newTask = generateListItem(item);
  todoList.appendChild(newTask);
};

var generateListItem = function(item) {
  var newListItem = document.createElement("li");

  newListItem.dataset.id = item.id;
  newListItem.dataset.done = item.done == true;
  newListItem.dataset.value = item.title;

  newListItem.classList.add("todo-task");
  newListItem.setAttribute("tabindex", -1);

  if (item.done) {
    newListItem.classList.add("completed");
  }

  newListItem.innerHTML = `
      <button class="js-toggle-complete"><i class="fas fa-check-circle"></i></button>
      <span class="task-title">${item.title}</span>
      <input type="text" class="edit-field" value="${item.title}"></input>
      <div class="actions">
        <button class="js-edit btn-edit"><i class="fas fa-edit"></i></button>
      </div>
    `;
  newListItem
    .getElementsByClassName("js-toggle-complete")[0]
    .addEventListener("click", toggleComplete);

  newListItem
    .getElementsByClassName("js-edit")[0]
    .addEventListener("click", toggleEditField);

  return newListItem;
};

var loadTasksAPI = function() {
  HttpService.get()
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
