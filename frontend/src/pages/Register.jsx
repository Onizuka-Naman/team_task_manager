import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Member",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    await API.post("/auth/register", form);

    alert("Registered Successfully");
    navigate("/");
  };

  return (
    <div className="container">
      <h2>Register</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Name"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <select
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option>Member</option>
          <option>Admin</option>
        </select>

        <button>Register</button>
      </form>
    </div>
  );
}

export default Register;