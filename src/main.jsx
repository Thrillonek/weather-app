import { APIProvider } from '@vis.gl/react-google-maps';
import 'dotenv';
import { createRoot } from 'react-dom/client';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import App from './App.jsx';
import GMaps from './components/GMaps.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
	<Router>
		<Routes>
			<Route path='/gmaps' element={<GMaps />} />
			<Route path='/' element={<App />} />
		</Routes>
	</Router>
);
