import { BrowserRouter as Router } from 'react-router-dom';
import { UserProvider } from '../src/contexts/UserContext';
import { AnnotationsProvider } from '../src/contexts/AnnotationsContext';
import { ParametersProvider } from '../src/contexts/ParametersContext';
import { FAParametersProvider } from '../src/contexts/FAParametersContext';
import { DBSearchProvider } from '../src/contexts/DBSearchContext';
import '../src/App.css';

export default function Wrapper({ children }) {
  return (
    <UserProvider>
      <AnnotationsProvider>
        <DBSearchProvider>
          <ParametersProvider>
            <FAParametersProvider>
              <Router>
                {children}
              </Router>
            </FAParametersProvider>
          </ParametersProvider>
        </DBSearchProvider>
      </AnnotationsProvider>
    </UserProvider>
  );
}
