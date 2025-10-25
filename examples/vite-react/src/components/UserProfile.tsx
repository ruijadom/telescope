import React from 'react';

interface User {
  name: string;
  email: string;
  avatar: string;
}

interface UserProfileProps {
  user: User;
}

function UserProfile({ user }: UserProfileProps) {
  return (
    <div className="user-profile">
      <img 
        src={user.avatar} 
        alt={user.name}
        className="avatar"
      />
      <div className="user-info">
        <h3>{user.name}</h3>
        <p>{user.email}</p>
        <button>Edit Profile</button>
        <button>Settings</button>
      </div>
    </div>
  );
}

export default UserProfile;
