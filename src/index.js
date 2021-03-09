const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find(user => user.username === username)

  if (!user ){
    return response.status(404).json({message: 'user doest not exists'})
  }

  request.user = user

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const usernameIsAlreadyInUse = users.find(user => user.username === username)
 

  if(usernameIsAlreadyInUse) {
    return response.status(400).json({error:'username is already in use'})
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos:[]
  }
  users.push(user)

  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.json(user.todos)
});
 
app.post('/todos', checksExistsUserAccount, (request, response) => {
  
  const { user } = request
  const { title, deadline } = request.body

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo)

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { id } = request.params
  const { user } = request

  const todoIndex = user.todos.findIndex(todo => todo.id === id)

  if(todoIndex < 0) {
    return response.status(404).json({error:'todo does not existing'})
  }

  user.todos[todoIndex] = Object.assign(user.todos[todoIndex], {title, deadline})

  return response.status(201).json(user.todos[todoIndex])
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request

  const todoIndex = user.todos.findIndex(todo => todo.id === id)

  if(todoIndex < 0) {
    return response.status(404).json({error:'todo does not existing'})
  }

  user.todos[todoIndex] = Object.assign(user.todos[todoIndex], {done:true})

  return response.status(201).json(user.todos[todoIndex])
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request

  const todo = user.todos.find(todo => todo.id === id)

  if(!todo) {
    return response.status(404).json({error:'todo does not existing'})
  }

  user.todos.splice(todo, 1)
  return response.status(204).send()
});

module.exports = app;