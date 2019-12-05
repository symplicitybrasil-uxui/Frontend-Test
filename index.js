import "./style.scss";
import { HttpService } from "./HttpService.js";

/**
 * Main Module to control TodoList functionality
 * Note: Uses HttpService as a dependency
 */
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
        // Do nothing, if you want to debug, uncomment console.log.
        // console.log(error);
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
        // Add completed class when task is completed
        taskElement.dataset.done = data.done;
      })
      .catch(function(error) {
        // Do nothing, if you want to debug, uncomment console.log.
        // console.log(error);
      });
  };

  var toggleEditField = function(event) {
    var taskElement = event.currentTarget.closest("li");
    var taskTitle = taskElement.querySelector(".task-title");
    var editField = taskElement.querySelector("input");
    var editIcon = taskElement.querySelector(".btn-edit > i");
    var isSaveOperation = taskTitle.style.display === "none";

    // Update task view based on isSaveOperation result
    /* Tips: 
     * .fa-edit is used on the edit icon
     * .fa-save is used on the save icon
     * data.title holds the updated value from API
    */
    if (isSaveOperation) {
      updateTask(taskElement).then(function(data) {
        // do something
      });
    } else {
      editField.focus();
    }
  };

  var createTask = function(event) {
    event.preventDefault();

    var newItem = {
      title: taskInput.value,
      done: false
    };
    fetch(API_URL, {
      headers: { "Content-Type": "application/json; charset=utf-8" },
      method: "POST",
      body: JSON.stringify(newItem)
    })
      .then(function(response) {
        switch (response.status) {
          case 201:
            return response.json();
            break;
        }
      })
      .then(function(newTask) {
        appendItem(newTask);
        taskInput.value = "";
        taskInput.focus();
      })
      .catch(function(error) {
        // Do nothing, if you want to debug, uncomment console.log.
        // console.log(error);
      });

      // Implement loading screen overlay for this.
  };

  var updateTask = function(itemElement) {
    var editItem = {
      title: itemElement.dataset.value
    };
    var newValue = itemElement.querySelector("input").value;

    updateValue(editItem.title, newValue);
    return HttpService.put(editItem, itemElement.dataset.id);
  };

  var updateValue = function(field, newValue) {
    field = newValue;
  };

  var appendItem = function(item) {
    var newItem = TodoList.ItemFactory.get(item.id, item.title, item.done);
    
    // Add event to ".js-toggle-complete" hook, use toggleComplete function.
    // Add event to ".js-edit" hook, use toggleEdit function.

    todoList.appendChild(newItem);
  };

  return {
    init: initList
  };
})();

TodoList.ItemFactory = (function() {
  var generateListItem = function(id, title, done) {
    var newListItem = document.createElement("div");
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
