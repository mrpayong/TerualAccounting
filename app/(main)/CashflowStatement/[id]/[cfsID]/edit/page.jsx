import { getCashflowById } from "@/actions/cashflow";
import EditCashflow from "../../../_components/Edit_cashflow";
import { Button } from "@/components/ui/button";
import { Zen_Kaku_Gothic_Antique } from "next/font/google";

const fontZenKaku = Zen_Kaku_Gothic_Antique({
  subsets:["latin"],
  weight: ["400", "500", "700", "900"],
})

export default async function EditCashflowPage({ params }) {
  const { cfsID } = await params; // Extract the cashflow ID from the route
 

  try {
    const cashflow = await getCashflowById(cfsID); // Fetch the cashflow data
    
    if (!cashflow) {
      return (
        <div className="p-4 max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Edit Cashflow</h1>
          <p className="text-red-500">Cashflow not found. Please check the ID and try again.</p>
        </div>
      );
    }

    return (
      <div className={`${fontZenKaku.className} p-4 max-w-3xl mx-auto bg-lime-200 rounded-xl`}>
        <h1 className="text-2xl md:text-3xl font-bold">Edit Cashflow</h1>
        <span className="text-sm font-normal tracking-wide text-gray-500">Edit the transaction of this cashflow statement.</span>
        <EditCashflow cashflow={cashflow} /> {/* Pass data to the child component */}
      </div>
    );
  } catch (error) {
    console.error("Error fetching cashflow:", error);
    return (
      <div className="p-4 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Cashflow</h1>
        <p className="text-red-500">An error occurred while fetching the cashflow. Please try again later.</p>
      </div>
    );
  }
}