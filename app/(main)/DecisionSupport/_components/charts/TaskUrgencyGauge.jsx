import React from 'react';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer } from 'recharts';

const TaskUrgencyGauge = ({ value, level }) => {
  const data = [
    {
      name: 'Task Urgency',
      value: value,
      fill: level === 'High Priority' ? '#ef4444' : level === 'Medium Priority' ? '#f59e0b' : '#22c55e',
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadialBarChart innerRadius="10%" outerRadius="80%" data={data}>
        <RadialBar
          minAngle={15}
          label={{ fill: '#fff', position: 'inside' }}
          background
          clockWise
          dataKey="value"
        />
        <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
      </RadialBarChart>
    </ResponsiveContainer>
  );
};

export default TaskUrgencyGauge;