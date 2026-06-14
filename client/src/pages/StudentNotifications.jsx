import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { getNotifications, markNotificationRead } from "../api/student.js";
import "./StudentNotifications.css";

function StudentNotifications() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotifications(token)
      .then((data) => {
        setNotifications(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  function handleRead(id) {
    markNotificationRead(id, token).then(() => {
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
      );
    });
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="student-notifications">
      <div className="notif-header">
        <h1>Notifications</h1>
        {unreadCount > 0 && (
          <span className="unread-badge">{unreadCount} non lues</span>
        )}
      </div>

      {loading && <p className="notif-state">Chargement…</p>}

      {!loading && notifications.length === 0 && (
        <p className="notif-state">Aucune notification.</p>
      )}

      <div className="notif-list">
        {notifications.map((n) => (
          <div
            key={n._id}
            className={`notif-item ${n.read ? "read" : "unread"}`}
            onClick={() => !n.read && handleRead(n._id)}
          >
            <div className="notif-dot" />
            <div className="notif-body">
              <p>{n.message}</p>
              <small>
                {n.lesson?.title} -{" "}
                {new Date(n.sentAt).toLocaleDateString("fr-FR")}
              </small>
            </div>
            {!n.read && <span className="notif-cta">Marquer comme lue</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default StudentNotifications;
