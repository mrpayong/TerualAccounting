"use client";

import React from "react";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table"; // Shadcn Table components

// Sample tasks for the week
const tasks = [
  { day: "Sun", tasks: [] },
  { day: "Mon", tasks: [] },
  { day: "Tue", tasks: ["BIR Meeting"] },
  { day: "Wed", tasks: [] },
  { day: "Thu", tasks: ["Client Audit"] },
  { day: "Fri", tasks: [] },
  { day: "Sat", tasks: [] },
];

const TaskCalendar = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="overflow-x-auto">
        <Table className="table-fixed min-w-full border-collapse border border-stone-600">
          {/* Table Header */}
          <TableHeader>
            <TableRow>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <TableCell
                  key={day}
                  className="font-medium text-sm text-center bg-neutral-500 border border-gray-200 w-1/7 h-12 p-1"
                >
                  {day}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody>
            <TableRow>
              {tasks.map((task, index) => (
                <TableCell
                  key={index}
                  className="align-top border border-gray-200 w-1/7 h-24 p-2"
                >
                  <ul className="space-y-1">
                    {task.tasks.map((t, i) => (
                      <li
                        key={i}
                        className="bg-blue-50 text-blue-800 rounded-md p-1 text-sm h-6 w-full overflow-hidden text-ellipsis truncate"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TaskCalendar;