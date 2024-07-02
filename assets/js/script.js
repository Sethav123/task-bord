// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));

// Todo: create a function to generate a unique task id
function generateTaskId() {
  const taskId = crypto.randomUUID();
  return taskId;
}

// Todo: create a function to create a task card
function createTaskCard(task) {
  const taskCard = $('<div>')
    .addClass('card task-card draggable my-3')
    .attr('data-task-id', task.id);
  const cardHeader = $('<div>').addClass('card-header h4').text(task.name);
  const cardBody = $('<div>').addClass('card-body');
  const cardDescription = $('<p>').addClass('card-text').text(task.description);
  const cardDueDate = $('<p>').addClass('card-text').text(task.dueDate);
  const cardDeleteBtn = $('<button>')
    .addClass('btn btn-danger delete-task')
    .text('Delete')
    .attr('data-task-id', task.id);
  cardDeleteBtn.on('click', handleDeleteTask);
  if (task.dueDate) {
    const now = dayjs();
    const taskDueDate = dayjs(task.dueDate, 'YYYY-MM-DD');

    if (now.isSame(taskDueDate, 'day')) {
      taskCard.addClass('bg-warning text-white');
    } else if (now.isAfter(taskDueDate, 'day')) {
      taskCard.addClass('bg-danger text-white');
      cardDeleteBtn.addClass('border-light');
    }
  }

  cardBody.append(cardDescription, cardDueDate, cardDeleteBtn);
  taskCard.append(cardHeader, cardBody);

  return taskCard;
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
  let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
  const todoList = $('#todo-cards');
  const inProgressList = $('#in-progress-cards');
  const doneList = $('#done-cards');

  todoList.empty();
  inProgressList.empty();
  doneList.empty();

  for (let task of taskList) {
    const card = createTaskCard(task);
    if (task.status === "to-do") {
      todoList.append(card);
    } else if (task.status === "in-progress") {
      inProgressList.append(card);
    } else if (task.status === "done") {
      doneList.append(card);
    }
  };
  
  $('.draggable').draggable({
    opacity: 0.7,
    zIndex: 100,
    helper: function (e) {
      const original = $(e.target).hasClass('ui-draggable')
        ? $(e.target)
        : $(e.target).closest('.ui-draggable');
      return original.clone().css({
        width: original.outerWidth(),
      });
    },
  });
}
// Todo: create a function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();

  const taskName = $('#taskName').val().trim();
  const dueDate = $('#dueDate').val();
  const taskDescription = $('#taskDescription').val();

  const newTask = {
    id: generateTaskId(),
    name: taskName,
    dueDate: dueDate,
    description: taskDescription,
    status: 'to-do'
  };

  taskList.push(newTask);
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
  $('#taskForm')[0].reset();
  $('#formModal').modal('hide');
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event) {
  const taskId = $(this).attr('data-task-id');
  taskList = taskList.filter(task => task.id != taskId);
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const taskId = ui.draggable.attr('data-task-id');
  const newStatus = event.target.id;

  const taskToUpdate = taskList.find(task => task.id === taskId);
  if (taskToUpdate) {
    taskToUpdate.status = newStatus;
    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTaskList();
  }
}

// When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  renderTaskList();

  $('#dueDate').datepicker({ //add datepicker
    dateFormat: 'yy-mm-dd',
    changeMonth: true,
    changeYear: true
  });

  $('.lane').droppable({ // ? Make lanes droppable
    accept: '.draggable',
    drop: handleDrop
  });

  $('#taskForm').submit(handleAddTask);
  $('#project-display').on('click', '.delete-task', handleDeleteTask);
});
