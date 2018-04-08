const express = require('express');
const User = require('../models/user');
const ToDo = require('../models/todos');

let todosList = {

  //A place to store todo list items
  todos: [],

  // A method to add todo items to todo list - takes one parameter:the text of the item to add to the list
  addTodos: function(todoText) {
    this.todos.push({
      todoText: todoText,
      completed: false
    });
  },

  // A method to change the text of an existing item in the todo list - takes two parameters: the position of the item to change, and the new text
  changeTodos: function(position, todoText) {
    this.todos[position].todoText = todoText;
    view.displayTodos(todosList.todos);
  },

  // A method to delete a todo item from the todo list - takes one parameter:the position of the item to delete
  deleteTodos: function(position) {
    this.todos.splice(position, 1);
    //If there are no todo items in the list, hide the toggle all icon
    if(this.todos.length === 0) {
      toggleAllIcon.style.display = 'none';
    }
    view.displayTodos(todosList.todos);
  },

  // A method to toggle a todo item to and from completed - takes one parameter:the position of the item to toggle
  toggleCompleted: function(position) {
    let todo = this.todos[position];
    //If todo.completed is true, make it false and vice versa
    todo.completed = !todo.completed;
    view.displayTodos(todosList.todos);
  },

  // A method to toggle all todo items in the list
  toggleAll: function() {
    let totalTodos = this.todos.length;
    let completedTodos = 0;

    //Get number of completed todos
    this.todos.forEach(function(todo) {
      if(todo.completed ===true) {
        completedTodos++;
      }
    });

    this.todos.forEach(function(todo) {
      //If everything is true, make everything false
      if(completedTodos === totalTodos) {
        todo.completed = false;
      //Otherwise, make everything true
      } else {
          todo.completed = true;
      }
    });
  view.displayTodos(todosList.todos);
  }
};


