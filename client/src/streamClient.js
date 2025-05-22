// src/streamClient.js

import { StreamChat } from 'stream-chat';
import Cookies from 'universal-cookie';

const cookies = new Cookies();
const apiKey = '3sh45yq5ka5e';
const authToken = cookies.get("token");

const client = StreamChat.getInstance(apiKey);

if (authToken && !client.userID) {
  client.connectUser(
    {
      id: cookies.get('userId'),
      name: cookies.get('username'),
      fullName: cookies.get('fullName'),
      image: cookies.get('avatarURL'), 
      phoneNumber: cookies.get('phoneNumber'),
      isAdmin: cookies.get('isAdmin'),
    },
    authToken
  ).catch((error) => {
    console.error("Error connecting user:", error);
  });
}

export { client };


