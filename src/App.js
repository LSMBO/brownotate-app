import './App.css';
import {createBrowserRouter, RouterProvider} from "react-router-dom"
import { UploadProgressProvider } from './UploadProgressContext';
import About from "./pages/About";
import Home from "./pages/Home";
import Settings from './pages/Settings';
import Footer from "./components/Footer"
import Header from "./components/Header"

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home/>
  },
  {
    path: '/about',
    element: <About/>
  },
  {
    path: '/settings',
    element: <Settings />
  }
])

export default function App() {
  return (
    <UploadProgressProvider>
      <Header />
      <RouterProvider router={router}/>
      <Footer />
    </UploadProgressProvider>
    
  )
}
