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

export async function fetchSurveys() {
  const response = await fetch(`${API_BASE_URL}/surveys`);
  return response.json();
}
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