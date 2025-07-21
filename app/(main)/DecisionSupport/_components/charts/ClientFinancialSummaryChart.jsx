import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ClientFinancialSummaryChart = ({ clientFinancialData }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={clientFinancialData}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(value) => [`₱${value.toLocaleString()}`, 'Amount']} />
        <Legend />
        <Bar dataKey="revenue" fill="#4ade80" name="Revenue" />
        <Bar dataKey="expenses" fill="#f87171" name="Expenses" />
        <Bar dataKey="profit" fill="#60a5fa" name="Profit" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ClientFinancialSummaryChart;