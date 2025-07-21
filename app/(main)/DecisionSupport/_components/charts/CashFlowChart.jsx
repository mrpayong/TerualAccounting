import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

const CashFlowChart = ({ cashFlowData }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={cashFlowData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="week" />
        <YAxis />
        <Tooltip formatter={(value) => [`₱${value.toLocaleString()}`, 'Amount']} />
        <Line type="monotone" dataKey="cashIn" stroke="#22c55e" activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="cashOut" stroke="#ef4444" />
        <Line type="monotone" dataKey="balance" stroke="#3b82f6" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default CashFlowChart;