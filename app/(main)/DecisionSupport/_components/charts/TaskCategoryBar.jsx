import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TaskCategoryBar = ({ taskCategorySummary }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={taskCategorySummary}>
        <XAxis dataKey="category" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" fill="#4ade80" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TaskCategoryBar;