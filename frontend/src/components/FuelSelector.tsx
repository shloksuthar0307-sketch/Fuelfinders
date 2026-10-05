import clsx from 'clsx';
import { Button } from './ui/Button';

export interface FuelType {
  id: string;
  label: string;
}

export const FUEL_TYPES: FuelType[] = [
  { id: 'petrol', label: 'Petrol' },
  { id: 'diesel', label: 'Diesel' },
  { id: 'cng', label: 'CNG' },
];

interface FuelSelectorProps {
  selectedFuels: string[];
  onChange: (fuels: string[]) => void;
}

export const FuelSelector = ({ selectedFuels, onChange }: FuelSelectorProps) => {
  const toggleFuel = (fuelId: string) => {
    if (selectedFuels.includes(fuelId)) {
      onChange(selectedFuels.filter((f) => f !== fuelId));
    } else {
      onChange([...selectedFuels, fuelId]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-brand-secondary uppercase tracking-wider">Fuel Type</label>
      <div className="flex flex-wrap gap-2">
        {FUEL_TYPES.map((fuel) => {
          const isSelected = selectedFuels.includes(fuel.id);
          return (
            <Button
              key={fuel.id}
              type="button"
              variant={isSelected ? "default" : "secondary"}
              size="sm"
              onClick={() => toggleFuel(fuel.id)}
              className={clsx(isSelected && "scale-[1.02]")}
            >
              {fuel.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
