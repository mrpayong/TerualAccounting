import { getDashboardData, getUserAccounts } from '@/actions/dashboard';
import React from 'react'
import SectionOne from './_components/section-one';
import SectionTwo from './_components/sectionTwo';
import SectionFour from './_components/sectionFour';
import TaskTable from './_components/taskTable';
import { getTask } from '@/actions/task';
import { FinancialDataProvider } from './_context/FinancialDataContext';
import { entryCount, getAllInflows, getAllOutflows, getAllTransactions} from '@/actions/decisionSupport';
import { getUserAccount } from '@/actions/admin';





async function DecisionSupport () {
      const accounts = await getUserAccount();
      const task = await getTask()
      const inflows = await getAllInflows();
      const outflows = await getAllOutflows();
      const AllTransactions = await getAllTransactions();
      const entryCounts = await entryCount();

      
      const transactions = await getDashboardData();

    
  return (
    <FinancialDataProvider>
      <div className='flex flex-col gap-5 mx-10'>
        <section>
          <SectionOne 
            entryCounts={entryCounts}
            accounts={accounts} 
            transactions={transactions || []} 
            tasks={task}
            AllTransactions={AllTransactions}
            inflows={inflows}
            outflows={outflows}
          />
        </section>
        <section>
          <SectionTwo 
            accounts={accounts}
            transactions={transactions || []}
          />
        </section>
        <section>
          <SectionFour />
        </section>
        <section>
          <TaskTable tasks={task} accounts={accounts}/>
        </section>
      </div>
    </FinancialDataProvider>
  )
}

export default DecisionSupport;

