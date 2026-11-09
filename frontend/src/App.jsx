import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000/api";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [documents, setDocuments] = useState([]);
  const [logs, setLogs] = useState([]);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function request(url, options = {}) {
    const response = await fetch(API + url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  }

  async function handleAuth(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";

      const body = isRegister
        ? { name, email, password }
        : { email, password };

      const response = await fetch(API + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      if (isRegister) {
        setMessage("Registration successful. Please login.");
        setIsRegister(false);
      } else {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setUser(data.user);
        setMessage("Login successful!");
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadDashboard() {
    try {
      const [docData, auditData, userData] = await Promise.all([
        request("/documents"),
        request("/audit"),
        request("/auth/me")
      ]);

      setDocuments(docData.documents || []);
      setLogs(auditData.logs || []);
      setUser(userData.user);
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => {
    if (token) {
      loadDashboard();
    }
  }, [token]);

  async function uploadDocument(e) {
    e.preventDefault();

    if (!file) {
      setMessage("Please select a PDF file.");
      return;
    }

    const formData = new FormData();
    formData.append("document", file);

    try {
      const data = await request("/documents/upload", {
        method: "POST",
        body: formData
      });

      setMessage(data.message);
      setFile(null);
      await loadDashboard();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function shareDocument(id) {
    const recipientEmail = window.prompt("Enter recipient email:");

    if (!recipientEmail) return;

    const canView = window.confirm("Allow recipient to view this document?");
    const canDownload = canView
      ? window.confirm("Allow recipient to download this document?")
      : false;

    try {
      const data = await request(`/documents/${id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: recipientEmail,
          can_view: canView,
          can_download: canDownload
        })
      });

      setMessage(data.message);
      await loadDashboard();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function downloadDocument(id) {
    try {
      const response = await fetch(
        `${API}/documents/${id}/download`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `document-${id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);

      setMessage("Document downloaded successfully.");
      await loadDashboard();
    } catch (error) {
      setMessage(error.message);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
    setDocuments([]);
    setLogs([]);
    setMessage("Logged out successfully.");
  }

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="logo">🔐 TrustVault</div>
          <h1>{isRegister ? "Create Account" : "Welcome Back"}</h1>
          <p className="subtitle">
            Secure Document Sharing Platform
          </p>

          <form onSubmit={handleAuth}>
            {isRegister && (
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password (minimum 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength="8"
              required
            />

            <button type="submit" disabled={loading}>
              {loading
                ? "Please wait..."
                : isRegister
                  ? "Register"
                  : "Login"}
            </button>
          </form>

          {message && <p className="message">{message}</p>}

          <p className="switch-text">
            {isRegister
              ? "Already have an account?"
              : "Don't have an account?"}
            <button
              className="link-button"
              onClick={() => {
                setIsRegister(!isRegister);
                setMessage("");
              }}
            >
              {isRegister ? "Login" : "Register"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="topbar">
        <div className="logo">🔐 TrustVault</div>
        <div className="user-area">
          <span>{user?.name || user?.email || "User"}</span>
          <button className="logout-button" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main className="main-content">
        <section className="welcome">
          <h1>Document Dashboard</h1>
          <p>Manage and securely share your documents.</p>
        </section>

        {message && <div className="message">{message}</div>}

        <section className="upload-card">
          <h2>Upload Document</h2>
          <form onSubmit={uploadDocument} className="upload-form">
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <button type="submit">Upload PDF</button>
          </form>
        </section>

        <section className="content-card">
          <h2>My Documents</h2>
          {documents.length === 0 ? (
            <p className="empty">No documents available.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Document Name</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id}>
                      <td>{doc.id}</td>
                      <td>{doc.filename}</td>
                      <td>
                        {new Date(doc.created_at).toLocaleDateString()}
                      </td>
                      <td className="actions">
                        <button onClick={() => downloadDocument(doc.id)}>
                          Download
                        </button>
                        <button
                          className="share-button"
                          onClick={() => shareDocument(doc.id)}
                        >
                          Share
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="content-card">
          <h2>Audit Trail</h2>
          {logs.length === 0 ? (
            <p className="empty">No audit logs available.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>User</th>
                    <th>Document</th>
                    <th>Details</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td>{log.action}</td>
                      <td>{log.user_name || log.user_id}</td>
                      <td>{log.filename || log.document_id || "-"}</td>
                      <td>{log.details}</td>
                      <td>
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
