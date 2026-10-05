export interface FuelPriceData {
  id: string | number;
  fuel_type: string;
  price: string | number;
  currency: string;
  unit: string;
  verified_at: string;
}

interface FuelPriceCardProps {
  priceData: FuelPriceData;
}

export const FuelPriceCard = ({ priceData }: FuelPriceCardProps) => {
  return (
    <div className="p-5 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full bg-brand-blue opacity-50 group-hover:opacity-100 transition-opacity" />
      <p className="text-xs text-brand-secondary uppercase font-bold tracking-wider">{priceData.fuel_type}</p>
      <div className="mt-2 flex items-baseline">
        <span className="text-3xl font-bold text-brand-navy">{priceData.price}</span>
        <span className="ml-1 text-sm font-semibold text-brand-secondary">{priceData.currency} /{priceData.unit}</span>
      </div>
      <p className="text-[10px] text-brand-secondary mt-3 uppercase tracking-widest font-semibold">
        Verified: {new Date(priceData.verified_at).toLocaleDateString()}
      </p>
    </div>
  );
};
