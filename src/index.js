const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];


function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const userAlreadyExists = users.some((user) => user.username === username);

  if (!userAlreadyExists) {
    return response.status(404).json({ error: "User not found!" });
  }
  next();
}

function checksExistsTodo(request, response, next) {
  const { id } = request.params;

  let todo = ''
  users.forEach(element => {
    todo = element.todos.some(item => item.id === id);
  });

  if (!todo) {
    return response.status(404).json({error: "TODO not found!"});
  }
  next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists!" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);
  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);

  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request.headers;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  users.forEach((item) => {
    if (item.username === username) {
      item.todos.push(todo);
    }
  })

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { username } = request.headers;
  const { title, deadline } = request.body;
  const { id } = request.params;

  if (!title || !deadline) {
    return response.status(404).json();
  }

  let todoEdited;
  users.forEach((user) => {
    if (user.username === username) {
      todoEdited = user.todos.map((todo) => {
        if (todo.id === id) {
          todo.title = title;
          todo.deadline = new Date(deadline);
          return todo
        }
      });
    }
  });


  return response.status(200).json(...todoEdited);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  if (!username) {
    return response.status(404).json({});
  }

  let todoEdited;
  users.forEach((item) => {
    if (item.username === username) {
      todoEdited = item.todos.map((i) => {
        if (i.id === id) {
          i.done = true;
          return i;
        }
      });
    }
  });

  return response.status(200).json(...todoEdited);
});

app.delete('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  users.forEach((user) => {
    users.forEach((user) => {
      if (user.username === username) {
        const index = user.todos.findIndex((i) => {
          return i.id === id;
        });
        user.todos.splice(index, 1);
      }
    });
  });

  return response.status(204).json();
});

module.exports = app;