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

// Create a new project (Admin and Project Manager)
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


// Update project details
export async function updateProject(projectId, token, projectData) {
  const response = await fetch(
    `${API_BASE_URL}/api/projects/${projectId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(projectData)
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update project");
  }

  return data;
}

// Soft-delete a project
export async function deleteProject(projectId, token) {
  const response = await fetch(
    `${API_BASE_URL}/api/projects/${projectId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete project");
  }

  return data;
}
// Edit a task's title, description and priority (Admin / project owner only)
export async function updateTaskDetails(projectId, taskId, token, taskData) {
  const response = await fetch(
    `${API_BASE_URL}/api/projects/${projectId}/tasks/${taskId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(taskData)
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update task");
  }

  return data;
}

// Soft-delete a task — audit history is preserved in the database
export async function deleteTask(projectId, taskId, token) {
  const response = await fetch(
    `${API_BASE_URL}/api/projects/${projectId}/tasks/${taskId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete task");
  }

  return data;
}

// Assign a task to a project member (Admin / project owner only)
export async function assignTask(projectId, taskId, token, userId) {
  const response = await fetch(
    `${API_BASE_URL}/api/projects/${projectId}/tasks/${taskId}/assign`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ userId })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to assign task");
  }

  return data;
}

// Update a task's workflow status
export async function updateTaskStatus(projectId, taskId, token, status) {
  const response = await fetch(
    `${API_BASE_URL}/api/projects/${projectId}/tasks/${taskId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update task status");
  }

  return data;
}

// Retrieve discussions / comments for a task
export async function getTaskComments(projectId, taskId, token) {
  const response = await fetch(
    `${API_BASE_URL}/api/projects/${projectId}/tasks/${taskId}/comments`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load comments");
  }

  return data;
}

// Add a discussion comment to a task
export async function addTaskComment(projectId, taskId, token, content) {
  const response = await fetch(
    `${API_BASE_URL}/api/projects/${projectId}/tasks/${taskId}/comments`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ content })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to post comment");
  }

  return data;
}

// Retrieve security review checklist for a task
export async function getSecurityReview(projectId, taskId, token) {
  const response = await fetch(
    `${API_BASE_URL}/api/projects/${projectId}/tasks/${taskId}/security-review`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load security review");
  }

  return data;
}

// Update security review checklist (Admin / project owner only)
export async function updateSecurityReview(projectId, taskId, token, checks) {
  const response = await fetch(
    `${API_BASE_URL}/api/projects/${projectId}/tasks/${taskId}/security-review`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(checks)
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update security review");
  }

  return data;
}

// Retrieve task-level audit history
export async function getTaskAuditLogs(projectId, taskId, token) {
  const response = await fetch(
    `${API_BASE_URL}/api/projects/${projectId}/tasks/${taskId}/audit-logs`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load task audit logs");
  }

  return data;
}

// Retrieve administrative project audit logs (Admin only)
export async function getAdminProjectAuditLogs(token) {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/audit-logs/projects`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load project audit logs");
  }

  return data;
}

// Retrieve administrative task audit logs (Admin only)
export async function getAdminTaskAuditLogs(token) {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/audit-logs/tasks`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load task audit logs");
  }

  return data;
}