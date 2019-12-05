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

  /**
   * Initializates list getting data from API 
   * and attaches events
   */
  var initList = function() {
    loadTasksAPI()
      .then(function(tasks) {
        tasks.forEach(function(currentTask) {
          appendItem(currentTask);
        });
      })
      .catch(function(error) {
        // Do nothing, if you want to debug, uncomment console.log.
       console.log(error);
      });

    btnCreateTask.addEventListener("click", createTask, false);
  };

  /**
   * Access API to load pre-defined tasks
   */
  var loadTasksAPI = function() {
    return HttpService.get();
  };

  /**
   * Capture the event to mark and unmark a task
   * as complete
   */
  var toggleComplete = function(event) {
    var taskElement = event.currentTarget.closest("li"),
      isTaskDone = taskElement.dataset.done == "true",
      taskId = taskElement.dataset.id,
      btnEdit = taskElement.querySelector(".btn-edit"),
      editObject = { done: !isTaskDone };

    HttpService.put(editObject, taskId)
      .then(function(data) {
        // Add or remove `completed` class based on current status
      
        if(data.done){
          taskElement.classList.add('completed')
           
        }else{
          taskElement.classList.remove('completed')
        }
        taskElement.dataset.done = data.done;
      })
      .catch(function(error) {
        // Do nothing, if you want to debug, uncomment console.log.
        // console.log(error);
      });
  };

  /**
   * Capture the event to update the interface based
   * on the current edit state
   */
  var toggleEditField = function(event) {
    console.log('toggleEditField---')
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
      taskTitle.innerHTML = data.title;
      taskTitle.style.display ="flex";
      editField.style.display = "none";
      editIcon.classList.add('fa-edit');
      editIcon.classList.remove('fa-save');
      });
    } else {
      taskTitle.style.display ="none"
      editField.style.display = "block"
      editIcon.classList.add('fa-save');
      editIcon.classList.remove('fa-edit');

      editField.focus();

    }
  };

  /**
   * Capture the event to insert a new task 
   * and send it to the API
   */
  var createTask = function(event) {
    event.preventDefault();

    var newItem = {
      title: taskInput.value,
      done: false
    };
    HttpService.post(newItem).then(function(newTask) {
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

  /**
   * Use item data to update task title
   * and send it to the API
   */
  var updateTask = function(itemElement) {
    var editItem = {
      title: itemElement.dataset.value
    };
    var newValue = itemElement.querySelector("input").value;

    editItem.title = updateValue(editItem.title, newValue);
    return HttpService.put(editItem, itemElement.dataset.id);
  };

  /**
   * Update an item field with a new value
   */
  var updateValue = function(field, newValue) {
    field = newValue;
    return field;
  };

  /**
   * Appends a new item based created using factory and attach events 
   * needed
   */
  var appendItem = function(item) {
    var newItem = TodoList.ItemFactory.get(item.id, item.title, item.done);

      newItem.querySelector(".js-edit").addEventListener('click', toggleEditField, false);
      newItem.querySelector(".js-toggle-complete").addEventListener('click', toggleComplete, false);
    // Add event to ".js-toggle-complete" hook, use toggleComplete function.
    // Add event to ".js-edit" hook, use toggleEdit function.

    todoList.appendChild(newItem);
  };

  return {
    init: initList
  };
})(HttpService);

/**
 * Module used to create items dynamically to the list
 */
TodoList.ItemFactory = (function() {
  /**
   * Creates html elements to be appended to the list
   * and sets data on it
   */
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
