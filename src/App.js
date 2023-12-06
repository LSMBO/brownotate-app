import './App.css';
import {createBrowserRouter, RouterProvider} from "react-router-dom"
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
  //state

  //comportements


  //affichage (render)
  return <RouterProvider router={router}/>
}
