import { getCashflow } from "@/actions/cashflow";
import CashflowFilter from "../_components/Cashflow_filter";
import CashflowList from "../_components/Cashflow";
import { getAccountWithTransactions } from "@/actions/accounts";


async function CashflowPage ({ params }) {
    const {id} = await params;

    const account = await getAccountWithTransactions(id)
    const cashflows = await getCashflow(id)
    const accountName = account.name



    // if (!cashflows || cashflows.length === 0) {
    //     return <p>No cashflow statements found for this account.</p>;
    // }

    return (
        <div className="bg-gradient-to-b from-blue-50 to-white">
           
            <CashflowList cashflows={cashflows} id={id} name={accountName}/> {/* Pass data to the child component */}
        </div>
    );
}


export default  CashflowPage;
