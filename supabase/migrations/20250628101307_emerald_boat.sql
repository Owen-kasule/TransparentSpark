/*
  # Create Blog System with Analytics

  1. New Tables
    - `blog_posts`
      - `id` (text, primary key) - matches the existing blog post IDs
      - `title` (text)
      - `excerpt` (text)
      - `content` (text)
      - `date` (date)
      - `read_time` (text)
      - `category` (text)
      - `image_url` (text)
      - `images` (jsonb) - array of image URLs
      - `featured` (boolean)
      - `views` (integer, default 0)
      - `likes` (integer, default 0)
      - `tags` (jsonb) - array of tags
      - `author_name` (text)
      - `author_avatar` (text)
      - `author_bio` (text)
      - `published` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `blog_views`
      - `id` (uuid, primary key)
      - `blog_post_id` (text, references blog_posts)
      - `visitor_id` (text)
      - `user_agent` (text)
      - `referrer` (text)
      - `country` (text)
      - `city` (text)
      - `created_at` (timestamptz)

    - `blog_likes`
      - `id` (uuid, primary key)
      - `blog_post_id` (text, references blog_posts)
      - `visitor_id` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access
    - Add policies for authenticated admin write access

  3. Functions
    - Function to increment view count
    - Function to toggle like status
    - Trigger to update blog_posts.updated_at
*/

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id text PRIMARY KEY,
  title text NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  date date NOT NULL,
  read_time text NOT NULL,
  category text NOT NULL,
  image_url text NOT NULL,
  images jsonb NOT NULL DEFAULT '[]',
  featured boolean NOT NULL DEFAULT false,
  views integer NOT NULL DEFAULT 0,
  likes integer NOT NULL DEFAULT 0,
  tags jsonb NOT NULL DEFAULT '[]',
  author_name text NOT NULL,
  author_avatar text NOT NULL,
  author_bio text NOT NULL,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create blog_views table for detailed analytics
CREATE TABLE IF NOT EXISTS blog_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id text NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  visitor_id text NOT NULL,
  user_agent text,
  referrer text,
  country text,
  city text,
  created_at timestamptz DEFAULT now()
);

