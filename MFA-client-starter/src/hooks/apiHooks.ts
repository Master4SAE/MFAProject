import fetchData from '@/lib/fetchData';
import { Credentials } from '@/types/LocalTypes';
import { LoginResponse, UserResponse } from '@sharedTypes/MessageTypes';

const useUser = () => {
  // Fetch user by token for automatic login
  const getUserByToken = async (token: string) => {
    const options = {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    };
    return await fetchData<UserResponse>(
      import.meta.env.VITE_AUTH_API + '/users/token/',
      options,
    );
  };

  // Check if a username is available
  const getUsernameAvailable = async (username: string) => {
    return await fetchData<{ available: boolean }>(
      import.meta.env.VITE_AUTH_API + '/users/username/' + username,
    );
  };

  // Check if an email is available
  const getEmailAvailable = async (email: string) => {
    return await fetchData<{ available: boolean }>(
      import.meta.env.VITE_AUTH_API + '/users/email/' + email,
    );
  };

  return { getUserByToken, getUsernameAvailable, getEmailAvailable };
};

const use2FA = () => {
  // Register a new user and set up 2FA
  const postUser = async (user: Record<string, string>) => {
    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    };

    // Send request to the Auth API to register user and return QR code URL
    return await fetchData<{ qrCodeUrl: string }>(
      import.meta.env.VITE_2FA_API + '/auth/setup',
      options,
    );
  };

  // Verify user credentials and 2FA code for login
  const postVerify = async (creds: Credentials) => {
    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(creds),
    };

    // Send request to verify 2FA code and retrieve login response with token
    return await fetchData<LoginResponse>(
      import.meta.env.VITE_2FA_API + '/auth/verify',
      options,
    );
  };

  return { postUser, postVerify };
};

export { useUser, use2FA };
