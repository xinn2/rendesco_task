// import { useState, useEffect } from 'react';
import './App.css';
import { GridGreenness } from './components/GridGreenness';

const sampleData = {
  "startTime": "2025-03-30T12:00:00Z",
  "settlementPeriod": 25,
  "data": [
    { "fuelType": "BIOMASS", "generation": 338 },
    { "fuelType": "CCGT", "generation": 1959 },
    { "fuelType": "COAL", "generation": 0 },
    { "fuelType": "INTELEC", "generation": 419 },
    { "fuelType": "INTEW", "generation": -527 },
    { "fuelType": "INTFR", "generation": -123 },
    { "fuelType": "INTGRNL", "generation": -514 },
    { "fuelType": "INTIFA2", "generation": 119 },
    { "fuelType": "INTIRL", "generation": -451 },
    { "fuelType": "INTNED", "generation": 830 },
    { "fuelType": "INTNEM", "generation": 921 },
    { "fuelType": "INTNSL", "generation": -505 },
    { "fuelType": "INTVKL", "generation": -655 },
    { "fuelType": "NPSHYD", "generation": 315 },
    { "fuelType": "NUCLEAR", "generation": 3756 },
    { "fuelType": "OCGT", "generation": 1 },
    { "fuelType": "OIL", "generation": 0 },
    { "fuelType": "OTHER", "generation": 404 },
    { "fuelType": "PS", "generation": -1315 },
    { "fuelType": "WIND", "generation": 10993 },
  ], 
}

function App() {
  // const [sampleElexonData, setSampleElexonData] = useState(null);

  // const sampleFetch = async () => {
  //   try {
  //     const res = await fetch('API_ENDPOINT', {
  //       headers: { Accept: 'application/json' },
  //     });

  //     if (!res.ok) throw new Error('Failed to fetch data');
  //     const data = await res.json();
  //     console.log('Fetched data:', data);

  //     setSampleElexonData(data);
  //   } catch (error) {
  //       console.error('Error fetching data:', error);
  //   }
  // };

  // useEffect(() => {
  //   sampleFetch();
  // }, [])

  return (
    <div className="min-h-screen">
      <div className="mx-auto">
        <h1 className="text-xl font-semibold">NESO</h1>
        <GridGreenness snapshot={sampleData} fossilBaseline={0.5} />
      </div>
    </div>
  );
}

export default App
