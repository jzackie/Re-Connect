import React, { useContext } from 'react';
import { NotificationContext } from '../.././context/NotificationContext';
import './Notification.css';


const Notification = () => {
  const { notifications } = useContext(NotificationContext);

  return (
    <div className="notification-container">
      <h3 className='notification-title'>Notifications</h3>
      <div className="notification-list">
        {notifications.length === 0 ? (
          <p style={{ textAlign: 'center', marginTop: '20px' }}>No notifications yet.</p>
        ) : (
          notifications.map((note) => (
            <div className="notification-card blue" key={note.id}>
              <div>
                <h4>{note.message}</h4>
                <p className="timestamp">{note.timestamp}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notification;

