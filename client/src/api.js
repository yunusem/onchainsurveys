const API_BASE_URL = 'http://localhost:3001';

export async function loginUser(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
  
    const data = await response.json();
  
    if (response.ok) {
      localStorage.setItem('token', data.token);
    } else {
      throw new Error(data.message);
    }
  
    return data;
  }
  

export async function registerUser(user) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
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
  
  export async function createSurvey(survey) {
    const response = await fetch(`${API_BASE_URL}/surveys`, {
      method: 'POST',
      headers: getHeaders(), // Use getHeaders() here
      body: JSON.stringify(survey),
    });
  
    if (!response.ok) {
      try {
        const error = await response.json();
        throw new Error(error.message);
      } catch (err) {
        console.error('Error parsing response JSON:', err);
        console.error('Response text:', await response.text());
        throw new Error('Failed to create survey');
      }
    }
  
    return response.json();
  }