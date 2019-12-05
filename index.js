// Import stylesheets
// https://5dbc736530411e0014f26e5f.mockapi.io/api/tasks
import "./style.scss";
import { HttpService } from "./HttpService.js";

var TodoList = (function(HttpService) {
  var btnCreateTask = document.getElementById("btnCreateTask");
  var todoList = document.querySelector(".todo-list");
  var taskInput = document.getElementById("taskTitle");

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

  var loadTasksAPI = function() {
    return HttpService.get();
  };

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
        } else {
          taskElement.classList.remove("completed");
        }
        taskElement.dataset.done = data.done;
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
      updateTask(taskElement).then(function(data) {
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

  var createTask = function(event) {
    event.preventDefault();

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

  var updateTask = function(itemElement) {
    var editItem = {
      title: itemElement.dataset.value
    };
    var newValue = itemElement.querySelector("input").value;

    // quebrar removendo a atribuição
    editItem.title = updateValue(editItem.title, newValue);
    return HttpService.put(editItem, itemElement.dataset.id);
  };

  var updateValue = function(field, newValue) {
    field = newValue;
    // quebrar removendo o retorno
    return field;
  };

  var appendItem = function(item) {
    var newItem = TodoList.ItemFactory.get(item.id, item.title, item.done);
    newItem
      .getElementsByClassName("js-toggle-complete")[0]
      .addEventListener("click", toggleComplete);

    newItem
      .getElementsByClassName("js-edit")[0]
      .addEventListener("click", toggleEditField);

    todoList.appendChild(newItem);
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

    return newListItem;
  };

  return {
    get: generateListItem
  };
})();

(function(TodoList) {
  TodoList.init();
})(TodoList);
