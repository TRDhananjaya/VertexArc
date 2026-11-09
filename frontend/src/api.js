const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

// Send login credentials to our Express backend
export async function loginUser(email, password) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data;
}

// Retrieve projects that the authenticated user can access
export async function getProjects(token) {
  const response = await fetch(
    `${API_BASE_URL}/api/projects`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (response.status === 401) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  if (!response.ok) {
    throw new Error("Failed to load projects");
  }

  return response.json();
}

// List tasks within a project (only for members)
export async function getProjectTasks(projectId, token) {
  const response = await fetch(
    `${API_BASE_URL}/api/projects/${projectId}/tasks`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (response.status === 401) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  if (!response.ok) {
    throw new Error("Failed to load project tasks");
  }

  return response.json();
}

// Create a new project (only for admins)
export async function createProject(token, name, description) {
  const response = await fetch(`${API_BASE_URL}/api/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      name,
      description
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create project");
  }

  return data;
}

// Create a new task within a project (only for members)
export async function createTask(projectId, token, taskData) {
  const response = await fetch(
    `${API_BASE_URL}/api/projects/${projectId}/tasks`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(taskData)
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || data.error || "Failed to create task"
    );
  }

  return data;
}

export async function getUsers(token) {
  const response = await fetch(`${API_BASE_URL}/api/users`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Your session has expired. Please log in again.");
    }

    if (response.status === 403) {
      throw new Error("You do not have permission to view users.");
    }

    throw new Error("Failed to load users");
  }

  return response.json();
}

export async function createUser(token, userData) {
  const response = await fetch(`${API_BASE_URL}/api/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(userData)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || data.error || "Failed to create user"
    );
  }

  return data;
}

export async function getProjectMembers(projectId, token) {
  const response = await fetch(
    `${API_BASE_URL}/api/projects/${projectId}/members`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (response.status === 401) {
    throw new Error("Session expired. Please log in again.");
  }

  if (response.status === 403) {
    throw new Error("You cannot view this project's members.");
  }

  if (!response.ok) {
    throw new Error("Failed to load project members");
  }

  return response.json();
}


export async function addProjectMember(projectId, token, userId) {
  const response = await fetch(
    `${API_BASE_URL}/api/projects/${projectId}/members`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ userId })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to add project member"
    );
  }

  return data;
}
