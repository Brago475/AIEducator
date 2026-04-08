import { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';

export default function App() {
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return <RouterProvider router={router} />;
}