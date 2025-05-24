import React, { useEffect, useState } from 'react';
import { Avatar, useChatContext } from 'stream-chat-react';

import { InviteIcon } from '../assets';

const ListContainer = ({ children }) => {
  return (
    <div className="user-list__container">
      <div className="user-list__header">
        <p>User</p>
        <p>Invite</p>
      </div>
      {children}
    </div>
  );
};

const UserItem = ({ user, setSelectedUsers }) => {
  const [selected, setSelected] = useState(false);

  const handleSelect = () => {
    if (selected) {
      setSelectedUsers((prevUsers) => prevUsers.filter((prevUser) => prevUser !== user.id));
    } else {
      setSelectedUsers((prevUsers) => [...prevUsers, user.id]);
    }
    setSelected((prevSelected) => !prevSelected);
  };

  return (
    <div className="user-item__wrapper" onClick={handleSelect}>
      <div className="user-item__name-wrapper">
        <Avatar image={user.image} name={user.fullName || user.id} className="custom-avatar" />
        <p className="user-item__name">{user.fullName || user.name || user.id}</p>
      </div>
      {selected ? <InviteIcon /> : <div className="user-item__invite-empty" />}
    </div>
  );
};

const UserList = ({ setSelectedUsers }) => {
  const { client } = useChatContext();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listEmpty, setListEmpty] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!client) return;

    let isMounted = true;
    const getUsers = async () => {
      setLoading(true);
      try {
        const response = await client.queryUsers(
          { id: { $ne: client.userID } },
          { id: 1 },
        );
        if (isMounted) {
          if (response.users.length) {
            setUsers(response.users);
            setListEmpty(false);
          } else {
            setListEmpty(true);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('User fetch error:', err);
          setError(true);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    getUsers();

    return () => {
      isMounted = false;
    };
  }, [client]);

  if (error) {
    return (
      <ListContainer>
        <div className="user-list__message">Error loading, please refresh and try again.</div>
      </ListContainer>
    );
  }

  if (listEmpty) {
    return (
      <ListContainer>
        <div className="user-list__message">No users found.</div>
      </ListContainer>
    );
  }

  return (
    <ListContainer>
      {loading ? (
        <div className="user-list__message">Loading users...</div>
      ) : (
        <div className="user-list__scroll">
          {users.map((user) => (
            <UserItem key={user.id} user={user} setSelectedUsers={setSelectedUsers} />
          ))}
        </div>
      )}
    </ListContainer>
  );
};

export default UserList;