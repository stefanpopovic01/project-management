import "./SidebarNotifications.css";
import { getNotifications } from "../../api/services/notificationServices";
import { useState } from "react";
import { useEffect } from "react";
import { AuthContext } from "../../contex/AuthContext";
import { useContext } from "react";
import { getUserProjects } from "../../api/services/projectServices";
import { markAsRead, markAllRead } from "../../api/services/notificationServices";
import { respondInvite } from "../../api/services/projectServices";

const SidebarNotifications = ({ onClose }) => {

    const { user } = useContext(AuthContext);
    const id = user.id;

const [loading, setLoading] = useState(false);
const [notifications, setNotifications] = useState([]);

const fetchNotificationData = async () => {
    try {
      setLoading(true);

      const [notificationRes] = await Promise.all([
        getNotifications()
      ]);

      setNotifications(notificationRes.data)

    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
};

const handleMarkAsRead = async (notifId) => {
  try {
    const res = await markAsRead(notifId);
    const updatedNotif = res.data.notification;

    setNotifications((prev) =>
      prev.map((notif) =>
        notif._id === updatedNotif._id ? updatedNotif : notif
      )
    );
  } catch (err) {
    console.error(
      err.response?.data?.message || "Failed to mark as read"
    );
  }
};

const handleMarkAllAsRead = async () => {
  try {
    await markAllRead();

    setNotifications((prev) =>
      prev.map((notif) => ({
        ...notif,
        isRead: true,
      }))
    );
  } catch (err) {
    console.error(
      err.response?.data?.message || "Failed to mark all as read"
    );
  }
};

const handleRespondInvite = async (projectId, status) => {
  try {
    await respondInvite(projectId, status);

    setNotifications(prev =>
      prev.map(notif => {
        if (notif.project?._id !== projectId) return notif;

        return {
          ...notif,
          project: {
            ...notif.project,
            members: notif.project.members.map(member =>
              member.user?._id === id
                ? { ...member, status }
                : member
            )
          }
        };
      })
    );

  } catch (err) {
    console.error(
      err.response?.data?.message || "Failed to respond to invite"
    );
  }
};

useEffect(() => {
  fetchNotificationData();
}, []);

if (loading) {
  return (
    <div className="sn-loading">
      <div className="sn-spinner"></div>
    </div>
  );
}

return (
  <div className="sn-container">

    <div className="sn-header">
      <h2>Notifications</h2>
      <i className="fa-solid fa-xmark notifMenu" onClick={() => onClose(prev => !prev)}></i>
    </div>

    <div className="sn-list">

      {loading ? (
        <div className="sn-loading">
          <div className="sn-spinner"></div>
        </div>
      ) : (
        notifications
          ?.filter((notif) => notif.isRead === false)
          .map((notif, index) => {
            const actor = notif.actor;
            const isInvite = notif.type === "member_invited";

            const memberStatus = notif.project?.members?.find(
              m => m.user?._id === id
            )?.status;

            const isPending = memberStatus === "pending";

            return (
              <div className="sn-item sn-invite" key={index}>
                <div className="sn-avatar">
                  {actor?.avatarUrl ? (
                    <img src={actor.avatarUrl} alt="profile" />
                  ) : (
                    <span className="notif-initials">
                      {(actor?.firstName?.[0]?.toUpperCase() || "") +
                        (actor?.lastName?.[0]?.toUpperCase() || "")}
                    </span>
                  )}
                </div>

                <div className="sn-content">
                  <p className="sn-title">
                    {notif.message}
                  </p>

                  <p className="sn-project">
                    {notif.project?.title || ""}
                  </p>

                  {isInvite && isPending && (
                    <div className="sn-actions">
                      <button className="sn-accept" onClick={() => handleRespondInvite(notif.project?._id, "accepted")}>Accept</button>
                      <button className="sn-decline" onClick={() => handleRespondInvite(notif.project?._id, "declined")}>Decline</button>
                    </div>
                  )}

                  <p className="sn-mark-read" onClick={() => handleMarkAsRead(notif._id)}>Mark as read</p>
                </div>
              </div>
            );
          })
      )}

      {notifications?.some(n => !n.isRead) ? (
        <p className="sn-mark-read all" onClick={handleMarkAllAsRead}>
          Mark all as read
        </p>
      ) : (
        <div className="sn-empty">
          <i className="fa-regular fa-bell-slash"></i>
          <p>No new notifications</p>
        </div>
      )}
    </div>

  </div>
);
}

export default SidebarNotifications;
