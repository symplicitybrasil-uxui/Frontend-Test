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

  // Usar o put??
  var put = function(object, id) {
    return fetch(API_URL + `/${id}`, {
      headers: { "Content-Type": "application/json; charset=utf-8" },
      method: "PUT",
      body: JSON.stringify(object)
    }).then(function(response) {
      switch (response.status) {
        case 200:
          return response.json();
      }
    });
  };

  return {
    get: get,
    post: post,
    put: put
  };
})();

var TodoList = (function(HttpService) {
  var btnCreateTask = document.getElementById("btnCreateTask");
  var todoList = document.querySelector(".todo-list");

  var loadTasksAPI = function() {
    return HttpService.get();
  };

  var appendItem = function(item) {
    var newItem = TodoList.ItemFactory.get(item.id, item.title, item.done);
    todoList.appendChild(newItem);
  };

  var initList = function() {
    loadTasksAPI()
      .then(function(tasks) {
        tasks.forEach(function(currentTask) {
          appendItem(currentTask);
        });
      })
      .catch(function(error) {
        // TODO - Handle API request error.
      });

    btnCreateTask.addEventListener("click", createTask, false);
  };
  return {
    init: initList
  };
})(HttpService);

TodoList.ItemFactory = (function() {
  var generateListItem = function(id, title, done) {
    var newListItem = document.createElement("li");
    newListItem.dataset.id = id;
    newListItem.dataset.done = done == true;
    newListItem.dataset.value = title;

    newListItem.classList.add("todo-task");

    if (done) {
      newListItem.classList.add("completed");
    }

    newListItem.innerHTML = `
      <button class="js-toggle-complete"><i class="fas fa-check-circle"></i></button>
      <span class="task-title">${title}</span>
      <input type="text" class="edit-field" value="${title}"></input>
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

    console.log(newListItem);

    return newListItem;
  };

  return {
    get: generateListItem
  };
})();

var toggleComplete = function(event) {
  var taskElement = event.currentTarget.closest("li"),
    isTaskDone = taskElement.dataset.done == "true",
    taskId = taskElement.dataset.id,
    btnEdit = taskElement.querySelector(".btn-edit"),
    editObject = { done: !isTaskDone };

  HttpService.put(editObject, taskId)
    .then(function(data) {
      if (data.done) {
        taskElement.classList.add("completed");
        btnEdit.style.display = "none";
      } else {
        taskElement.classList.remove("completed");
        btnEdit.style.display = "inline-block";
      }
      taskElement.dataset.done = data.done;
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
  var taskElement = event.currentTarget.closest("li");
  var taskTitle = taskElement.querySelector(".task-title");
  var editField = taskElement.querySelector("input");
  var editIcon = taskElement.querySelector(".btn-edit > i");
  var isSaveOperation = taskTitle.style.display === "none";

  if (isSaveOperation) {
    editTask(taskElement).then(function(data) {
      taskTitle.innerHTML = data.title;
      editIcon.classList.add("fa-edit");
      editIcon.classList.remove("fa-save");

      taskTitle.style.display = "flex";

      editField.style.display = "none";
    });
  } else {
    taskTitle.style.display = "none";

    editField.style.display = "inline-block";
    editField.focus();

    editIcon.classList.add("fa-save");
    editIcon.classList.remove("fa-edit");
  }
};

var editTask = function(itemElement) {
  var editItem = {
    title: itemElement.dataset.value
  };
  var newValue = itemElement.querySelector("input").value;

  // quebrar removendo a atribuição
  editItem.title = editTaskValue(editItem.title, newValue);
  return HttpService.put(editItem, itemElement.dataset.id);
};

var editTaskValue = function(field, newValue) {
  field = newValue;
  // quebrar removendo o retorno
  return field;
};


(function(TodoList) {
  TodoList.init();
})(TodoList);
