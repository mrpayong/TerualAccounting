'use client';

import { useState, useMemo, useEffect } from 'react';
import CashflowList from './Cashflow';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { deleteCashflow } from '@/actions/cashflow';
import useFetch from '@/hooks/use-fetch';
import { X } from 'lucide-react';

function CashflowFilter({ cashflows }) {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [category, setCategory] = useState('');
  const [selectedCashflow, setSelectedCashflow] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const filteredCashflows = useMemo(() => {
    let filtered = cashflows;

    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(
        (cashflow) =>
          new Date(cashflow.date) >= new Date(dateRange.start) &&
          new Date(cashflow.date) <= new Date(dateRange.end)
      );
    }

    if (category) {
      filtered = filtered.filter((cashflow) => cashflow.category === category);
    }

    return filtered;
  }, [cashflows, dateRange, category]);

  const handleDateChange = (e) => {
    setDateRange({ ...dateRange, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const handleSelectCashflow = (cashflow) => {
    setSelectedCashflow(cashflow);
  };

  const handleCloseDialog = () => {
    setSelectedCashflow(null);
  };
  const handleClearFilters = () => {
    setDateRange({start:'', end: ''});
    setCategory('');
  }

  const CFS = cashflows;
  console.log("CFS IN FILTER: ", CFS)




  
  const {
    loading: deleteLoading,
    fn: deleteFn,
    data: deleted,
  } = useFetch(deleteCashflow)

  const handleSelect = (id) => {
    setSelectedIds((current) => 
      current.includes(id)
        ? current.filter((item) => item != id)
        : [...current, id]
    );
  }

  const handleSelectAll = () => {
    setSelectedIds((current) => 
      current.length === cashflows.length
        ? []
        : cashflows.map((cfs) => cfs.id)
    );
  };

  useEffect(() => {
    if (deleted && !deleteLoading){
      toast.error(`${selectedIds.length} have been deleted.`);
      setSelectedIds([])
    }
  }, [deleted, deleteLoading]);

  const handleBulkDelete = async () => {
    if (!window.confirm(
        `${selectedIds.length} will be deleted. Confirm?`
    ))
    return;
    deleteFn(selectedIds);
  }

  return (
    <div>
      <div className="flex space-x-4 mb-4">
        <input
          type="date"
          name="start"
          value={dateRange.start}
          onChange={handleDateChange}
          className="border rounded p-2"
        />
        <input
          type="date"
          name="end"
          value={dateRange.end}
          onChange={handleDateChange}
          className="border rounded p-2"
        />
        <select
          value={category}
          onChange={handleCategoryChange}
          className="border rounded p-2"
        >
          <option value="">All Categories</option>
          <option value="Expense">Expense</option>
          <option value="Income">Income</option>
        </select>
        {dateRange.start && dateRange.end &&
          <Button onClick={handleClearFilters} className="border rounded p-2 bg-red-500 text-white hover:bg-red-600 sm:p-3 md:p-4 lg:p-5">
          Clear
        </Button>}
      </div>
      <CashflowList cashflows={filteredCashflows} onSelectCashflow={handleSelectCashflow} />

      {/* <Dialog open={!!selectedCashflow} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cashflow Details</DialogTitle>
            <DialogDescription>
              {selectedCashflow && (
                <>
                  <DialogTitle>Description: {selectedCashflow.description}</DialogTitle>
                  <DialogTitle>Date: {new Date(selectedCashflow.date).toLocaleDateString()}</DialogTitle>
                  <DialogTitle>Category: {selectedCashflow.category}</DialogTitle>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
   

              <button
                    // onClick={() => router.push(`/transaction/create?edit=${transaction.id}`)}
                >Edit</button>

               

              <button className="text-destructive"
                  onClick={handleBulkDelete(() => deleteFn([selectedCashflow.id]))}
              >Delete</button>
        </DialogContent>
      </Dialog> */}
    </div>
  );
}

export default CashflowFilter;