-- Create blog_likes table
CREATE TABLE IF NOT EXISTS blog_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id text NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  visitor_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(blog_post_id, visitor_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(featured);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_date ON blog_posts(date DESC);
CREATE INDEX IF NOT EXISTS idx_blog_views_post_id ON blog_views(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_blog_views_visitor ON blog_views(visitor_id);
CREATE INDEX IF NOT EXISTS idx_blog_views_created_at ON blog_views(created_at);
CREATE INDEX IF NOT EXISTS idx_blog_likes_post_id ON blog_likes(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_blog_likes_visitor ON blog_likes(visitor_id);

-- Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blog_posts
CREATE POLICY "Public can read published blog posts"
  ON blog_posts
  FOR SELECT
  TO public
  USING (published = true);

CREATE POLICY "Authenticated users can manage blog posts"
  ON blog_posts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for blog_views
CREATE POLICY "Public can insert blog views"
  ON blog_views
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read blog views"
  ON blog_views
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for blog_likes
CREATE POLICY "Public can manage their own likes"
  ON blog_likes
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read all likes"
  ON blog_likes
  FOR SELECT
  TO authenticated
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_blog_view(
  post_id text,
  visitor_id text,
  user_agent text DEFAULT NULL,
  referrer text DEFAULT NULL,
  country text DEFAULT NULL,
  city text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- Insert view record
  INSERT INTO blog_views (blog_post_id, visitor_id, user_agent, referrer, country, city)
  VALUES (post_id, visitor_id, user_agent, referrer, country, city);
  
  -- Update view count on blog post
  UPDATE blog_posts 
  SET views = views + 1 
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to toggle like status
CREATE OR REPLACE FUNCTION toggle_blog_like(
  post_id text,
  visitor_id text
)
RETURNS boolean AS $$
DECLARE
  like_exists boolean;
  new_like_count integer;
BEGIN
  -- Check if like already exists
  SELECT EXISTS(
    SELECT 1 FROM blog_likes 
    WHERE blog_post_id = post_id AND visitor_id = visitor_id
  ) INTO like_exists;
  
  IF like_exists THEN
    -- Remove like
    DELETE FROM blog_likes 
    WHERE blog_post_id = post_id AND visitor_id = visitor_id;
    
    -- Update like count
    UPDATE blog_posts 
    SET likes = likes - 1 
    WHERE id = post_id;
    
    RETURN false;
  ELSE
    -- Add like
    INSERT INTO blog_likes (blog_post_id, visitor_id)
    VALUES (post_id, visitor_id);
    
    -- Update like count
    UPDATE blog_posts 
    SET likes = likes + 1 
    WHERE id = post_id;
    
    RETURN true;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample blog posts data
INSERT INTO blog_posts (
  id, title, excerpt, content, date, read_time, category, image_url, images, featured, views, likes, tags, author_name, author_avatar, author_bio
) VALUES 
(
  '1',
  'Building Scalable React Applications',
  'Learn the best practices for structuring large React applications with proper state management and component architecture.',
  '# Building Scalable React Applications

When building large-scale React applications, proper architecture and state management become crucial for maintainability and performance.

## Component Architecture

The foundation of any scalable React application lies in its component architecture. Here are the key principles:

### 1. Component Composition
Break down complex UI into smaller, reusable components. Each component should have a single responsibility.

### 2. Props vs State
- Use props for data that flows down from parent components
- Use state for data that changes within the component
- Consider lifting state up when multiple components need access

### 3. Custom Hooks
Extract complex logic into custom hooks for reusability:

```javascript
const useUserData = (userId) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUser(userId).then(setUser).finally(() => setLoading(false));
  }, [userId]);
  
  return { user, loading };
};
```

## State Management

For large applications, consider these state management solutions:

### Context API
Perfect for theme, authentication, and other global state that doesn''t change frequently.

### Redux Toolkit
Ideal for complex state logic and when you need time-travel debugging.

### Zustand
A lightweight alternative that''s easier to set up than Redux.

## Performance Optimization

### React.memo
Prevent unnecessary re-renders of functional components:

```javascript
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* Complex rendering logic */}</div>;
});
```

### useMemo and useCallback
Optimize expensive calculations and prevent function recreation:

```javascript
const memoizedValue = useMemo(() => {
  return expensiveCalculation(a, b);
}, [a, b]);

const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

## Code Organization

### Feature-based Structure
Organize your code by features rather than file types:

```
src/
  features/
    auth/
      components/
      hooks/
      services/
    dashboard/
      components/
      hooks/
      services/
  shared/
    components/
    hooks/
    utils/
```

### Barrel Exports
Use index.js files to create clean import statements:

```javascript
// features/auth/index.js
export { LoginForm } from ''./components/LoginForm'';
export { useAuth } from ''./hooks/useAuth'';
export { authService } from ''./services/authService'';
```

## Testing Strategy

### Unit Tests
Test individual components and functions in isolation.

### Integration Tests
Test how components work together.

### E2E Tests
Test complete user workflows.

## Conclusion

Building scalable React applications requires careful planning and adherence to best practices. Focus on component composition, proper state management, performance optimization, and maintainable code organization.

Remember: **Start simple and refactor as your application grows**. Don''t over-engineer from the beginning, but be prepared to evolve your architecture as requirements change.',
  '2024-01-15',
  '8 min read',
  'React',
  'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=800',
  '["https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=800", "https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=800", "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800"]',
  true,
  2847,
  89,
  '["React", "JavaScript", "Architecture", "State Management", "Performance"]',
  'Owen Kasule',
  'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
  'Full-stack developer passionate about creating scalable web applications and sharing knowledge with the developer community.'
),
(
  '2',
  'Modern CSS Techniques for 2024',
  'Explore the latest CSS features including container queries, cascade layers, and modern layout techniques.',
  '# Modern CSS Techniques for 2024

CSS continues to evolve rapidly, bringing powerful new features that make styling more intuitive and maintainable.

## Container Queries

Container queries allow you to style elements based on their container''s size, not just the viewport:

```css
.card-container {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 1fr 2fr;
  }
}
```

## CSS Grid Subgrid

Subgrid allows nested grids to participate in their parent''s grid:

```css
.parent-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}

.child-grid {
  display: grid;
  grid-column: span 2;
  grid-template-columns: subgrid;
}
```

## Cascade Layers

Organize your CSS with explicit layering:

```css
@layer reset, base, components, utilities;

@layer base {
  h1 { font-size: 2rem; }
}

@layer components {
  .button { padding: 0.5rem 1rem; }
}
```

## CSS Nesting

Write nested CSS natively:

```css
.card {
  padding: 1rem;
  
  & .title {
    font-size: 1.5rem;
    
    &:hover {
      color: blue;
    }
  }
}
```

## Custom Properties (CSS Variables)

Create dynamic, themeable designs:

```css
:root {
  --primary-color: #007bff;
  --spacing-unit: 1rem;
}

.button {
  background: var(--primary-color);
  padding: var(--spacing-unit);
}
```

## Logical Properties

Write CSS that works with different writing modes:

```css
.element {
  margin-inline-start: 1rem; /* Instead of margin-left */
  padding-block: 2rem; /* Instead of padding-top and padding-bottom */
}
```

## Modern Layout Techniques

### Flexbox Gap
Use gap property with flexbox:

```css
.flex-container {
  display: flex;
  gap: 1rem;
}
```

### Aspect Ratio
Maintain consistent aspect ratios:

```css
.video-container {
  aspect-ratio: 16 / 9;
}
```

## Color Functions

Use modern color functions for better color manipulation:

```css
.element {
  background: oklch(70% 0.15 180);
  border: 1px solid color-mix(in srgb, blue 50%, red);
}
```

## Conclusion

These modern CSS features provide powerful tools for creating responsive, maintainable, and beautiful web interfaces. Start incorporating them into your projects to stay ahead of the curve.',
  '2024-01-10',
  '6 min read',
  'CSS',
  'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
  '["https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800", "https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=800"]',
  false,
  1923,
  67,
  '["CSS", "Web Design", "Layout", "Modern CSS", "Frontend"]',
  'Owen Kasule',
  'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
  'Full-stack developer passionate about creating scalable web applications and sharing knowledge with the developer community.'
),
(
  '3',
  'TypeScript Best Practices',
  'Master TypeScript with advanced patterns, utility types, and configuration strategies for better code quality.',
  '# TypeScript Best Practices

TypeScript has become essential for building robust JavaScript applications. Here are the best practices for 2024.

## Type Definitions

### Interface vs Type
Use interfaces for object shapes that might be extended:

```typescript
interface User {
  id: string;
  name: string;
}

interface AdminUser extends User {
  permissions: string[];
}
```

Use type aliases for unions, primitives, and computed types:

```typescript
type Status = ''loading'' | ''success'' | ''error'';
type UserKeys = keyof User;
```

## Utility Types

### Built-in Utility Types
Leverage TypeScript''s built-in utility types:

```typescript
// Make all properties optional
type PartialUser = Partial<User>;

// Make all properties required
type RequiredUser = Required<User>;

// Pick specific properties
type UserSummary = Pick<User, ''id'' | ''name''>;

// Omit specific properties
type CreateUser = Omit<User, ''id''>;
```

### Custom Utility Types
Create your own utility types:

```typescript
type NonNullable<T> = T extends null | undefined ? never : T;
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};
```

## Generic Constraints

Use constraints to limit generic types:

```typescript
interface Identifiable {
  id: string;
}

function updateEntity<T extends Identifiable>(entity: T, updates: Partial<T>): T {
  return { ...entity, ...updates };
}
```

## Conditional Types

Create types that depend on conditions:

```typescript
type ApiResponse<T> = T extends string 
  ? { message: T } 
  : { data: T };

type StringResponse = ApiResponse<string>; // { message: string }
type DataResponse = ApiResponse<User>; // { data: User }
```

## Mapped Types

Transform existing types:

```typescript
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type CreateUserInput = Optional<User, ''id''>;
```

## Type Guards

Create runtime type checking:

```typescript
function isUser(obj: unknown): obj is User {
  return typeof obj === ''object'' && 
         obj !== null && 
         ''id'' in obj && 
         ''name'' in obj;
}

function processUser(data: unknown) {
  if (isUser(data)) {
    // TypeScript knows data is User here
    console.log(data.name);
  }
}
```

## Configuration

### Strict Mode
Always enable strict mode in tsconfig.json:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

### Path Mapping
Use path mapping for cleaner imports:

```json
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@components/*": ["components/*"],
      "@utils/*": ["utils/*"]
    }
  }
}
```

## Error Handling

### Result Type Pattern
Use Result types for better error handling:

```typescript
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

async function fetchUser(id: string): Promise<Result<User>> {
  try {
    const user = await api.getUser(id);
    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}
```

## Performance Tips

### Type-only Imports
Use type-only imports when possible:

```typescript
import type { User } from ''./types'';
import { processUser } from ''./utils'';
```

### Avoid Any
Never use `any`. Use `unknown` instead:

```typescript
// Bad
function process(data: any) { }

// Good
function process(data: unknown) {
  if (typeof data === ''string'') {
    // TypeScript knows data is string here
  }
}
```

## Conclusion

TypeScript''s type system is powerful and flexible. By following these best practices, you''ll write more maintainable and bug-free code. Remember to leverage the type system to catch errors at compile time rather than runtime.',
  '2024-01-05',
  '10 min read',
  'TypeScript',
  'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=800',
  '["https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=800", "https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=800"]',
  true,
  3156,
  124,
  '["TypeScript", "JavaScript", "Types", "Best Practices", "Development"]',
  'Owen Kasule',
  'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
  'Full-stack developer passionate about creating scalable web applications and sharing knowledge with the developer community.'
),
(
  '4',
  'Node.js Performance Optimization',
  'Techniques to optimize Node.js applications for better performance, scalability, and resource management.',
  '# Node.js Performance Optimization

Node.js applications can handle thousands of concurrent connections, but proper optimization is key to achieving peak performance.

## Event Loop Optimization

### Understanding the Event Loop
The event loop is the heart of Node.js. Keep it unblocked:

```javascript
// Bad - blocks the event loop
function heavyComputation() {
  let result = 0;
  for (let i = 0; i < 10000000; i++) {
    result += i;
  }
  return result;
}

// Good - use worker threads for CPU-intensive tasks
const { Worker, isMainThread, parentPort } = require(''worker_threads'');

if (isMainThread) {
  const worker = new Worker(__filename);
  worker.postMessage(10000000);
  worker.on(''message'', (result) => {
    console.log(''Result:'', result);
  });
} else {
  parentPort.on(''message'', (n) => {
    let result = 0;
    for (let i = 0; i < n; i++) {
      result += i;
    }
    parentPort.postMessage(result);
  });
}
```

## Memory Management

### Avoid Memory Leaks
Common sources of memory leaks and how to avoid them:

```javascript
// Bad - creates memory leak
const cache = {};
function addToCache(key, value) {
  cache[key] = value; // Never cleaned up
}

// Good - use Map with size limit
class LRUCache {
  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }
  
  set(key, value) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
}
```

### Monitor Memory Usage
```javascript
function logMemoryUsage() {
  const usage = process.memoryUsage();
  console.log({
    rss: `${Math.round(usage.rss / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)} MB`,
    external: `${Math.round(usage.external / 1024 / 1024)} MB`
  });
}

setInterval(logMemoryUsage, 5000);
```

## Database Optimization

### Connection Pooling
```javascript
const mysql = require(''mysql2/promise'');

const pool = mysql.createPool({
  host: ''localhost'',
  user: ''user'',
  password: ''password'',
  database: ''mydb'',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Use the pool
async function getUser(id) {
  const [rows] = await pool.execute(''SELECT * FROM users WHERE id = ?'', [id]);
  return rows[0];
}
```

### Query Optimization
```javascript
// Bad - N+1 query problem
async function getUsersWithPosts() {
  const users = await User.findAll();
  for (const user of users) {
    user.posts = await Post.findAll({ where: { userId: user.id } });
  }
  return users;
}

// Good - use joins or includes
async function getUsersWithPosts() {
  return await User.findAll({
    include: [{ model: Post }]
  });
}
```

## Caching Strategies

### In-Memory Caching
```javascript
const NodeCache = require(''node-cache'');
const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes

async function getCachedUser(id) {
  const cacheKey = `user:${id}`;
  let user = cache.get(cacheKey);
  
  if (!user) {
    user = await User.findById(id);
    cache.set(cacheKey, user);
  }
  
  return user;
}
```

### Redis Caching
```javascript
const redis = require(''redis'');
const client = redis.createClient();

async function getCachedData(key) {
  try {
    const cached = await client.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
    
    const data = await fetchDataFromDB(key);
    await client.setex(key, 3600, JSON.stringify(data)); // 1 hour TTL
    return data;
  } catch (error) {
    console.error(''Cache error:'', error);
    return await fetchDataFromDB(key);
  }
}
```

## HTTP Optimization

### Compression
```javascript
const express = require(''express'');
const compression = require(''compression'');

const app = express();

// Enable gzip compression
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers[''x-no-compression'']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));
```

### HTTP/2 Support
```javascript
const http2 = require(''http2'');
const fs = require(''fs'');

const server = http2.createSecureServer({
  key: fs.readFileSync(''private-key.pem''),
  cert: fs.readFileSync(''certificate.pem'')
});

server.on(''stream'', (stream, headers) => {
  stream.respond({
    ''content-type'': ''text/html'',
    '':status'': 200
  });
  stream.end(''<h1>Hello HTTP/2!</h1>'');
});
```

## Monitoring and Profiling

### Performance Monitoring
```javascript
const performanceObserver = require(''perf_hooks'').PerformanceObserver;

const obs = new performanceObserver((items) => {
  items.getEntries().forEach((entry) => {
    console.log(`${entry.name}: ${entry.duration}ms`);
  });
});

obs.observe({ entryTypes: [''measure'', ''mark''] });

// Mark performance points
performance.mark(''start-operation'');
await someAsyncOperation();
performance.mark(''end-operation'');
performance.measure(''operation-duration'', ''start-operation'', ''end-operation'');
```

### Health Checks
```javascript
app.get(''/health'', async (req, res) => {
  const health = {
    uptime: process.uptime(),
    message: ''OK'',
    timestamp: Date.now(),
    checks: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      memory: checkMemory()
    }
  };
  
  const status = Object.values(health.checks).every(check => check.status === ''OK'') ? 200 : 503;
  res.status(status).json(health);
});
```

## Clustering

### Using Cluster Module
```javascript
const cluster = require(''cluster'');
const numCPUs = require(''os'').cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);
  
  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  cluster.on(''exit'', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork(); // Restart worker
  });
} else {
  // Workers can share any TCP port
  require(''./app.js'');
  console.log(`Worker ${process.pid} started`);
}
```

## Conclusion

Node.js performance optimization requires attention to the event loop, memory management, database queries, caching, and monitoring. Implement these techniques gradually and measure their impact on your specific use case.

Remember: **Measure first, optimize second**. Use profiling tools to identify actual bottlenecks before optimizing.',
  '2023-12-28',
  '12 min read',
  'Node.js',
  'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=800',
  '["https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=800", "https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=800"]',
  false,
  2134,
  78,
  '["Node.js", "Performance", "Optimization", "Backend", "JavaScript"]',
  'Owen Kasule',
  'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
  'Full-stack developer passionate about creating scalable web applications and sharing knowledge with the developer community.'
),
(
  '5',
  'Database Design Patterns',
  'Essential database design patterns and normalization techniques for building robust data architectures.',
  '# Database Design Patterns

Good database design is the foundation of any successful application. Here are essential patterns and techniques for 2024.

## Normalization vs Denormalization

### When to Normalize
Normalization reduces data redundancy and improves data integrity:

```sql
-- Normalized structure
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  bio TEXT
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### When to Denormalize
Denormalization improves read performance at the cost of storage:

```sql
-- Denormalized for read performance
CREATE TABLE post_summaries (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  author_name VARCHAR(200), -- Denormalized
  author_email VARCHAR(255), -- Denormalized
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Indexing Strategies

### Single Column Indexes
```sql
-- For frequent WHERE clauses
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_posts_created_at ON posts(created_at);
```

### Composite Indexes
```sql
-- For multi-column queries
CREATE INDEX idx_posts_user_date ON posts(user_id, created_at);

-- Query that benefits from this index
SELECT * FROM posts 
WHERE user_id = 123 
ORDER BY created_at DESC;
```

### Partial Indexes
```sql
-- Index only active records
CREATE INDEX idx_active_users ON users(email) 
WHERE active = true;
```

## Common Design Patterns

### Audit Trail Pattern
Track changes to important data:

```sql
CREATE TABLE user_audit (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  action VARCHAR(50) NOT NULL, -- INSERT, UPDATE, DELETE
  old_values JSONB,
  new_values JSONB,
  changed_by INTEGER REFERENCES users(id),
  changed_at TIMESTAMP DEFAULT NOW()
);

-- Trigger to populate audit table
CREATE OR REPLACE FUNCTION audit_user_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = ''DELETE'' THEN
    INSERT INTO user_audit (user_id, action, old_values, changed_at)
    VALUES (OLD.id, ''DELETE'', row_to_json(OLD), NOW());
    RETURN OLD;
  ELSIF TG_OP = ''UPDATE'' THEN
    INSERT INTO user_audit (user_id, action, old_values, new_values, changed_at)
    VALUES (NEW.id, ''UPDATE'', row_to_json(OLD), row_to_json(NEW), NOW());
    RETURN NEW;
  ELSIF TG_OP = ''INSERT'' THEN
    INSERT INTO user_audit (user_id, action, new_values, changed_at)
    VALUES (NEW.id, ''INSERT'', row_to_json(NEW), NOW());
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_user_changes();
```

### Soft Delete Pattern
Mark records as deleted instead of removing them:

```sql
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP NULL;

-- Create index for active users
CREATE INDEX idx_users_active ON users(id) WHERE deleted_at IS NULL;

-- Query active users
SELECT * FROM users WHERE deleted_at IS NULL;

-- Soft delete function
CREATE OR REPLACE FUNCTION soft_delete_user(user_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE users 
  SET deleted_at = NOW() 
  WHERE id = user_id AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql;
```

### Polymorphic Associations
Handle relationships to multiple table types:

```sql
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  commentable_type VARCHAR(50) NOT NULL, -- ''post'', ''photo'', etc.
  commentable_id INTEGER NOT NULL,
  user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for polymorphic queries
CREATE INDEX idx_comments_polymorphic 
ON comments(commentable_type, commentable_id);

-- Query comments for a specific post
SELECT * FROM comments 
WHERE commentable_type = ''post'' AND commentable_id = 123;
```

## Performance Patterns

### Read Replicas
Separate read and write operations:

```javascript
const { Pool } = require(''pg'');

const writePool = new Pool({
  host: ''primary-db.example.com'',
  database: ''myapp'',
  user: ''writer'',
  password: ''password''
});

const readPool = new Pool({
  host: ''replica-db.example.com'',
  database: ''myapp'',
  user: ''reader'',
  password: ''password''
});

class DatabaseService {
  async write(query, params) {
    return await writePool.query(query, params);
  }
  
  async read(query, params) {
    return await readPool.query(query, params);
  }
}
```

### Connection Pooling
Manage database connections efficiently:

```javascript
const pool = new Pool({
  host: ''localhost'',
  database: ''myapp'',
  user: ''user'',
  password: ''password'',
  max: 20, // Maximum number of connections
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Return error after 2 seconds if no connection available
});

// Proper connection handling
async function queryDatabase(sql, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    return result.rows;
  } finally {
    client.release(); // Always release the connection
  }
}
```

## Data Modeling Patterns

### Event Sourcing
Store events instead of current state:

```sql
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  aggregate_id UUID NOT NULL,
  aggregate_type VARCHAR(100) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB NOT NULL,
  version INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ensure event ordering
CREATE UNIQUE INDEX idx_events_aggregate_version 
ON events(aggregate_id, version);

-- Example events
INSERT INTO events (aggregate_id, aggregate_type, event_type, event_data, version)
VALUES 
  (''123e4567-e89b-12d3-a456-426614174000'', ''User'', ''UserCreated'', 
   ''{"email": "user@example.com", "name": "John Doe"}'', 1),
  (''123e4567-e89b-12d3-a456-426614174000'', ''User'', ''EmailChanged'', 
   ''{"old_email": "user@example.com", "new_email": "john@example.com"}'', 2);
```

### CQRS (Command Query Responsibility Segregation)
Separate read and write models:

```sql
-- Write model (normalized)
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER,
  price DECIMAL(10,2)
);

-- Read model (denormalized for queries)
CREATE TABLE order_summaries (
  order_id INTEGER PRIMARY KEY,
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  total_amount DECIMAL(10,2),
  item_count INTEGER,
  status VARCHAR(50),
  created_at TIMESTAMP
);

-- Materialized view for complex queries
CREATE MATERIALIZED VIEW monthly_sales AS
SELECT 
  DATE_TRUNC(''month'', created_at) as month,
  COUNT(*) as order_count,
  SUM(total_amount) as total_revenue
FROM order_summaries
GROUP BY DATE_TRUNC(''month'', created_at);

-- Refresh the view periodically
REFRESH MATERIALIZED VIEW monthly_sales;
```

## Schema Migration Patterns

### Safe Migrations
Always write reversible migrations:

```sql
-- Migration: Add new column
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- Rollback
ALTER TABLE users DROP COLUMN phone;

-- Migration: Rename column (safe approach)
-- Step 1: Add new column
ALTER TABLE users ADD COLUMN full_name VARCHAR(255);

-- Step 2: Populate new column
UPDATE users SET full_name = CONCAT(first_name, '' '', last_name);

-- Step 3: (After deployment) Drop old columns
ALTER TABLE users DROP COLUMN first_name, DROP COLUMN last_name;
```

## Conclusion

Good database design requires understanding your data access patterns, performance requirements, and scalability needs. Start with normalized structures and denormalize strategically based on actual performance measurements.

Key principles:
- **Normalize for data integrity**
- **Denormalize for performance**
- **Index strategically**
- **Plan for scale**
- **Monitor and optimize**',
  '2023-12-20',
  '9 min read',
  'Database',
  'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=800',
  '["https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=800", "https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=800"]',
  false,
  1876,
  92,
  '["Database", "SQL", "Design Patterns", "Performance", "Architecture"]',
  'Owen Kasule',
  'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
  'Full-stack developer passionate about creating scalable web applications and sharing knowledge with the developer community.'
),
(
  '6',
  'Web Performance Optimization',
  'Complete guide to optimizing web performance including Core Web Vitals, lazy loading, and caching strategies.',
  '# Web Performance Optimization

Web performance directly impacts user experience, SEO rankings, and business metrics. This comprehensive guide covers modern optimization techniques.

## Core Web Vitals

### Largest Contentful Paint (LCP)
Optimize the loading of your largest content element:

```html
<!-- Preload critical resources -->
<link rel="preload" href="/hero-image.jpg" as="image">
<link rel="preload" href="/critical.css" as="style">

<!-- Optimize images -->
<img src="/hero-image.webp" 
     alt="Hero image"
     width="800" 
     height="600"
     loading="eager"
     fetchpriority="high">
```

### First Input Delay (FID)
Minimize JavaScript execution time:

```javascript
// Bad - blocks main thread
function heavyCalculation() {
  let result = 0;
  for (let i = 0; i < 10000000; i++) {
    result += Math.random();
  }
  return result;
}

// Good - use requestIdleCallback
function optimizedCalculation() {
  return new Promise((resolve) => {
    requestIdleCallback(() => {
      let result = 0;
      const startTime = performance.now();
      
      for (let i = 0; i < 10000000; i++) {
        result += Math.random();
        
        // Yield control if we''ve been running too long
        if (performance.now() - startTime > 5) {
          setTimeout(() => resolve(optimizedCalculation()), 0);
          return;
        }
      }
      resolve(result);
    });
  });
}
```

### Cumulative Layout Shift (CLS)
Prevent unexpected layout shifts:

```css
/* Reserve space for images */
.image-container {
  aspect-ratio: 16 / 9;
  background-color: #f0f0f0;
}

/* Use transform for animations */
.animated-element {
  transform: translateX(0);
  transition: transform 0.3s ease;
}

.animated-element:hover {
  transform: translateX(10px); /* Instead of changing left/right */
}
```

## Image Optimization

### Modern Image Formats
```html
<picture>
  <source srcset="/image.avif" type="image/avif">
  <source srcset="/image.webp" type="image/webp">
  <img src="/image.jpg" alt="Description" loading="lazy">
</picture>
```

### Responsive Images
```html
<img src="/image-800.jpg"
     srcset="/image-400.jpg 400w,
             /image-800.jpg 800w,
             /image-1200.jpg 1200w"
     sizes="(max-width: 600px) 400px,
            (max-width: 1000px) 800px,
            1200px"
     alt="Responsive image"
     loading="lazy">
```

### Lazy Loading Implementation
```javascript
// Intersection Observer for lazy loading
const imageObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.remove(''lazy'');
      observer.unobserve(img);
    }
  });
});

