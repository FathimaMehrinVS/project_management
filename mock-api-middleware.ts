import type { Connect } from 'vite';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  name: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'completed';
  ownerId: string;
  ownerEmail: string;
  createdAt: string;
}

// In-memory mock database
const MOCK_USERS: User[] = [
  { id: 'user-admin', email: 'admin@example.com', role: 'admin', name: 'Alice Admin' },
  { id: 'user-manager', email: 'manager@example.com', role: 'manager', name: 'Bob Manager' },
  { id: 'user-regular-1', email: 'user@example.com', role: 'user', name: 'Charlie User' },
  { id: 'user-regular-2', email: 'user2@example.com', role: 'user', name: 'David User' },
];

let MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    title: 'Website Redesign',
    description: 'Redesign the corporate website with a modern dark theme and animations.',
    status: 'active',
    ownerId: 'user-regular-1',
    ownerEmail: 'user@example.com',
    createdAt: '2026-06-01T10:00:00.000Z',
  },
  {
    id: 'proj-2',
    title: 'Mobile App Beta',
    description: 'Gather feedback on the new React Native iOS/Android app.',
    status: 'draft',
    ownerId: 'user-regular-2',
    ownerEmail: 'user2@example.com',
    createdAt: '2026-06-05T14:30:00.000Z',
  },
  {
    id: 'proj-3',
    title: 'Q2 Marketing Campaign',
    description: 'Launch campaigns across search and social channels.',
    status: 'completed',
    ownerId: 'user-admin',
    ownerEmail: 'admin@example.com',
    createdAt: '2026-05-15T09:00:00.000Z',
  },
  {
    id: 'proj-4',
    title: 'Security Compliance Audit',
    description: 'Complete SOC2 Type II compliance audit checklist.',
    status: 'active',
    ownerId: 'user-manager',
    ownerEmail: 'manager@example.com',
    createdAt: '2026-06-10T11:15:00.000Z',
  },
];

// Helper to parse JSON body
function getRequestBody(req: any): Promise<any> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk: any) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

// Helper to extract and verify the user from authorization header
function getUserFromHeader(authHeader: string | undefined): User | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7);
  if (!token.startsWith('mock-jwt-token-for-')) {
    return null;
  }
  const email = token.replace('mock-jwt-token-for-', '').toLowerCase();
  let user = MOCK_USERS.find((u) => u.email.toLowerCase() === email);
  if (!user) {
    const role = email === 'admin@example.com'
      ? 'admin'
      : email === 'manager@example.com'
        ? 'manager'
        : 'user';
    user = {
      id: `user-${Date.now()}`,
      email,
      role,
      name: email.split('@')[0],
    };
    MOCK_USERS.push(user);
  }
  return user;
}

