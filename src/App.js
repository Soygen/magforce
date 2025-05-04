import React, { useState } from 'react';
import { Calculator, Magnet, AlertCircle } from 'lucide-react';

const MagnetCalculator = () => {
  const [grade, setGrade] = useState('N42');
  const [shape, setShape] = useState('cylinder');
  const [diameter, setDiameter] = useState('10');
  const [length, setLength] = useState('5');
  const [width, setWidth] = useState('10');
  const [height, setHeight] = useState('10');
  const [thickness, setThickness] = useState('5');
  const [configuration, setConfiguration] = useState('magnet-to-steel');
  const [airGap, setAirGap] = useState('0');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Magnetic remanence values for different grades (in Tesla)
  const gradeProperties = {
    'N35': { Br: 1.17, HcJ: 955 },
    'N38': { Br: 1.22, HcJ: 955 },
    'N40': { Br: 1.25, HcJ: 955 },
    'N42': { Br: 1.28, HcJ: 955 },
    'N45': { Br: 1.32, HcJ: 955 },
    'N48': { Br: 1.37, HcJ: 955 },
    'N50': { Br: 1.40, HcJ: 955 },
    'N52': { Br: 1.43, HcJ: 955 },
  };

  const calculatePullForce = () => {
    setError('');
    setResult(null);

    // Validate inputs
    const numDiameter = parseFloat(diameter);
    const numLength = parseFloat(length);
    const numWidth = parseFloat(width);
    const numHeight = parseFloat(height);
    const numThickness = parseFloat(thickness);
    const numAirGap = parseFloat(airGap);

    if (shape === 'cylinder' && (isNaN(numDiameter) || isNaN(numThickness))) {
      setError('Please enter valid dimensions for cylinder magnet');
      return;
    }

    if (shape === 'block' && (isNaN(numLength) || isNaN(numWidth) || isNaN(numHeight))) {
      setError('Please enter valid dimensions for block magnet');
      return;
    }

    if (isNaN(numAirGap) || numAirGap < 0) {
      setError('Please enter a valid air gap distance');
      return;
    }

    // Get magnet properties
    const magnetProps = gradeProperties[grade];
    const Br = magnetProps.Br;

    // Calculate surface area based on shape
    let surfaceArea;
    if (shape === 'cylinder') {
      surfaceArea = Math.PI * Math.pow(numDiameter / 2, 2); // mm²
    } else {
      surfaceArea = numLength * numWidth; // mm²
    }

    // Convert to m²
    surfaceArea = surfaceArea / 1000000;

    // Simplified pull force calculation
    // F = (B² × A × μ₀) / (2 × μ₀)
    // Where B is the magnetic field strength, A is the surface area
    // μ₀ is the permeability of free space (4π × 10⁻⁷)

    const mu0 = 4 * Math.PI * 1e-7;
    
    // Account for air gap - magnetic field decreases with distance
    // Using approximation B = Br × (1 / (1 + (gap/thickness)²))
    let magnetThickness = shape === 'cylinder' ? numThickness : numHeight;
    let effectiveB = Br * (1 / (1 + Math.pow(numAirGap / magnetThickness, 2)));

    // Configuration factor
    let configFactor = 1;
    if (configuration === 'magnet-to-magnet') {
      configFactor = 1.5; // Approximate increase for magnet-to-magnet
    }

    // Calculate pull force
    let pullForce = (Math.pow(effectiveB, 2) * surfaceArea) / (2 * mu0) * configFactor;

    // Convert to kg (divide by 9.81)
    pullForce = pullForce / 9.81;

    setResult({
      forceKg: pullForce.toFixed(2),
      forceN: (pullForce * 9.81).toFixed(2),
      forceLbs: (pullForce * 2.20462).toFixed(2)
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <Magnet className="w-8 h-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-800">Neodymium Magnet Pull Force Calculator</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Magnet Grade
            </label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.keys(gradeProperties).map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Magnet Shape
            </label>
            <select
              value={shape}
              onChange={(e) => setShape(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="cylinder">Cylinder/Disc</option>
              <option value="block">Block/Rectangle</option>
            </select>
          </div>

          {shape === 'cylinder' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diameter (mm)
                </label>
                <input
                  type="number"
                  value={diameter}
                  onChange={(e) => setDiameter(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thickness (mm)
                </label>
                <input
                  type="number"
                  value={thickness}
                  onChange={(e) => setThickness(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="5"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Length (mm)
                </label>
                <input
                  type="number"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Width (mm)
                </label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height (mm)
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="5"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Configuration
            </label>
            <select
              value={configuration}
              onChange={(e) => setConfiguration(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="magnet-to-steel">Magnet to Steel</option>
              <option value="magnet-to-magnet">Magnet to Magnet</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Air Gap (mm)
            </label>
            <input
              type="number"
              value={airGap}
              onChange={(e) => setAirGap(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
            />
          </div>

          <button
            onClick={calculatePullForce}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2"
          >
            <Calculator className="w-5 h-5" />
            Calculate Pull Force
          </button>
        </div>

        {/* Results Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Results</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Pull Force</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Kilograms</p>
                    <p className="text-xl font-bold text-blue-900">{result.forceKg} kg</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Newtons</p>
                    <p className="text-xl font-bold text-blue-900">{result.forceN} N</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pounds</p>
                    <p className="text-xl font-bold text-blue-900">{result.forceLbs} lbs</p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-amber-800 mb-2">Important Notes</h3>
                <ul className="text-sm text-amber-700 list-disc list-inside space-y-1">
                  <li>This is a theoretical calculation and actual pull force may vary</li>
                  <li>Surface condition and steel grade affect actual performance</li>
                  <li>Temperature can significantly impact magnet strength</li>
                  <li>Coating thickness is not accounted for in this calculation</li>
                </ul>
              </div>
            </div>
          )}

          {!result && !error && (
            <div className="text-gray-500 text-center py-8">
              <Magnet className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Enter magnet specifications and click calculate to see results</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 text-sm text-gray-600">
        <h3 className="font-semibold mb-2">About this Calculator</h3>
        <p>This calculator provides theoretical pull force estimates for neodymium magnets. The calculations use simplified formulas and should be used as a guide only. Actual pull force can vary significantly based on factors such as:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Steel grade and thickness</li>
          <li>Surface finish and flatness</li>
          <li>Operating temperature</li>
          <li>Magnet coating thickness</li>
          <li>Exact magnet composition and manufacturing quality</li>
        </ul>
      </div>
    </div>
  );
};

export default MagnetCalculator;