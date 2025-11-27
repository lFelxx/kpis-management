import { IconType } from 'react-icons';
import { ReactNode } from 'react';

interface DashboardCardProps {
  icon: IconType;
  title: string;
  value: ReactNode;
  description?: string;
  color: string;
  valueColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const DashboardCard = ({ icon: Icon, title, value, description, color, valueColor}: DashboardCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="mb-4">
        <div className={`p-3 rounded-lg ${color} inline-block`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
      
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className={`text-2xl font-bold mt-2 mb-1 ${valueColor ?? 'text-gray-900'}`}>{value}</p>
      {description && (
        <p className="text-gray-500 text-sm">{description}</p>
      )}
    </div>
  );
}; 