// Helper to send JSON response
function sendJSON(res: any, status: number, data: any) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// Vite Mock API plugin middleware
export function mockApiMiddleware(): Connect.NextHandleFunction {
  return async (req, res, next) => {
    const url = req.url || '';

    // Only handle routes starting with /api/v1
    if (!url.startsWith('/api/v1')) {
      return next();
    }

    const method = req.method || 'GET';
    const parsedUrl = new URL(url, 'http://localhost');
    const path = parsedUrl.pathname;

    console.log(`[Mock API] ${method} ${path}`);

    // --- ENDPOINT: POST /api/v1/auth/login ---
    if (path === '/api/v1/auth/login' && method === 'POST') {
      const { email, password } = await getRequestBody(req);

      if (!email || !password) {
        return sendJSON(res, 400, { error: 'Email and password are required' });
      }

      // In a real app we'd verify password. For mock purposes, we allow any password.
      let foundUser = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());

      if (!foundUser) {
        const role = email.toLowerCase() === 'admin@example.com'
          ? 'admin'
          : email.toLowerCase() === 'manager@example.com'
            ? 'manager'
            : 'user';

        foundUser = {
          id: `user-${Date.now()}`,
          email: email.toLowerCase(),
          role,
          name: email.split('@')[0],
        };
        MOCK_USERS.push(foundUser);
      }

      // Generate a mock JWT token that embeds the user email
      const accessToken = `mock-jwt-token-for-${foundUser.email}`;

      return sendJSON(res, 200, {
        accessToken,
        user: {
          id: foundUser.id,
          email: foundUser.email,
          role: foundUser.role,
          name: foundUser.name,
        },
      });
    }

    // Authenticate all other endpoints
    const currentUser = getUserFromHeader(req.headers['authorization'] as string);
    if (!currentUser) {
      return sendJSON(res, 401, { error: 'Unauthorized. Please provide a valid Authorization header.' });
    }

    // --- ENDPOINT: GET /api/v1/projects ---
    if (path === '/api/v1/projects' && method === 'GET') {
      // Role behavior:
      // admin, manager: see all projects
      // user: see only own projects
      if (currentUser.role === 'admin' || currentUser.role === 'manager') {
        return sendJSON(res, 200, MOCK_PROJECTS);
      } else {
        const userProjects = MOCK_PROJECTS.filter((p) => p.ownerId === currentUser.id);
        return sendJSON(res, 200, userProjects);
      }
    }

    // --- ENDPOINT: POST /api/v1/projects ---
    if (path === '/api/v1/projects' && method === 'POST') {
      const { title, description } = await getRequestBody(req);

      if (!title || typeof title !== 'string' || title.trim() === '') {
        return sendJSON(res, 422, { error: 'Title is required and cannot be empty' });
      }

      const newProject: Project = {
        id: `proj-${Date.now()}`,
        title: title.trim(),
        description: (description || '').trim(),
        status: 'draft', // defaults to draft as per requirements
        ownerId: currentUser.id,
        ownerEmail: currentUser.email,
        createdAt: new Date().toISOString(),
      };

      MOCK_PROJECTS.push(newProject);
      return sendJSON(res, 201, newProject);
    }

    // Regex match for project details /api/v1/projects/{id}
    const projectMatch = path.match(/^\/api\/v1\/projects\/([^/]+)$/);
    if (projectMatch) {
      const projectId = projectMatch[1];
      const projectIndex = MOCK_PROJECTS.findIndex((p) => p.id === projectId);

      if (projectIndex === -1) {
        return sendJSON(res, 404, { error: `Project with ID "${projectId}" not found` });
      }

      const project = MOCK_PROJECTS[projectIndex];

      // Verification of access rules:
      // A regular 'user' role can only view/interact with their own projects
      if (currentUser.role === 'user' && project.ownerId !== currentUser.id) {
        return sendJSON(res, 403, { error: 'You do not have permission to view or manage this project' });
      }

      // --- ENDPOINT: GET /api/v1/projects/{id} ---
      if (method === 'GET') {
        return sendJSON(res, 200, project);
      }

      // --- ENDPOINT: PUT /api/v1/projects/{id} ---
      if (method === 'PUT' || method === 'PATCH') {
        const { title, description, status } = await getRequestBody(req);

        // If title is explicitly provided, validate it
        if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
          return sendJSON(res, 422, { error: 'Title cannot be empty' });
        }

        // Validate status if provided
        if (status !== undefined && !['draft', 'active', 'completed'].includes(status)) {
          return sendJSON(res, 400, { error: 'Invalid status. Must be draft, active, or completed.' });
        }

        // Perform status transition checking if desired
        // E.g., once completed, a project cannot go back to draft (400 - Invalid state transitions)
        if (status && project.status === 'completed' && status === 'draft') {
          return sendJSON(res, 400, { error: 'Invalid state transition: Completed projects cannot revert to draft.' });
        }

        // Apply edits
        if (title !== undefined) project.title = title.trim();
        if (description !== undefined) project.description = description.trim();
        if (status !== undefined) project.status = status;

        return sendJSON(res, 200, project);
      }

      // --- ENDPOINT: DELETE /api/v1/projects/{id} ---
      if (method === 'DELETE') {
        // Only admin can delete projects
        if (currentUser.role !== 'admin') {
          return sendJSON(res, 403, { error: 'You do not have permission to delete projects. Admin access required.' });
        }

        MOCK_PROJECTS.splice(projectIndex, 1);
        return sendJSON(res, 200, { message: 'Project successfully deleted' });
      }
    }

    // If endpoint is not matched
    return sendJSON(res, 404, { error: `Mock endpoint not found: ${method} ${path}` });
  };
}
