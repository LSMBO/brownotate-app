import './App.css';
import {createBrowserRouter, RouterProvider} from "react-router-dom"
import About from "./pages/About";
import DatabaseSearch from "./pages/DatabaseSearch";
import Home from "./pages/Home";


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