document.querySelectorAll(''img[data-src]'').forEach(img => {
  imageObserver.observe(img);
});
```

## JavaScript Optimization

### Code Splitting
```javascript
// Dynamic imports for code splitting
const loadChart = async () => {
  const { Chart } = await import(''./chart.js'');
  return new Chart();
};

// Route-based splitting
const routes = [
  {
    path: ''/dashboard'',
    component: () => import(''./Dashboard.vue'')
  },
  {
    path: ''/profile'',
    component: () => import(''./Profile.vue'')
  }
];
```

### Tree Shaking
```javascript
// Import only what you need
import { debounce } from ''lodash-es''; // Instead of entire lodash

// Use ES modules
export const utils = {
  formatDate: (date) => { /* ... */ },
  formatCurrency: (amount) => { /* ... */ }
};

// Import specific functions
import { formatDate } from ''./utils.js'';
```

### Service Workers
```javascript
// Register service worker
if (''serviceWorker'' in navigator) {
  navigator.serviceWorker.register(''/sw.js'');
}

// Service worker (sw.js)
const CACHE_NAME = ''app-v1'';
const urlsToCache = [
  ''/'',
  ''/styles/main.css'',
  ''/scripts/main.js''
];

self.addEventListener(''install'', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener(''fetch'', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});
```

## CSS Optimization

### Critical CSS
```html
<!-- Inline critical CSS -->
<style>
  /* Above-the-fold styles */
  .header { /* ... */ }
  .hero { /* ... */ }
