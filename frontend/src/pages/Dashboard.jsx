import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "Admin";

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("tasks");
  const [error, setError] = useState("");

  const [taskForm, setTaskForm] = useState({
    title: "",
    status: "Pending",
    dueDate: "",
    project: "",
    assignedTo: "",
  });

  const [projectForm, setProjectForm] = useState({ name: "", description: "" });

  const fetchAll = async () => {
    try {
      const [taskRes, projectRes, userRes] = await Promise.all([
        API.get("/tasks"),
        API.get("/projects"),
        API.get("/auth/users"),
      ]);
      setTasks(taskRes.data);
      setProjects(projectRes.data);
      setUsers(userRes.data);
    } catch (err) {
      setError("Failed to load data. Please refresh.");
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/");
      return;
    }
    fetchAll();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const createTask = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await API.post("/tasks", taskForm);
      setTaskForm({ title: "", status: "Pending", dueDate: "", project: "", assignedTo: "" });
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create task");
    }
  };

  const updateTaskStatus = async (id, status) => {
    try {
      await API.put(`/tasks/${id}`, { status });
      fetchAll();
    } catch {
      setError("Failed to update task");
    }
  };

  const deleteTask = async (id) => {
    try {
      await API.delete(`/tasks/${id}`);
      fetchAll();
    } catch {
      setError("Failed to delete task");
    }
  };

  const createProject = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await API.post("/projects", projectForm);
      setProjectForm({ name: "", description: "" });
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create project");
    }
  };

  const deleteProject = async (id) => {
    try {
      await API.delete(`/projects/${id}`);
      fetchAll();
    } catch {
      setError("Failed to delete project");
    }
  };

  const isOverdue = (task) => {
    if (!task.dueDate || task.status === "Completed") return false;
    return new Date(task.dueDate) < new Date();
  };

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "Pending").length,
    inProgress: tasks.filter((t) => t.status === "In Progress").length,
    overdue: tasks.filter(isOverdue).length,
    completed: tasks.filter((t) => t.status === "Completed").length,
  };

  const formatDate = (d) => {
    if (!d) return null;
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">Task<span>Manager</span></div>
        <nav className="sidebar-nav">
          <div
            className={`nav-item ${activeTab === "tasks" ? "active" : ""}`}
            onClick={() => setActiveTab("tasks")}
          >
            ✓ Tasks
          </div>
          <div
            className={`nav-item ${activeTab === "projects" ? "active" : ""}`}
            onClick={() => setActiveTab("projects")}
          >
            ◈ Projects
          </div>
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <strong>{user?.name}</strong>
            {user?.role}
          </div>
          <button className="btn btn-danger btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        {error && <div className="error-msg">{error}</div>}

        {activeTab === "tasks" && (
          <>
            <div className="page-title">Task Overview</div>
            <div className="page-sub">Track progress across all tasks</div>

            {/* Stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Total Tasks</div>
                <div className="stat-value">{stats.total}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">In Progress</div>
                <div className="stat-value">{stats.inProgress}</div>
              </div>
              <div className="stat-card overdue">
                <div className="stat-label">Overdue</div>
                <div className="stat-value">{stats.overdue}</div>
              </div>
              <div className="stat-card done">
                <div className="stat-label">Completed</div>
                <div className="stat-value">{stats.completed}</div>
              </div>
            </div>

            <div className="content-grid">
              {/* Create Task — Admin only */}
              {isAdmin && (
                <div>
                  <div className="panel">
                    <h3>Create Task</h3>
                    <form onSubmit={createTask}>
                      <div className="form-group">
                        <label>Title</label>
                        <input
                          placeholder="What needs to be done?"
                          value={taskForm.title}
                          onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Status</label>
                        <select
                          value={taskForm.status}
                          onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                        >
                          <option>Pending</option>
                          <option>In Progress</option>
                          <option>Completed</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Due Date</label>
                        <input
                          type="date"
                          value={taskForm.dueDate}
                          onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Project</label>
                        <select
                          value={taskForm.project}
                          onChange={(e) => setTaskForm({ ...taskForm, project: e.target.value })}
                        >
                          <option value="">-- No Project --</option>
                          {projects.map((p) => (
                            <option key={p._id} value={p._id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Assign To</label>
                        <select
                          value={taskForm.assignedTo}
                          onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                        >
                          <option value="">-- Unassigned --</option>
                          {users.map((u) => (
                            <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                          ))}
                        </select>
                      </div>
                      <button className="btn btn-primary">Add Task</button>
                    </form>
                  </div>
                </div>
              )}

              {/* Task List */}
              <div className="panel">
                <h3>All Tasks</h3>
                {tasks.length === 0 ? (
                  <div className="empty-state">No tasks yet. Create one to get started.</div>
                ) : (
                  <div className="task-list">
                    {tasks.map((task) => {
                      const overdue = isOverdue(task);
                      return (
                        <div className={`task-card ${overdue ? "overdue-card" : ""}`} key={task._id}>
                          <div style={{ flex: 1 }}>
                            <div className="task-title">{task.title}</div>
                            <div style={{ marginTop: 4 }}>
                              <span className={`status-badge status-${task.status.toLowerCase().replace(" ", "-")}`}>
                                {overdue ? "Overdue" : task.status}
                              </span>
                            </div>
                            <div className="task-meta">
                              {task.project && <span>◈ {task.project.name}</span>}
                              {task.assignedTo && <span>👤 {task.assignedTo.name}</span>}
                              {task.dueDate && (
                                <span style={{ color: overdue ? "#e53e3e" : "#999" }}>
                                  📅 {formatDate(task.dueDate)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="task-actions">
                            {task.status !== "Completed" && (
                              <select
                                value={task.status}
                                onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                                style={{ width: "120px", fontSize: "12px", padding: "5px 8px" }}
                              >
                                <option>Pending</option>
                                <option>In Progress</option>
                                <option>Completed</option>
                              </select>
                            )}
                            {isAdmin && (
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => deleteTask(task._id)}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === "projects" && (
          <>
            <div className="page-title">Projects</div>
            <div className="page-sub">Manage your team's projects</div>

            <div className="content-grid">
              {isAdmin && (
                <div className="panel">
                  <h3>New Project</h3>
                  <form onSubmit={createProject}>
                    <div className="form-group">
                      <label>Project Name</label>
                      <input
                        placeholder="e.g. Website Redesign"
                        value={projectForm.name}
                        onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <input
                        placeholder="Short description (optional)"
                        value={projectForm.description}
                        onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                      />
                    </div>
                    <button className="btn btn-primary">Create Project</button>
                  </form>
                </div>
              )}

              <div className="panel">
                <h3>All Projects</h3>
                {projects.length === 0 ? (
                  <div className="empty-state">No projects created yet.</div>
                ) : (
                  <div className="project-list">
                    {projects.map((p) => (
                      <div className="project-item" key={p._id}>
                        <div>
                          <div className="project-name">{p.name}</div>
                          {p.description && <div className="project-by">{p.description}</div>}
                          {p.createdBy && (
                            <div className="project-by">by {p.createdBy.name}</div>
                          )}
                        </div>
                        {isAdmin && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => deleteProject(p._id)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Dashboard;