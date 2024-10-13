import axios from 'axios';
import { useEffect, useState } from 'react';

export default function App() {
	const [location, setLocation] = useState();
	const [data, setData] = useState();
	const [error, setError] = useState();

	useEffect(() => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(pos) => console.log(null, pos.coords.latitude, pos.coords.longitude),
				(err) => console.log(err),
				{ enableHighAccuracy: true }
			);
		}
	}, []);

	useEffect(() => {
		fetchData();
	}, [location]);

	function fetchData(refresh) {
		setError();
		if (!location) return;
		if (refresh) {
			document.getElementById('refresh-btn').animate(
				{
					rotate: '180deg',
				},
				200
			);
		}
		axios
			.get('https://api.openweathermap.org/data/2.5/weather', {
				params: {
					lat: location.lat,
					lon: location.lon,
					appid: import.meta.env.VITE_OW_API_KEY,
					lang: 'cz',
					units: 'metric',
				},
			})
			.then((res) => {
				setData(res.data);
			})
			.catch((err) => {
				console.log(err);
				setError('Při vyhledávání nastala chyba');
			});
	}

	function findLocation(e) {
		e.preventDefault();
		axios
			.get('http://api.openweathermap.org/geo/1.0/direct', {
				params: {
					q: document.getElementById('location').value,
					appid: import.meta.env.VITE_OW_API_KEY,
					lang: 'en',
					units: 'metric',
				},
			})
			.then((res) => {
				let { lat, lon, country, name } = res.data[0];
				setLocation({ lat, lon, country, name });
			})
			.catch((err) => {
				console.log(err);
				setError('Při vyhledávání nastala chyba');
			});
	}

	function findCoords(e, lat, lon) {
		if (e) e.preventDefault();
		if (!lat) lat = document.getElementById('lat').value;
		if (!lon) lon || document.getElementById('lon').value;

		axios
			.get('http://api.openweathermap.org/geo/1.0/reverse', {
				params: {
					lat,
					lon,
					appid: import.meta.env.VITE_OW_API_KEY,
				},
			})
			.then((res) => {
				if (!res.data[0]) return setLocation({ lat, lon });

				let { name, country } = res.data[0];
				if (res.data[0].local_names?.cs) name = res.data[0].local_names.cs;

				setLocation({ lat, lon, country, name });
			})
			.catch((err) => {
				console.log(err);
				setError('Při vyhledávání nastala chyba');
			});
	}

	function toLocale(text, round) {
		if (round && typeof text == 'number') text = Math.round(text);
		return text
			.toString()
			.replaceAll('.', ',')
			.replaceAll(/\B(?=(\d{3})+(?!\d))/g, ' ');
	}

	function calcDirection(deg) {
		let direction = Math.round(deg / 45);
		const directions = ['sever', 'severovýchod', 'východ', 'jihovýchod', 'jih', 'jihozápad', 'západ', 'severozápad'];
		return directions[direction];
	}

	function unixToTime(value) {
		let date = new Date(value * 1000);
		return date.getHours() + ':' + date.getMinutes().toLocaleString('en-US', { minimumIntegerDigits: 2 });
	}

	return (
		<div className='relative flex flex-col items-center pb-8 w-screen text-white'>
			<h1 className='my-4 font-bold text-5xl'>Počasí</h1>
			<form className='flex flex-col items-center my-2 w-1/2 max-sm:w-[90%] max-lg:w-2/3' onSubmit={findLocation}>
				<h2 className='mb-2 text-xl'>Hledat město</h2>
				<div className='flex w-full'>
					<input autoFocus id='location' placeholder='Zadej lokaci' className='flex-grow border-neutral-600 bg-neutral-700 p-2 border border-r-0 rounded-l-xl rounded-r-none text-gray-300 caret-gray-400 outline-none' type='text' />
					<button className='bg-blue-500 px-6 py-2 border border-blue-500 rounded-l-none rounded-r-xl font-semibold'>Najít</button>
				</div>
			</form>
			<form className='flex flex-col items-center m-4 w-1/2 max-lg:w-2/3' onSubmit={findCoords}>
				<h2 className='mb-2 text-xl'>Hledat podle souřadnic</h2>
				<div className='flex my-4 w-full'>
					<input id='lat' placeholder='Z. šířka' className='border-neutral-600 bg-neutral-700 mx-2 p-2 border rounded-xl w-1/2 text-gray-300 caret-gray-400 outline-none' type='text' />
					<input id='lon' placeholder='Z. délka' className='border-neutral-600 bg-neutral-700 mx-2 p-2 border rounded-xl w-1/2 text-gray-300 caret-gray-400 outline-none' type='text' />
				</div>
				<button className='bg-blue-500 py-2 border border-blue-500 rounded-xl w-full font-semibold'>Najít</button>
			</form>
			{error && <p className='my-2 text-red-400'>{error}</p>}
			<div className='bg-neutral-600 my-2 w-[90%] h-px'></div>
			<div className='mt-6 mb-12'>
				{location && (
					<div className='relative flex items-center'>
						<h1 className='font-bold text-5xl text-center'>{location.name ? `${location.name} (${location.country})` : 'Neznámá lokace'}</h1>
						<button className='-right-12 absolute px-1' onClick={(e) => fetchData(true)}>
							<i id='refresh-btn' className='text-2xl fa-arrows-rotate fa-solid'></i>
						</button>
					</div>
				)}
			</div>
			{data && (
				<div className='flex max-md:flex-col justify-between'>
					<div className='justify-items-center gap-y-1 grid grid-rows-1 mx-10 mb-16 h-fit'>
						<h1 className='mb-4 text-3xl'>
							<b>Teplota</b> {toLocale(data.main.temp, true)} °C
						</h1>
						<p className='text-lg'>
							<b>Min:</b> {toLocale(data.main.temp_min, true)} °C
						</p>
						<p className='text-lg'>
							<b>Max:</b> {toLocale(data.main.temp_max, true)} °C
						</p>
						<p className='text-lg'>
							<b>Pocitová:</b> {toLocale(data.main.feels_like, true)} °C
						</p>
					</div>
					<div className='justify-items-center gap-y-1 grid grid-rows-1 col-span-2 mx-10 mb-16 h-fit'>
						<h1 className='relative font-bold text-3xl'>
							Počasí
							{data?.weather[0] && <img className='inline' src={`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`} alt='Ikona počasí' />}
						</h1>

						<p className='relative bottom-2 font-bold text-xl'>{data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1)}</p>
						{[data.rain, data.snow].some((v) => v) ? (
							[data.rain, data.snow].map((v) => {
								return (
									<p className='text-lg'>
										<b>Srážky:</b> {toLocale(v['1h'])} mm/h
									</p>
								);
							})
						) : (
							<p className='text-lg'>
								<b>Srážky:</b> 0 mm/h
							</p>
						)}
						<p className='text-lg'>
							<b>Vítr:</b> {toLocale(data.wind.speed)} m/s (<b>směr</b> {calcDirection(data.wind.deg)})
						</p>
						<p className='text-lg'>
							<b>Vlhkost:</b> {data.main.humidity}%
						</p>
						<p className='text-lg'>
							<b>Oblačnost:</b> {data.clouds.all}%
						</p>
						<p className='text-lg'>
							<b>Tlak:</b> {data.main.pressure} hPa
						</p>
						<p className='text-lg'>
							<b>Viditelnost:</b> {toLocale(data.visibility)} km
						</p>
					</div>

					<div className='justify-items-center gap-y-1 grid grid-rows-1 mx-8 mb-16 h-fit'>
						<h1 className='mb-4 font-bold text-3xl'>Čas</h1>
						<p className='text-lg'>
							<b>Východ Slunce:</b> {unixToTime(data.sys.sunrise)}
						</p>
						<p className='text-lg'>
							<b>Západ Slunce:</b> {unixToTime(data.sys.sunset)}
						</p>
						<p className='text-lg'>
							<b>Časové pásmo:</b> {data.timezone > 0 && '+'}
							{data.timezone / 3600}
						</p>
					</div>
				</div>
			)}
		</div>
	);
}
