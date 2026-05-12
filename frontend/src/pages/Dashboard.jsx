import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

const PROJECT_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6", "#ec4899"];

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
      setError("Failed to load data. Please refresh the page.");
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
      setError("Failed to update task status");
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

  const getTaskDotClass = (task) => {
    if (isOverdue(task)) return "dot-overdue";
    if (task.status === "Completed") return "dot-completed";
    if (task.status === "In Progress") return "dot-progress";
    return "dot-pending";
  };

  const getBadgeClass = (task) => {
    if (isOverdue(task)) return "badge badge-overdue";
    if (task.status === "Completed") return "badge badge-completed";
    if (task.status === "In Progress") return "badge badge-progress";
    return "badge badge-pending";
  };

  const getBadgeLabel = (task) => {
    if (isOverdue(task)) return "Overdue";
    return task.status;
  };

  const formatDate = (d) => {
    if (!d) return null;
    return new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getInitials = (name = "") =>
    name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  const stats = {
    total: tasks.length,
    inProgress: tasks.filter((t) => t.status === "In Progress").length,
    overdue: tasks.filter(isOverdue).length,
    completed: tasks.filter((t) => t.status === "Completed").length,
  };

  return (
    <div className="dashboard-wrapper">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">✓</div>
          <div className="logo-text">Task<span>Manager</span></div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Menu</div>

          <div
            className={`nav-item ${activeTab === "tasks" ? "active" : ""}`}
            onClick={() => setActiveTab("tasks")}
          >
            <span className="nav-icon">📋</span>
            Tasks
          </div>

          <div
            className={`nav-item ${activeTab === "projects" ? "active" : ""}`}
            onClick={() => setActiveTab("projects")}
          >
            <span className="nav-icon">📁</span>
            Projects
          </div>

          <div className="sidebar-section-label">Team</div>

          <div
            className={`nav-item ${activeTab === "members" ? "active" : ""}`}
            onClick={() => setActiveTab("members")}
          >
            <span className="nav-icon">👥</span>
            Members
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-pill">
            <div className="user-avatar">{getInitials(user?.name)}</div>
            <div className="user-details">
              <div className="user-name">{user?.name}</div>
              <div className={`user-role ${isAdmin ? "admin" : ""}`}>{user?.role}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            ↩ Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="main-content">
        {error && (
          <div className="error-msg" style={{ marginBottom: 20 }}>
            ⚠ {error}
          </div>
        )}

        {/* ══ TASKS TAB ══ */}
        {activeTab === "tasks" && (
          <>
            <div className="topbar">
              <div>
                <div className="page-title">Task Dashboard</div>
                <div className="page-sub">Track and manage all your team's tasks</div>
              </div>
            </div>

            {/* Stats row */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon purple">📋</div>
                <div className="stat-info">
                  <div className="stat-label">Total Tasks</div>
                  <div className="stat-value">{stats.total}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon blue">⚡</div>
                <div className="stat-info">
                  <div className="stat-label">In Progress</div>
                  <div className="stat-value">{stats.inProgress}</div>
                </div>
              </div>
              <div className="stat-card overdue">
                <div className="stat-icon red">⏰</div>
                <div className="stat-info">
                  <div className="stat-label">Overdue</div>
                  <div className="stat-value">{stats.overdue}</div>
                </div>
              </div>
              <div className="stat-card done">
                <div className="stat-icon green">✅</div>
                <div className="stat-info">
                  <div className="stat-label">Completed</div>
                  <div className="stat-value">{stats.completed}</div>
                </div>
              </div>
            </div>

            <div className="content-grid">
              {/* Create task panel — Admin only */}
              {isAdmin && (
                <div>
                  <div className="panel">
                    <div className="panel-header">
                      <h3><span>➕</span> New Task</h3>
                    </div>
                    <div className="panel-body">
                      <form onSubmit={createTask}>
                        <div className="form-group">
                          <label>Task title</label>
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
                          <label>Due date</label>
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
                            <option value="">No project</option>
                            {projects.map((p) => (
                              <option key={p._id} value={p._id}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Assign to</label>
                          <select
                            value={taskForm.assignedTo}
                            onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                          >
                            <option value="">Unassigned</option>
                            {users.map((u) => (
                              <option key={u._id} value={u._id}>
                                {u.name} — {u.role}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button className="btn btn-primary" type="submit">
                          Add Task
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* Task list */}
              <div className="panel">
                <div className="panel-header">
                  <h3><span>📋</span> All Tasks</h3>
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>{tasks.length} tasks</span>
                </div>
                <div className="panel-body">
                  {tasks.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">📭</div>
                      <p>No tasks yet.{isAdmin ? " Create one to get started." : " Ask an admin to create tasks."}</p>
                    </div>
                  ) : (
                    <div className="task-list">
                      {tasks.map((task) => {
                        const overdue = isOverdue(task);
                        return (
                          <div
                            className={`task-card ${overdue ? "overdue-card" : ""} ${task.status === "Completed" ? "done-card" : ""}`}
                            key={task._id}
                          >
                            <div className={`task-dot ${getTaskDotClass(task)}`} />
                            <div className="task-body">
                              <div className="task-title">{task.title}</div>
                              <div className="task-tags">
                                <span className={getBadgeClass(task)}>
                                  {getBadgeLabel(task)}
                                </span>
                                {task.project && (
                                  <span className="badge" style={{ background: "#ede9fe", color: "#5b21b6" }}>
                                    📁 {task.project.name}
                                  </span>
                                )}
                              </div>
                              <div className="task-meta">
                                {task.assignedTo && (
                                  <span className="task-meta-item">👤 {task.assignedTo.name}</span>
                                )}
                                {task.dueDate && (
                                  <span className={`task-meta-item ${overdue ? "overdue-date" : ""}`}>
                                    📅 {formatDate(task.dueDate)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="task-actions">
                              {task.status !== "Completed" && (
                                <select
                                  className="status-select"
                                  value={task.status}
                                  onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                                >
                                  <option>Pending</option>
                                  <option>In Progress</option>
                                  <option>Completed</option>
                                </select>
                              )}
                              {isAdmin && (
                                <button
                                  className="btn btn-danger btn-icon"
                                  onClick={() => deleteTask(task._id)}
                                  title="Delete task"
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
            </div>
          </>
        )}

        {/* ══ PROJECTS TAB ══ */}
        {activeTab === "projects" && (
          <>
            <div className="topbar">
              <div>
                <div className="page-title">Projects</div>
                <div className="page-sub">Organize your team's work into projects</div>
              </div>
            </div>

            <div className="content-grid">
              {isAdmin && (
                <div className="panel">
                  <div className="panel-header">
                    <h3><span>➕</span> New Project</h3>
                  </div>
                  <div className="panel-body">
                    <form onSubmit={createProject}>
                      <div className="form-group">
                        <label>Project name</label>
                        <input
                          placeholder="e.g. Website Redesign"
                          value={projectForm.name}
                          onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Description <span style={{ color: "#94a3b8", fontWeight: 400 }}>(optional)</span></label>
                        <input
                          placeholder="Brief description of the project"
                          value={projectForm.description}
                          onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                        />
                      </div>
                      <button className="btn btn-primary" type="submit">
                        Create Project
                      </button>
                    </form>
                  </div>
                </div>
              )}

              <div className="panel">
                <div className="panel-header">
                  <h3><span>📁</span> All Projects</h3>
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>{projects.length} projects</span>
                </div>
                <div className="panel-body">
                  {projects.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">📂</div>
                      <p>{isAdmin ? "No projects yet. Create your first one." : "No projects created yet."}</p>
                    </div>
                  ) : (
                    <div className="project-list">
                      {projects.map((p, i) => (
                        <div className="project-card" key={p._id}>
                          <div
                            className="project-color-bar"
                            style={{ background: PROJECT_COLORS[i % PROJECT_COLORS.length] }}
                          />
                          <div className="project-info">
                            <div className="project-name">{p.name}</div>
                            {p.description && (
                              <div className="project-desc">{p.description}</div>
                            )}
                            {p.createdBy && (
                              <div className="project-by">by {p.createdBy.name}</div>
                            )}
                          </div>
                          {isAdmin && (
                            <button
                              className="btn btn-danger btn-icon"
                              onClick={() => deleteProject(p._id)}
                              title="Delete project"
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
            </div>
          </>
        )}

        {/* ══ MEMBERS TAB ══ */}
        {activeTab === "members" && (
          <>
            <div className="topbar">
              <div>
                <div className="page-title">Team Members</div>
                <div className="page-sub">Everyone who has access to this workspace</div>
              </div>
            </div>

            <div className="panel" style={{ maxWidth: 600 }}>
              <div className="panel-header">
                <h3><span>👥</span> Members</h3>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>{users.length} members</span>
              </div>
              <div className="panel-body">
                {users.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">👤</div>
                    <p>No members found.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {users.map((u) => (
                      <div
                        key={u._id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                          padding: "12px 14px",
                          borderRadius: 10,
                          border: "1px solid #e2e8f0",
                          background: "#fafbff",
                        }}
                      >
                        <div className="user-avatar" style={{ width: 38, height: 38, fontSize: 14 }}>
                          {getInitials(u.name)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, color: "#0f172a" }}>{u.name}</div>
                          <div style={{ fontSize: 12, color: "#94a3b8" }}>{u.email}</div>
                        </div>
                        <span
                          className="badge"
                          style={
                            u.role === "Admin"
                              ? { background: "#ede9fe", color: "#5b21b6" }
                              : { background: "#dbeafe", color: "#1e40af" }
                          }
                        >
                          {u.role}
                        </span>
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