</style>

<!-- Load non-critical CSS asynchronously -->
<link rel="preload" href="/styles/main.css" as="style" onload="this.onload=null;this.rel=''stylesheet''">
<noscript><link rel="stylesheet" href="/styles/main.css"></noscript>
```

### CSS Containment
```css
.component {
  contain: layout style paint;
}

.isolated-component {
  contain: strict; /* layout + style + paint + size */
}
```

## Caching Strategies

### HTTP Caching
```javascript
// Express.js caching headers
app.use(''/static'', express.static(''public'', {
  maxAge: ''1y'', // Cache static assets for 1 year
  etag: true,
  lastModified: true
}));

app.get(''/api/data'', (req, res) => {
  res.set({
    ''Cache-Control'': ''public, max-age=300'', // 5 minutes
    ''ETag'': generateETag(data)
  });
  res.json(data);
});
```

### Browser Caching
```javascript
// Cache API
const cache = await caches.open(''api-cache'');

async function fetchWithCache(url) {
  const cachedResponse = await cache.match(url);
  
  if (cachedResponse) {
    // Check if cache is still fresh
    const cacheTime = new Date(cachedResponse.headers.get(''date''));
    const now = new Date();
    const maxAge = 5 * 60 * 1000; // 5 minutes
    
    if (now - cacheTime < maxAge) {
      return cachedResponse;
    }
  }
  
  const response = await fetch(url);
  cache.put(url, response.clone());
  return response;
}
```

## Performance Monitoring

### Web Vitals Measurement
```javascript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from ''web-vitals'';

