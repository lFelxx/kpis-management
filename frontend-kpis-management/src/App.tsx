import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './presentation/routes/AppRouter';

function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;
