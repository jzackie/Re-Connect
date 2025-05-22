import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Chat } from 'stream-chat-react';
import Cookies from 'universal-cookie';
import { client } from '../../streamClient';
import { ChannelListContainer, ChannelContainer } from './components';
import Auth from '.././Auth.jsx'


import '@stream-io/stream-chat-css/dist/v2/css/index.css';
import './App.css';

const cookies = new Cookies();
const authToken = cookies.get('token');

const App = () => {
    const [createType, setCreateType] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const { theme } = useOutletContext();

    const streamTheme = theme === 'dark'
        ? 'str-chat__theme-dark'
        : theme === 'light'
        ? 'str-chat__theme-light'
        : (window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'str-chat__theme-dark'
            : 'str-chat__theme-light');

    if(!authToken) return <Auth />

    return (
        <div className="app__wrapper">
            <Chat client={client} theme={streamTheme}>
                <ChannelListContainer 
                    isCreating={isCreating}
                    setIsCreating={setIsCreating}
                    setCreateType={setCreateType}
                    setIsEditing={setIsEditing}
                />
                <ChannelContainer 
                    isCreating={isCreating}
                    setIsCreating={setIsCreating}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    createType={createType}
                />
            </Chat>
        </div>
    );
}

export default App;