import { Map, Marker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useEffect, useState } from 'react';
import '../App.css';

function GMaps() {
	const [pos, setPos] = useState();
	const sw = useMapsLibrary('streetView');

	const place = { lat: 42.345573, lng: -71.098326 };

	useEffect(() => {
		if (!sw) return;
		const panorama = new sw.StreetViewPanorama(document.getElementById('panorama'), {
			position: place,
			pov: {
				heading: 0,
				pitch: 0,
			},
		});
	}, [sw]);

	useEffect(() => {
		if (!pos) return;
		const diff = (x, y) => Math.abs(Math.round((x / 180) * 40000 - (y / 180) * 40000));
		console.log(Math.floor(Math.hypot(diff(pos.lng, place.lng), diff(pos.lat, place.lat))) + 'km');
	}, [pos]);

	return (
		<div className='relative flex'>
			<APIProvider apiKey={import.meta.env.GMAPS_API_KEY} onLoad={() => console.log('Maps API has loaded.')}>
				<div className='right-5 bottom-5 z-10 absolute origin-bottom-right hover:scale-[2.5] w-[20vw] transition-transform aspect-video'>
					<Map streetViewControl={false} mapTypeControl={false} className='w-full h-full' onClick={(e) => setPos(e.detail.latLng)} gestureHandling='greedy' defaultZoom={1} defaultCenter={{ lat: 0, lng: 0 }}>
						{pos && <Marker position={pos} />}
					</Map>
				</div>

				<div className='z-0 w-screen h-screen' id='panorama'></div>
			</APIProvider>
		</div>
	);
}

export default GMaps;
