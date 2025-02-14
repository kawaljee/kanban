import React, { useEffect, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import axios from "axios";
import { nanoid } from "nanoid";

const API_URL = "https://dummyjson.com/todos";
const STATUSES = ["Pending", "In Progress", "Completed"];

const App = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");

  useEffect(() => {
    axios.get(API_URL).then((response) => {
      const updatedTodos = response.data.todos.map(todo => ({
        ...todo,
        status: todo.completed ? "Completed" : "Pending"
      }));
      setTodos(updatedTodos);
    });
  }, []);

  console.log(todos)

  const updateTodo = (id, updates) => {
    // axios.put(`${API_URL}/${id}`, updates).then(() => {
      setTodos((prev) => prev.map((todo) => (todo.id === id ? { ...todo, ...updates } : todo)));
    // });
  };

  const addTodo = () => {
    if (!newTodo.trim()) return;
  //   {
  //     "id": 29,
  //     "todo": "Have a photo session with some friends",
  //     "completed": true,
  //     "userId": 91
  // }
    const newTask = { id: nanoid(), todo: newTodo, description: "", completed: false, status: "Pending", userId:nanoid() };
    setTodos((prev) => [...prev, newTask]);
    setNewTodo("");
  };

  const deleteTodo = (id) => {
    // axios.delete(`${API_URL}/${id}`).then(() => {
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    // });
  };

  const moveTodo = (id, status) => {
    updateTodo(id, { status });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col items-center p-6 min-h-screen">
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            className="p-2 border rounded"
            placeholder="Enter a new todo"
          />
          <button onClick={addTodo} className="bg-green-600 text-white px-4 py-2 rounded">Add Todo</button>
        </div>
        <div className="flex gap-4 w-full">
          {STATUSES.map((status) => (
            <Lane key={status} status={status} todos={todos} moveTodo={moveTodo} deleteTodo={deleteTodo} updateTodo={updateTodo} />
          ))}
        </div>
      </div>
    </DndProvider>
  );
};

const Lane = ({ status, todos, moveTodo, deleteTodo, updateTodo }) => {
  const [{ isOver }, drop] = useDrop({
    accept: "TODO",
    drop: (item) => moveTodo(item.id, status),
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  });

  return (
    <div ref={drop} className={`w-1/3 p-4 rounded-md shadow ${isOver ? "bg-gray-200" : ""}`}>
      <h2 className="text-xl font-bold mb-4">{status}</h2>
      {todos.filter((todo) => todo.status === status).map((todo) => (
        <TodoCard key={todo.id} todo={todo} deleteTodo={deleteTodo} updateTodo={updateTodo} />
      ))}
    </div>
  );
};

const TodoCard = ({ todo, deleteTodo, updateTodo }) => {
  const [{ isDragging }, drag] = useDrag({
    type: "TODO",
    item: { id: todo.id },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.todo);
  const [editDescription, setEditDescription] = useState(todo.description || "");

  const handleEdit = () => {
    updateTodo(todo.id, { todo: editTitle, description: editDescription });
    setIsEditing(false);
  };

  return (
    <div ref={drag} className={`p-3 mb-2 bg-blue-500 text-white rounded shadow ${isDragging ? "opacity-50" : ""}`}>
      {isEditing ? (
        <div>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="p-1 text-black rounded w-full mb-1"
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="p-1 text-black rounded w-full mb-1"
          />
          <button onClick={handleEdit} className="bg-green-600 text-white px-2 py-1 rounded">Save</button>
        </div>
      ) : (
        <div>
          <p>{todo.todo}</p>
          <p className="text-sm italic">{todo.description}</p>
          <button onClick={() => setIsEditing(true)} className="mt-2 bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
          <button onClick={() => deleteTodo(todo.id)} className="mt-2 ml-2 bg-red-600 text-white px-2 py-1 rounded">Delete</button>
        </div>
      )}
    </div>
  );
};

export default App;