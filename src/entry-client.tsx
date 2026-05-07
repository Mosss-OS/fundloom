import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: '/', element: <div>Home Page</div> },
      { path: '/login', element: <div>Login Page</div> },
      { path: '/explore', element: <div>Explore Page</div> },
      { path: '/create', element: <div>Create Page</div> },
      { path: '/dashboard', element: <div>Dashboard Page</div> },
      { path: '/c/:id', element: <div>Campaign Page</div> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
