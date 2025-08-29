import './App.css';
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import About from './pages/About';
import Home from './pages/Home';
import Settings from './pages/Settings';
import AnnotationResults from './pages/AnnotationResults';
import MyAnnotations from './pages/MyAnnotations';
import Footer from './components/Footer';
import Header from './components/Header';
import { UserProvider } from './contexts/UserContext';
import { ParametersProvider } from './contexts/ParametersContext';
import { DBSearchProvider } from './contexts/DBSearchContext'
import { AnnotationsProvider } from './contexts/AnnotationsContext'

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
      <UserProvider>
        <AnnotationsProvider>
          <DBSearchProvider>
            <ParametersProvider>
              <Header />
              <Router>
                <Routes>
                  <Route path="/" element={isLoggedIn ? <Home /> : <Navigate to="/login" />} />
                  <Route path="/about" element={isLoggedIn ? <About /> : <Navigate to="/login" />} />
                  <Route path="/settings" element={isLoggedIn ? <Settings /> : <Navigate to="/login" />} />
                  <Route path="/my-annotations" element={isLoggedIn ? <MyAnnotations /> : <Navigate to="/login" />} />
                  <Route path="/my-annotations/:id" element={isLoggedIn ? <AnnotationResults /> : <Navigate to="/login" />} />
                  <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Router>
              <Footer />
            </ParametersProvider>
          </DBSearchProvider>
        </AnnotationsProvider>
      </UserProvider>
  );
}
