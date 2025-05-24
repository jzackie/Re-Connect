import React, { useState } from 'react';
import { useChatContext } from 'stream-chat-react';

import { UserList } from './';
import { CloseCreateChannel } from '../assets';

const ChannelNameInput = ({ channelName = '', setChannelName }) => {
    const handleChange = (event) => {
        event.preventDefault();
        setChannelName(event.target.value);
    };

    return (
        <div className="channel-name-input__wrapper">
            <p>Name</p>
            <input value={channelName} onChange={handleChange} placeholder="channel-name" />
            <p>Add Members</p>
        </div>
    );
};

const EditChannel = ({ setIsEditing }) => {
    const { channel } = useChatContext();
    const [channelName, setChannelName] = useState(channel?.data?.name);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const updateChannel = async (event) => {
        event.preventDefault();

        setErrorMessage('');
        setSuccessMessage('');

        try {
            if (!channel) {
                setErrorMessage("No channel selected.");
                return;
            }

            await channel.query();

            console.log('channel type:', channel.type);
            console.log('channel.data.distinct:', channel.data?.distinct);
            console.log('channel.config.distinct:', channel.config?.distinct);

            // Determine if channel is distinct (true means you cannot add members)
            const isDistinct = Boolean(channel?.data?.distinct || channel?.config?.distinct);

            if (isDistinct) {
                setErrorMessage("Cannot add members to a distinct channel. Please create a new channel with the desired members.");
                return;
            }

            const membersToAdd = selectedUsers.filter(userId => !channel.state.members.hasOwnProperty(userId));
            console.log('membersToAdd:', membersToAdd);

            const nameChanged = channelName !== (channel.data?.name || channel.data?.id);

            if (nameChanged) {
                await channel.update({ name: channelName }, { text: `Channel name changed to ${channelName}` });
            }

            if (membersToAdd.length) {
                // Add members first
                await channel.addMembers(membersToAdd);

                // Get usernames for added members
                const addedUsersNames = membersToAdd
                    .map(userId => channel.state.members[userId]?.user?.name || userId)
                    .join(', ');

                // Then update the channel with a system message notification (no data change)
                await channel.update({}, { text: `${addedUsersNames} ${membersToAdd.length > 1 ? 'have' : 'has'} been added to the group.` });

                setSuccessMessage(`Added ${membersToAdd.length} user${membersToAdd.length > 1 ? 's' : ''} successfully!`);
            }


            setChannelName(null);
            setSelectedUsers([]);
            setIsEditing(false);

            setTimeout(() => {
                setSuccessMessage('');
                setErrorMessage('');
            }, 3000);

        } catch (err) {
            console.error('Failed to update channel:', err);
            setErrorMessage('Failed to update channel.');
        }
    };


    return (
        <div className="edit-channel__container">
            <div className="edit-channel__header">
                <p>Edit Channel</p>
                <CloseCreateChannel setIsEditing={setIsEditing} />
            </div>
            <ChannelNameInput channelName={channelName} setChannelName={setChannelName} />
            <UserList setSelectedUsers={setSelectedUsers} />

            {successMessage && <div className="success-message">{successMessage}</div>}
            {errorMessage && <div className="error-message">{errorMessage}</div>}

            <div className="edit-channel__button-wrapper" onClick={updateChannel}>
                <p>Save Changes</p>
            </div>
        </div>
    );
};

export default EditChannel;