function sendToAnalytics(metric) {
  // Send to your analytics service
  gtag(''event'', metric.name, {
    value: Math.round(metric.name === ''CLS'' ? metric.value * 1000 : metric.value),
    event_label: metric.id,
    non_interaction: true,
  });
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### Performance Observer
```javascript
// Monitor long tasks
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.duration > 50) {
      console.warn(''Long task detected:'', entry);
    }
  }
});

observer.observe({ entryTypes: [''longtask''] });

// Monitor resource loading
const resourceObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.duration > 1000) {
      console.warn(''Slow resource:'', entry.name, entry.duration);
    }
  }
});

resourceObserver.observe({ entryTypes: [''resource''] });
```

## Network Optimization

### Resource Hints
```html
<!-- DNS prefetch for external domains -->
<link rel="dns-prefetch" href="//fonts.googleapis.com">

<!-- Preconnect for critical third-party origins -->
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- Prefetch resources for next page -->
<link rel="prefetch" href="/next-page.html">

<!-- Preload critical resources -->
<link rel="preload" href="/critical-font.woff2" as="font" type="font/woff2" crossorigin>
```

### HTTP/2 Optimization
```javascript
// Server push (Node.js with HTTP/2)
const http2 = require(''http2'');

const server = http2.createSecureServer(options);

server.on(''stream'', (stream, headers) => {
  if (headers['':path''] === ''/'') {
    // Push critical resources
    stream.pushStream({ '':path'': ''/critical.css'' }, (err, pushStream) => {
      if (!err) {
        pushStream.respondWithFile(''/path/to/critical.css'');
      }
    });
    
    stream.respondWithFile(''/path/to/index.html'');
  }
});
```

## Performance Budget

### Webpack Bundle Analysis
```javascript
// webpack.config.js
module.exports = {
  performance: {
    maxAssetSize: 250000, // 250kb
    maxEntrypointSize: 250000,
    hints: ''warning''
  },
  optimization: {
    splitChunks: {
      chunks: ''all'',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: ''vendors'',
          chunks: ''all'',
        },
      },
    },
  },
};
```

## Conclusion

Web performance optimization is an ongoing process that requires monitoring, measuring, and iterating. Focus on:

1. **Core Web Vitals** - LCP, FID, CLS
2. **Critical rendering path** optimization
3. **Resource optimization** - images, fonts, scripts
4. **Caching strategies**
5. **Performance monitoring**

Remember: **Measure first, optimize second**. Use tools like Lighthouse, WebPageTest, and Chrome DevTools to identify bottlenecks before optimizing.',
  '2023-12-15',
  '11 min read',
  'Performance',
  'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=800',
  '["https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=800", "https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=800"]',
  true,
  2567,
  103,
  '["Performance", "Web Vitals", "Optimization", "Frontend", "UX"]',
  'Owen Kasule',
  'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
  'Full-stack developer passionate about creating scalable web applications and sharing knowledge with the developer community.'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  date = EXCLUDED.date,
  read_time = EXCLUDED.read_time,
  category = EXCLUDED.category,
  image_url = EXCLUDED.image_url,
  images = EXCLUDED.images,
  featured = EXCLUDED.featured,
  views = EXCLUDED.views,
  likes = EXCLUDED.likes,
  tags = EXCLUDED.tags,
  author_name = EXCLUDED.author_name,
  author_avatar = EXCLUDED.author_avatar,
  author_bio = EXCLUDED.author_bio,
  updated_at = now();