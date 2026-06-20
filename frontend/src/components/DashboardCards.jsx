import React from 'react';
import { 
  Users, 
  Building2, 
  CircleDollarSign, 
  AlertCircle, 
  UserCheck, 
  UserMinus, 
  Clock 
} from 'lucide-react';

const DashboardCards = ({ stats }) => {
  const cards = [
    {
      title: 'Total Students',
      value: stats.totalStudents ?? 0,
      icon: Users,
      bgColor: 'bg-blue-50 border-blue-100',
      iconColor: 'text-blue-600 bg-blue-100',
    },
    {
      title: 'Total Study Halls',
      value: stats.totalHalls ?? 0,
      icon: Building2,
      bgColor: 'bg-indigo-50 border-indigo-100',
      iconColor: 'text-indigo-600 bg-indigo-100',
    },
    {
      title: 'Total Fees Collected',
      value: `₹ ${stats.totalFees?.toLocaleString('en-IN') ?? 0}`,
      icon: CircleDollarSign,
      bgColor: 'bg-emerald-50 border-emerald-100',
      iconColor: 'text-emerald-600 bg-emerald-100',
    },
    {
      title: 'Pending Fees',
      value: `₹ ${stats.pendingFees?.toLocaleString('en-IN') ?? 0}`,
      icon: AlertCircle,
      bgColor: 'bg-amber-50 border-amber-100',
      iconColor: 'text-amber-600 bg-amber-100',
    },
    {
      title: 'Active Students',
      value: stats.activeStudents ?? 0,
      icon: UserCheck,
      bgColor: 'bg-teal-50 border-teal-100',
      iconColor: 'text-teal-600 bg-teal-100',
    },
    {
      title: 'Left Students',
      value: stats.leftStudents ?? 0,
      icon: UserMinus,
      bgColor: 'bg-rose-50 border-rose-100',
      iconColor: 'text-rose-600 bg-rose-100',
    },
    {
      title: 'Monthly Fee Due',
      value: `₹ ${stats.monthlyFeeTotal?.toLocaleString('en-IN') ?? 0}`,
      icon: Clock,
      bgColor: 'bg-sky-50 border-sky-100',
      iconColor: 'text-sky-600 bg-sky-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div 
            key={idx} 
            className={`flex items-center justify-between p-5 rounded-2xl border bg-white hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ${card.bgColor}`}
          >
            <div className="space-y-1">
              <span className="text-sm font-semibold text-gray-500 tracking-wide uppercase">{card.title}</span>
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{card.value}</h3>
            </div>
            <div className={`p-3 rounded-xl flex items-center justify-center ${card.iconColor}`}>
              <Icon className="h-6 w-6 flex-shrink-0" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardCards;
