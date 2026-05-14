import "./SidebarNotifications.css";
import { getNotifications } from "../../api/services/notificationServices";
import { useState } from "react";
import { useEffect } from "react";
import { AuthContext } from "../../contex/AuthContext";
import { useContext } from "react";
import { getUserProjects } from "../../api/services/projectServices";
import { markAsRead, markAllRead } from "../../api/services/notificationServices";
import { acceptInvite, declineInvite } from "../../api/services/projectServices";

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
        notif.id === updatedNotif.id ? updatedNotif : notif
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
        is_read: true,
      }))
    );
  } catch (err) {
    console.error(
      err.response?.data?.message || "Failed to mark all as read"
    );
  }
};

const handleAcceptInvite = async (notifId, inviteId) => {
  try {
    await acceptInvite(inviteId);
    setNotifications((prev) => prev.map((notif) => notif.id === notifId ? {...notif, status: "accepted",} : notif ));

  } catch (err) {
    console.error(
      err.response?.data?.message || "Failed to accept invite"
    );
  }
};

const handleDeclineInvite = async (notifId, inviteId) => {
  try {
    await declineInvite(inviteId);
    setNotifications((prev) => prev.map((notif) => notif.id === notifId ? {...notif, status: "declined",} : notif ));

  } catch (err) {
    console.error(
      err.response?.data?.message || "Failed to decline invite"
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
          ?.filter((notif) => notif.is_read === false)
          .map((notif, index) => {
            const actor = notif.actor;
            const isInvite = notif.type === "member_invited";

            const memberStatus = notif.status;
            const isPending = memberStatus === "pending";      

            return (
              <div className="sn-item sn-invite" key={index}>
                <div className="sn-avatar">
                  {actor?.image ? (
                    <img src={actor.image} alt="profile" />
                  ) : (
                    <span className="notif-initials">
                      {(actor?.first_name?.[0]?.toUpperCase() || "") +
                        (actor?.last_name?.[0]?.toUpperCase() || "")}
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
                      <button className="sn-accept" onClick={() => handleAcceptInvite(notif.id, notif?.invite)}>Accept</button>
                      <button className="sn-decline" onClick={() => handleDeclineInvite(notif.id, notif?.invite)}>Decline</button>
                    </div>
                  )}

                  <p className="sn-mark-read" onClick={() => handleMarkAsRead(notif.id)}>Mark as read</p>
                </div>
              </div>
            );
          })
      )}

      {notifications?.some(n => !n.is_read) ? (
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
