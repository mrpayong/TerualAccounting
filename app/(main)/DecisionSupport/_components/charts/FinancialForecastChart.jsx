import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const FinancialForecastChart = ({ financialData }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={financialData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip formatter={(value) => [`₱${value.toLocaleString()}`, 'Amount']} />
        <Legend />
        <Line type="monotone" dataKey="revenue" stroke="#4ade80" activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="expenses" stroke="#f87171" />
        <Line type="monotone" dataKey="netProfit" stroke="#60a5fa" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default FinancialForecastChart;