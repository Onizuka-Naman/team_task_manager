import { useEffect, useState } from "react";
import API from "../api";

function Dashboard() {
  const [tasks, setTasks] = useState([]);

  const [taskData, setTaskData] = useState({
    title: "",
    status: "Pending",
  });

  const user = JSON.parse(localStorage.getItem("user"));

  const fetchTasks = async () => {
    const res = await API.get("/tasks");
    setTasks(res.data);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const createTask = async () => {
    await API.post("/tasks", taskData);
    fetchTasks();
  };

  return (
    <div className="container">
      <h2>Dashboard</h2>

      <p>Welcome {user?.name}</p>
      <p>Role: {user?.role}</p>

      <h3>Create Task</h3>

      <input
        placeholder="Task title"
        onChange={(e) =>
          setTaskData({ ...taskData, title: e.target.value })
        }
      />

      <select
        onChange={(e) =>
          setTaskData({ ...taskData, status: e.target.value })
        }
      >
        <option>Pending</option>
        <option>In Progress</option>
        <option>Completed</option>
      </select>

      <button onClick={createTask}>Add Task</button>

      <h3>All Tasks</h3>

      {tasks.map((task) => (
        <div className="task-card" key={task._id}>
          <h4>{task.title}</h4>
          <p>Status: {task.status}</p>
        </div>
      ))}
    </div>
  );
}

export default Dashboard;