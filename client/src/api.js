const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

function getHeaders() {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

// This function sends a POST request to register a new user
// It returns an object with success and message properties
export async function registerUser(user) {
  const headers = getHeaders();
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    const error = await response.json();
    return { success: error.success, message: error.message };
  }

  return response.json();
}

// This function sends a POST request to check if a user is active
// It takes a userId and a callback function as parameters to set the user activation status
// It also stores the user activation status in local storage
// It returns an object with success and message properties
export async function checkUserActive(userId, setUserIsActivated) {
  const headers = getHeaders();
  const response = await fetch(`${API_BASE_URL}/users/${userId}/activate`, {
    method: 'POST',
    headers,
  });

  const data = await response.json();
  
  if (response.ok) {
    if (data.success) {
      setUserIsActivated(true);
      localStorage.setItem('user_is_activated', JSON.stringify(true));
    } else {
      setUserIsActivated(false);
      localStorage.setItem('user_is_activated', JSON.stringify(false));
    }
  } else {
    console.error(data.message);
  }
  return { success: data.success, message: data.message };
}

// This function sends a GET request to fetch a survey by id
// It includes the active public key in the request headers if it exists in local storage
// It throws an error if the response is not ok
// It returns a promise that resolves to a JSON response
export async function fetchSurvey(id) {
  const headers = getHeaders();
  if (localStorage.getItem('active_public_key')) {
    headers['x-casper-public-key'] = localStorage.getItem('active_public_key');
  }

  const response = await fetch(`${API_BASE_URL}/surveys/${id}`, {
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

// This function sends a GET request to fetch all surveys
// It returns a promise that resolves to a JSON response
export async function fetchSurveys() {
  const response = await fetch(`${API_BASE_URL}/surveys`);
  return response.json();
}

// This function sends a POST request to create a new survey
// It includes the user's token and wallet address in the request headers
// It throws an error if the response is not ok
// It returns a promise that resolves to a JSON response
export const createSurvey = async (survey) => {
  const token = localStorage.getItem('token');
  const walletAddress = localStorage.getItem('active_public_key');
  const response = await fetch(`${API_BASE_URL}/surveys`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-casper-public-key': walletAddress,
    },
    body: JSON.stringify(survey),
  });

  if (!response.ok) {
    const errorText = await response.text();
    try {
      const error = JSON.parse(errorText);
      throw new Error(error.message);
    } catch (err) {
      console.error('Error parsing response JSON:', err);
      console.error('Response text:', errorText);
      throw new Error('Failed to create survey');
    }
  }

  return response.json();
};

// This function sends a POST request to log in with a wallet
// It takes a publicAddress parameter to identify the user
// It stores the user's token, userId, and whether they have already signed in local storage
// It throws an error if the response is not ok
// It returns an object with a success property
export async function loginWithWallet(publicAddress) {
  const response = await fetch(`${API_BASE_URL}/auth/login/wallet`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ publicAddress }),
  });

  const data = await response.json();
  if (response.ok) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('userId', data.userId);
    localStorage.setItem('user_already_signed', data.alreadySigned);
    return { success: true };
  } else {
    throw new Error(data.message);
  }
}

// This function sends a POST request to submit a response to a survey
// It takes an id parameter to identify the survey and an answers parameter containing the user's responses
// It throws an error if the response is not ok
// It returns a promise that resolves to a JSON response
export async function submitSurveyResponse(id, answers) {
  const response = await fetch(`${API_BASE_URL}/surveys/${id}/response`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ answers }),
  });
  if (!response.ok) {
    throw new Error('Failed to submit survey response');
  }
  return await response.json();
}