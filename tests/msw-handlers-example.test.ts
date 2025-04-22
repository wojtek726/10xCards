import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Define types
interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

// Example of data to use in handlers
const todos: Todo[] = [
  { id: '1', title: 'Learn Vitest', completed: false },
  { id: '2', title: 'Setup MSW', completed: true },
];

// Setup MSW server with handlers
const server = setupServer(
  // GET todos
  http.get('/api/todos', () => {
    return HttpResponse.json(todos);
  }),
  
  // GET single todo
  http.get('/api/todos/:id', ({ params }) => {
    const { id } = params;
    const todo = todos.find(t => t.id === id);
    
    if (!todo) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json(todo);
  }),
  
  // POST todo
  http.post('/api/todos', async ({ request }) => {
    const newTodo = await request.json() as Omit<Todo, 'id'>;
    const todo: Todo = {
      id: String(todos.length + 1),
      title: newTodo.title,
      completed: newTodo.completed,
    };
    
    todos.push(todo);
    return HttpResponse.json(todo, { status: 201 });
  })
);

// Mock fetch function for testing
async function fetchTodos(): Promise<Todo[]> {
  const response = await fetch('/api/todos');
  if (!response.ok) {
    throw new Error(`Error fetching todos: ${response.status}`);
  }
  return response.json();
}

describe('MSW Example', () => {
  // Start MSW Server before all tests
  beforeAll(() => {
    // Set quiet: true to avoid console output
    server.listen({ onUnhandledRequest: 'bypass' });
  });
  
  // Clean up after each test
  afterEach(() => {
    server.resetHandlers();
  });
  
  // Close server after all tests
  afterAll(() => {
    server.close();
  });
  
  it('fetches todos successfully', async () => {
    const data = await fetchTodos();
    expect(data).toHaveLength(2);
    expect(data[0].title).toBe('Learn Vitest');
    expect(data[1].title).toBe('Setup MSW');
  });
  
  it('handles server errors', async () => {
    // Override the handler for this test
    server.use(
      http.get('/api/todos', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );
    
    // This should now throw an error
    await expect(fetchTodos()).rejects.toThrow('Error fetching todos: 500');
  });
}); 