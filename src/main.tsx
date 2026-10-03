import { createRoot } from 'react-dom/client';
import { App } from './App';
import { configureService } from './services';
import { MockClinicService } from './services/mock';
import './styles.css';
configureService(new MockClinicService());
createRoot(document.getElementById('root')!).render(<App/>);