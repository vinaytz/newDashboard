import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from 'recharts';

interface ChartProps {
  data: any[];
  className?: string;
}

export const ProductivityLineChart: React.FC<ChartProps> = ({ data, className = '' }) => {
  return (
    <div className={`w-full h-64 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            stroke="#9CA3AF"
            fontSize={12}
          />
          <YAxis 
            stroke="#9CA3AF"
            fontSize={12}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#F3F4F6'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="completed" 
            stroke="#3B82F6" 
            strokeWidth={2}
            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
            name="Tasks Completed"
          />
          <Line 
            type="monotone" 
            dataKey="created" 
            stroke="#10B981" 
            strokeWidth={2}
            dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
            name="Tasks Created"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const FocusTimeAreaChart: React.FC<ChartProps> = ({ data, className = '' }) => {
  return (
    <div className={`w-full h-64 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            stroke="#9CA3AF"
            fontSize={12}
          />
          <YAxis 
            stroke="#9CA3AF"
            fontSize={12}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#F3F4F6'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="focusTime" 
            stroke="#8B5CF6" 
            fill="#8B5CF6"
            fillOpacity={0.3}
            name="Focus Time (minutes)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const CategoryBarChart: React.FC<ChartProps> = ({ data, className = '' }) => {
  return (
    <div className={`w-full h-64 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="category" 
            stroke="#9CA3AF"
            fontSize={12}
          />
          <YAxis 
            stroke="#9CA3AF"
            fontSize={12}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#F3F4F6'
            }}
          />
          <Bar 
            dataKey="time" 
            fill="#F59E0B"
            radius={[4, 4, 0, 0]}
            name="Time Spent (minutes)"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const GoalProgressPieChart: React.FC<ChartProps> = ({ data, className = '' }) => {
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className={`w-full h-64 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#F3F4F6'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const RadialProgressChart: React.FC<{ value: number; max: number; color: string; className?: string }> = ({ 
  value, 
  max, 
  color, 
  className = '' 
}) => {
  const data = [{ value, fill: color }];
  
  return (
    <div className={`w-full h-32 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={data}>
          <RadialBar
            dataKey="value"
            cornerRadius={10}
            fill={color}
          />
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-gray-100 text-lg font-bold">
            {Math.round((value / max) * 100)}%
          </text>
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
};