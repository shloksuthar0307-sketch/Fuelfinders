import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calculator as CalcIcon, FileText, TrendingUp, Share2, MapPin } from 'lucide-react';

const Calculator = () => {
  const [dailyKm, setDailyKm] = useState<number>(50);
  const [petrolMileage, setPetrolMileage] = useState<number>(15);
  const [cngMileage, setCngMileage] = useState<number>(20);
  const [petrolPrice, setPetrolPrice] = useState<number>(110);
  const [cngPrice, setCngPrice] = useState<number>(75);

  const calculateSIP = (monthlyInvestment: number, years: number, annualRate: number = 12) => {
    const monthlyRate = annualRate / 12 / 100;
    const months = years * 12;
    const futureValue = monthlyInvestment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    return futureValue;
  };

  const results = useMemo(() => {
    // Petrol calculations
    const petrolLitersPerDay = dailyKm / petrolMileage;
    const petrolCostPerDay = petrolLitersPerDay * petrolPrice;
    const petrolCostPerMonth = petrolCostPerDay * 30;
    const petrolLitersPerMonth = petrolLitersPerDay * 30;

    // CNG calculations
    const cngKgPerDay = dailyKm / cngMileage;
    const cngCostPerDay = cngKgPerDay * cngPrice;
    const cngCostPerMonth = cngCostPerDay * 30;
    const cngKgPerMonth = cngKgPerDay * 30;

    // Savings
    const monthlySavings = petrolCostPerMonth - cngCostPerMonth;
    const yearlySavings = monthlySavings * 12;

    // SIP (12% annual return)
    const sip5 = calculateSIP(monthlySavings, 5, 12);
    const sip10 = calculateSIP(monthlySavings, 10, 12);
    const sip20 = calculateSIP(monthlySavings, 20, 12);

    return {
      petrolCostPerMonth,
      petrolLitersPerMonth,
      cngCostPerMonth,
      cngKgPerMonth,
      monthlySavings,
      yearlySavings,
      sip5,
      sip10,
      sip20
    };
  }, [dailyKm, petrolMileage, cngMileage, petrolPrice, cngPrice]);

  const formatCurrency = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val.toFixed(0)}`;
  };

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen pb-20">
      {/* Header */}
      <div className="bg-emerald-600 text-white px-4 py-6 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link to="/" className="p-2 hover:bg-emerald-700 rounded-full transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <CalcIcon className="h-5 w-5" />
              <h1 className="text-xl font-bold">CNG Saving Calculator</h1>
            </div>
            <p className="text-emerald-100 text-sm mt-1 ml-7">Calculate your savings and investment potential</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full px-4 mt-8 space-y-6">
        
        {/* Section 1: Vehicle & Fuel Details */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 p-5 border-b border-slate-100 bg-slate-50/50">
            <FileText className="h-5 w-5 text-emerald-600" />
            <h2 className="font-bold text-slate-800">Vehicle & Fuel Details</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">Daily Distance Driven (km)</label>
              <input 
                type="number" 
                value={dailyKm} 
                onChange={(e) => setDailyKm(Number(e.target.value))}
                className="w-full p-3 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">Mileage on Petrol (km/litre)</label>
              <input 
                type="number" 
                value={petrolMileage} 
                onChange={(e) => setPetrolMileage(Number(e.target.value))}
                className="w-full p-3 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">Mileage on CNG (km/kg)</label>
              <input 
                type="number" 
                value={cngMileage} 
                onChange={(e) => setCngMileage(Number(e.target.value))}
                className="w-full p-3 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">Petrol Price (₹/litre)</label>
              <input 
                type="number" 
                value={petrolPrice} 
                onChange={(e) => setPetrolPrice(Number(e.target.value))}
                className="w-full p-3 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">CNG Price (₹/kg)</label>
              <input 
                type="number" 
                value={cngPrice} 
                onChange={(e) => setCngPrice(Number(e.target.value))}
                className="w-full p-3 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Monthly Fuel Costs */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 p-5 border-b border-slate-100 bg-slate-50/50">
            <span className="text-blue-500 font-bold">₹</span>
            <h2 className="font-bold text-slate-800">Monthly Fuel Costs</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-50 border border-red-100 p-5 rounded-xl">
              <p className="text-red-500 text-sm font-semibold mb-1">Petrol Cost</p>
              <p className="text-2xl font-bold text-red-600 mb-1">{formatCurrency(results.petrolCostPerMonth)}</p>
              <p className="text-xs text-red-400">{results.petrolLitersPerMonth.toFixed(1)} litres needed</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-xl">
              <p className="text-emerald-600 text-sm font-semibold mb-1">CNG Cost</p>
              <p className="text-2xl font-bold text-emerald-700 mb-1">{formatCurrency(results.cngCostPerMonth)}</p>
              <p className="text-xs text-emerald-500">{results.cngKgPerMonth.toFixed(1)} kg needed</p>
            </div>
            <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl">
              <p className="text-blue-600 text-sm font-semibold mb-1">Monthly Savings</p>
              <p className="text-2xl font-bold text-blue-700 mb-1">{formatCurrency(results.monthlySavings)}</p>
              <p className="text-xs text-blue-500">Yearly: {formatCurrency(results.yearlySavings)}</p>
            </div>
          </div>
        </div>

        {/* Section 3: SIP Investment Growth Potential */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 p-5 border-b border-slate-100 bg-slate-50/50">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <h2 className="font-bold text-slate-800">SIP Investment Growth Potential</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl text-center">
              <p className="text-purple-800 font-medium">
                You're saving {formatCurrency(results.monthlySavings)} per month. If you invest that, you could grow it to {formatCurrency(results.sip20)} in 20 years!
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-orange-50 border border-orange-200 p-5 rounded-xl text-center">
                <p className="text-orange-600 text-sm font-bold mb-2">5 Years</p>
                <p className="text-2xl font-extrabold text-orange-700 mb-1">{formatCurrency(results.sip5)}</p>
                <p className="text-xs text-orange-500 font-medium">@ 12% annual return</p>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 p-5 rounded-xl text-center">
                <p className="text-indigo-600 text-sm font-bold mb-2">10 Years</p>
                <p className="text-2xl font-extrabold text-indigo-700 mb-1">{formatCurrency(results.sip10)}</p>
                <p className="text-xs text-indigo-500 font-medium">@ 12% annual return</p>
              </div>
              <div className="bg-fuchsia-50 border border-fuchsia-200 p-5 rounded-xl text-center">
                <p className="text-fuchsia-600 text-sm font-bold mb-2">20 Years</p>
                <p className="text-2xl font-extrabold text-fuchsia-700 mb-1">{formatCurrency(results.sip20)}</p>
                <p className="text-xs text-fuchsia-500 font-medium">@ 12% annual return</p>
              </div>
            </div>

            <div className="bg-slate-100 text-slate-500 text-xs p-4 rounded-lg text-center">
              <span className="font-bold">Note:</span> Calculations assume 12% annual return. Please consult finance advisor before investing, this is for idea purpose.
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <button className="flex items-center justify-center gap-2 w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors">
            <Share2 className="h-5 w-5" />
            Share My Savings ({formatCurrency(results.yearlySavings)}/yr)
          </button>
          <Link to="/" className="flex items-center justify-center gap-2 w-full py-4 bg-white border-2 border-blue-500 text-blue-600 hover:bg-blue-50 rounded-xl font-bold transition-colors">
            <MapPin className="h-5 w-5" />
            Find Nearest CNG Pump
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Calculator;
