import { getCashflowById } from "@/actions/cashflow";
import CashflowDetails from "../../_components/Cashflow_details";

export default async function CashflowDetailsPage({ params }) {
    const { cfsID } = await params; // Extract account ID and cashflow ID from the route
    const cashflow = await getCashflowById(cfsID); // Fetch the cashflow details

    if (!cashflow) {
        return <p>Cashflow statement not found.</p>;
    }

    return (
        <div>
            <CashflowDetails cashflow={cashflow} /> {/* Pass data to the child component */}
        </div>
    );
}