import './App.css'
import { useEffect } from 'react'
import Pages from "@/pages/index.jsx"
import { Toaster } from "@/components/ui/toaster"
import apiClient from '@/api/apiClient'

function App() {
  useEffect(() => {
    // Check for OAuth token in URL (from Google OAuth redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      // Save token and clean up URL
      apiClient.setToken(token);
      
      // Get the return path or default to root
      const returnPath = localStorage.getItem('returnPath') || '/';
      localStorage.removeItem('returnPath');
      
      // Remove token from URL and redirect
      window.history.replaceState({}, document.title, returnPath);
    }
  }, []);

  return (
    <>
      <Pages />
      <Toaster />
    </>
  )
}

export default App 