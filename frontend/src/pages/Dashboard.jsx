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
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h2>Dashboard</h2>
          <p className="subtitle">Welcome back, <strong>{user?.name}</strong> ({user?.role})</p>
        </div>
        <button className="logout-btn" onClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/";
        }}>Logout</button>
      </div>

      <div className="dashboard-content">
        <div className="create-task-section">
          <h3>Create New Task</h3>
          <div className="task-form">
            <input
              placeholder="What needs to be done?"
              value={taskData.title}
              onChange={(e) =>
                setTaskData({ ...taskData, title: e.target.value })
              }
            />
            <select
              value={taskData.status}
              onChange={(e) =>
                setTaskData({ ...taskData, status: e.target.value })
              }
            >
              <option>Pending</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
            <button onClick={createTask}>Add Task</button>
          </div>
        </div>

        <div className="tasks-section">
          <h3>Your Tasks</h3>
          <div className="task-list">
            {tasks.length === 0 ? (
              <p className="empty-state">No tasks found. Create one above!</p>
            ) : (
              tasks.map((task) => (
                <div className="task-card" key={task._id}>
                  <div className="task-info">
                    <h4>{task.title}</h4>
                    <span className={`status-badge status-${task.status.toLowerCase().replace(" ", "-")}`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;