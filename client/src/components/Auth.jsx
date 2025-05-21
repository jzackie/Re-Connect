import React, { useState } from 'react';
import Cookies from 'universal-cookie';
import axios from 'axios';

import { client } from '../streamClient';

import '.././styles/auth.css';
import signInImage from '.././assets/icons/LogInImage.png';

const cookies = new Cookies();

const initialState = {
  fullName: '',
  username: '',
  password: '',
  confirmPassword: '',
  phoneNumber: '',
  avatarFile: null,
  avatarPreview: null,
};

const Auth = () => {
  const [form, setForm] = useState(initialState);
  const [isSignup, setIsSignup] = useState(true);

  const handleChange = (e) => {
    if (e.target.name === 'avatarFile') {
      const file = e.target.files[0];
      setForm({
        ...form,
        avatarFile: file,
        avatarPreview: file ? URL.createObjectURL(file) : null,
      });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { fullName, username, password, phoneNumber, avatarFile } = form;
    const URL = 'http://localhost:5000/auth';

    try {
      const formData = new FormData();
      formData.append('fullName', fullName);
      formData.append('username', username);
      formData.append('password', password);
      formData.append('phoneNumber', phoneNumber);
      if (avatarFile) formData.append('avatar', avatarFile);

      const { data: { token, userId, hashedPassword, avatarURL } } = await axios.post(
        `${URL}/${isSignup ? 'signup' : 'login'}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      await client.connectUser(
        {
          id: userId,
          name: username,
          fullName,
          image: avatarURL,
          phoneNumber,
        },
        token
      );

      cookies.set('token', token);
      cookies.set('username', username);
      cookies.set('fullName', fullName);
      cookies.set('userId', userId);
      if (isSignup) {
        cookies.set('phoneNumber', phoneNumber);
        cookies.set('avatarURL', avatarURL);
        cookies.set('hashedPassword', hashedPassword);
      }

      window.location.reload();
    } catch (error) {
      console.error("FULL ERROR:", error);
      alert(error.response?.data?.message || 'Something went wrong');
    }
  };

  const switchMode = () => {
    setIsSignup((prev) => !prev);
    setForm(initialState);
  };

  return (
    <div className="auth__form-container">
      <div className="auth__form-container_image">
        <img src={signInImage} alt="sign in" />
      </div>
      <div className="auth__form-container_fields">
        <div className="auth__form-container_fields-content">
          <p>{isSignup ? 'Sign Up' : 'Sign In'}</p>
          <form onSubmit={handleSubmit}>
            {isSignup && (
              <div className="auth__form-container_fields-content_input">
                <label htmlFor="fullName">Full Name</label>
                <input
                  name="fullName"
                  type="text"
                  placeholder="Full Name"
                  onChange={handleChange}
                  required
                />
              </div>
            )}
            <div className="auth__form-container_fields-content_input">
              <label htmlFor="username">Username</label>
              <input
                name="username"
                type="text"
                placeholder="Username"
                onChange={handleChange}
                required
              />
            </div>
            {isSignup && (
              <div className="auth__form-container_fields-content_input">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  name="phoneNumber"
                  type="text"
                  placeholder="Phone Number"
                  onChange={handleChange}
                  required
                />
              </div>
            )}
            {isSignup && (
              <div className="auth__form-container_fields-content_input">
                <label htmlFor="avatarFile">Choose Avatar Image</label>
                <input
                  type="file"
                  name="avatarFile"
                  accept="image/*"
                  onChange={handleChange}
                  required
                />
                {form.avatarPreview && (
                  <img
                    src={form.avatarPreview}
                    alt="Avatar Preview"
                    style={{ width: 50, height: 50, borderRadius: '50%', marginTop: 10 }}
                  />
                )}
              </div>
            )}
            <div className="auth__form-container_fields-content_input">
              <label htmlFor="password">Password</label>
              <input
                name="password"
                type="password"
                placeholder="Password"
                onChange={handleChange}
                required
              />
            </div>
            {isSignup && (
              <div className="auth__form-container_fields-content_input">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  onChange={handleChange}
                  required
                />
              </div>
            )}
            <div className="auth__form-container_fields-content_button">
              <button>{isSignup ? 'Sign Up' : 'Sign In'}</button>
            </div>
          </form>
          <div className="auth__form-container_fields-account">
            <p>
              {isSignup ? 'Already have an account?' : "Don't have an account?"}
              <span onClick={switchMode} style={{ cursor: 'pointer', color: 'blue', marginLeft: 5 }}>
                {isSignup ? 'Sign In' : 'Sign Up'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
