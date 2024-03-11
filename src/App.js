import './App.css';
import {createBrowserRouter, RouterProvider} from "react-router-dom"
import { UploadProgressProvider } from './UploadProgressContext';
import About from "./pages/About";
import DatabaseSearch from "./pages/DatabaseSearch";
import Home from "./pages/Home";
import Settings from './pages/Settings';


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
  },
  {
    path: '/database-search/:id',
    element: <DatabaseSearch />
  }
])

export default function App() {
  return (
    <UploadProgressProvider>
      <RouterProvider router={router}/>
    </UploadProgressProvider>
  )
}