let view = {
  // A method to display the todo list - takes one parameter:the array to be displayed
    displayTodos: (array) => {
    let todosCompleted = view.todosCompleted();
    const todoUl = document.querySelector('#todoList');
    const todoListExtras = document.querySelector('#todoListExtras');
    //Reset todosListExtras and todoUl to be blank before building/rebuilding the display
    todoListExtras.innerHTML = '';
    todoUl.innerHTML = '';
    //Iterate over the array and create an 'li' for each item in the array
    array.forEach(function(todo, position) {
      let todoLi = document.createElement('li');
      let todoText = todo.todoText;
      let todoCompleted = todo.completed;
      let todoToggleIcon = view.createToggleIcon();
      let todoTextTag = document.createElement('p');
      todoLi.className = 'todoItem';
      todoLi.id = position;
      todoTextTag.textContent = todoText;

      //If the item has been completed (todo.completed = true), show the check image and draw a line through text
      if(todoCompleted === true) {
           todoToggleIcon.setAttribute('src', '../images/check-mark.svg');
           todoTextTag.style.color = '#999';
           todoTextTag.style.textDecoration = 'line-through';
        // Otherwise, show the empty circle image
        } else {
            todoToggleIcon.setAttribute('src', '../images/circle.svg');
          }

      todoLi.appendChild(todoToggleIcon);
      todoLi.appendChild(todoTextTag);
      todoLi.appendChild(view.createEditIcon());
      todoLi.appendChild(view.createDeleteButton());
      todoUl.appendChild(todoLi);
      // Call the event listeners method
      view.setupEventListeners();
    });

    //If there are todo items in the list, show the toggleAllIcon, the TallyCounter, and the TodosFilters
    if(array.length > 0) {
      const toggleAllIcon = document.querySelector('.toggleAllIcon');
      toggleAllIcon.style.display = 'block';
//      saveButton.style.display = 'block';
      view.createTallyCounter();
      view.createTodosFilters();
    }

    //If there are completed todo items in the list, show the clearCompletedLink
    if(todosCompleted > 0) {
      view.createClearCompletedLink();
    }
    localStorage.setItem('todoList', JSON.stringify(todosList.todos));
  },

  // A method to create the todoToggleIcon
  createToggleIcon: () => {
    let todoToggleIcon = document.createElement('img');
    todoToggleIcon.className = 'toggleIcon';
    return todoToggleIcon;
  },

  // A method to create the editIcon
  createEditIcon: () => {
    let editIcon = document.createElement('img');
    editIcon.setAttribute('src','../images/edit.svg');
    editIcon.className = 'editIcon';
    return editIcon;
  },

  // A method to create the editModal
  createEditModal: () => {
    let editModal = document.createElement('div');
    let editLink = document.createElement('span');
    let cancelLink = document.createElement('span');
    editModal.className = 'editModal';
    editLink.textContent = 'Change Todo /';
    editLink.id = 'editLink';
    cancelLink.textContent = 'Cancel';
    cancelLink.id = 'cancelLink';
    editModal.appendChild(editLink);
    editModal.appendChild(cancelLink);
    return editModal;
  },

  // A method to create the editModalEventListener
  createEditModalEventListener: (e) => {
     e.addEventListener('click', (event) => {
       let elementClicked = event.target;
       if(elementClicked.id === 'editLink') {
          //Show changeTodoModal
          let todoLi = elementClicked.parentNode.parentNode;
          todoLi.style.position = 'relative';
          todoLi.appendChild(view.createChangeTodoModal());
          let changeTodoModal = document.querySelector('.changeTodoModal');
          view.createChangeModalEventListener(changeTodoModal);
          elementClicked.parentNode.classList.remove('editModal');
          elementClicked.parentNode.innerHTML = '';
        } else {
        //Close editModal
          elementClicked.parentNode.classList.remove('editModal');
          elementClicked.parentNode.innerHTML = '';
        }
      });
  },

  // A method to create the changeTodoModal
  createChangeTodoModal: () => {
    let changeTodoModal = document.createElement('div');
    let changeTodoInput = document.createElement('input');
    let changeTodoButton = document.createElement('button');
    changeTodoModal.className = 'changeTodoModal';
    changeTodoInput.setAttribute('type', 'text');
    changeTodoInput.id = 'changeTodoInput';
    changeTodoButton.textContent = 'change';
    changeTodoButton.id = 'changeTodoButton';
    changeTodoModal.appendChild(changeTodoInput);
    changeTodoModal.appendChild(changeTodoButton);
    return changeTodoModal;
  },

  // A method to create the changeModalEventListener
  createChangeModalEventListener: (e) => {
      e.addEventListener('click', (event) => {
        let elementClicked = event.target;
        if(elementClicked.id === 'changeTodoButton') {
          let changeTodoInput = document.querySelector('#changeTodoInput');
          let todoText = changeTodoInput.value;
          let position = elementClicked.parentNode.parentNode.id;
          todosList.changeTodos(position, todoText);
          elementClicked.parentNode.classList.remove('changeTodoModal');
          elementClicked.parentNode.innerHTML = '';
        }
      });
  },

  // A method to create deleteButton
  createDeleteButton: () => {
    let deleteTodoButton = document.createElement('img');
    deleteTodoButton.setAttribute('src', '../images/delete-circle.svg');
    deleteTodoButton.className = 'deleteButton';
    return deleteTodoButton;
  },

  // A method to count the number of completed todos (todos.completed = true)
  todosCompleted: () => {
    let todosCompleted = 0;

      todosList.todos.forEach(function(todo){
        if(todo.completed === true){
          todosCompleted++;
        }
      });
    return todosCompleted;
  },

  // A method to create tallyCounter - counts the number of incomplete todo items
  createTallyCounter: () => {
    let tallyCounter = document.createElement('div');
    let todosNumber = parseInt(todosList.todos.length);
    let todosCompleted = view.todosCompleted();
    let p = document.createElement('p');
    tallyCounter.id = 'tallyCounter';
    // Total number of todo items minus completed todo items = incomplete todo items
    p.innerHTML = `${todosNumber - todosCompleted} items left`;
    tallyCounter.appendChild(p);
    todoListExtras.appendChild(tallyCounter);
  },

  // A method to create todosFilters
  createTodosFilters: () => {
   let todosFilters = document.createElement('ul');
   let filterAll = document.createElement('li');
   let filterActive = document.createElement('li');
   let filterCompleted = document.createElement('li');
   todosFilters.className = 'todosFilters';
   filterAll.id = 'filterAll';
   filterAll.textContent = 'All';
   filterActive.id = 'filterActive';
   filterActive.textContent = 'Active';
   filterCompleted.id = 'filterCompleted';
   filterCompleted.textContent = 'Completed';
   todosFilters.appendChild(filterAll);
   todosFilters.appendChild(filterActive);
   todosFilters.appendChild(filterCompleted);
   todoListExtras.appendChild(todosFilters);
  },

  // A method to create filterAll - show all todo items
  createFilterAll: () => {
    view.displayTodos(todosList.todos);
  },

  // A method to create filterActive - show only incomplete todo items
  createFilterActive: () => {
    let filterActive = todosList.todos.filter(function(todo) {
        return todo.completed === false;
    });
    view.displayTodos(filterActive);
  },

  // A method to create filterCompleted - show only completed todo items
  createFilterCompleted: () => {
    let filterCompleted = todosList.todos.filter(function(todo) {
        return todo.completed === true;
    });
   view.displayTodos(filterCompleted);
  },

  // A method to create clearCompletedLink
  createClearCompletedLink: () => {
    let clearCompletedLink = document.createElement('div');
    let p = document.createElement('p');
    p.id = 'clearCompletedLink';
    p.innerHTML = 'Clear Completed';
    clearCompletedLink.appendChild(p);
    todoListExtras.appendChild(clearCompletedLink);
  },

  // A method to create event listeners for addTodoButton, deleteButton, toggleIcon, editIcon, toggleAllIcon, clearCompletedLink and filters
  setUpEventListeners: (e) => {
    e.addEventListener('click', (event) => {
      let elementClicked = event.target;
      if(elementClicked.id === 'addToDoButton') {
         let addTodoTextInput = document.querySelector('#addTodoTextInput');
         todosList.addTodos(addTodoTextInput.value);
         addTodoTextInput.value = '';
         view.displayTodos(todosList.todos);

      } else if (elementClicked.id === 'todoList') {
          let elementClicked = event.target;
          let position = parseInt(elementClicked.parentNode.id);
          if(elementClicked.className === 'deleteButton') {
              todosList.deleteTodos(position);
          } else if (elementClicked.className === 'toggleIcon') {
              todosList.toggleCompleted(position);
          } else if (elementClicked.className === 'editIcon') {
                let todoLi = elementClicked.parentNode;
                todoLi.style.position = 'relative';
                todoLi.appendChild(view.createEditModal());
                let editModal = document.querySelector('.editModal');
                view.createEditModalEventListener(editModal);
          }

      } else if (elementClicked.id === 'toggleAllIcon') {
            todosList.toggleAll();

      } else if (elementClicked.id === 'todoListExtras') {
              let elementClicked = event.target;
              if(elementClicked.id === 'clearCompletedLink') {
                  todosList.todos.forEach(function(todo, position) {
                      if (todo.completed === true) {
                        todosList.deleteTodos(position);
                      }
                    });
               view.displayTodos(todosList.todos);
               } else if(elementClicked.id === 'filterAll') {
                      view.createFilterAll();
               } else if(elementClicked.id === 'filterActive') {
                      view.createFilterActive();
               } else if(elementClicked.id === 'filterCompleted') {
                      view.createFilterCompleted();
              }
          }
    });
  }
}


module.exports = todosList;
