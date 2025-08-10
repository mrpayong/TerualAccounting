import { getSubAccounts } from "@/actions/accounts"; // Server action to fetch sub-accounts
import SubAccount from "../_components/SubAccount";
import { getStaff, getUnauthUser } from "@/actions/admin";
import NotFound from "@/app/not-found";
import { Button } from "@/components/ui/button";
import BackButton from "../_components/BackButton";
import { Zen_Kaku_Gothic_Antique } from "next/font/google";

const fontZenKaku = Zen_Kaku_Gothic_Antique({
  subsets:["latin"],
  weight: '900',
})

export default async function SubAccountsPage({ params }) {
  const user = await getStaff()

  if(!user.authorized){
    await getUnauthUser();
    return NotFound();
  }
  const { id } = await params; // Get the dynamic route parameter

  // Fetch sub-accounts data from the server
  const response = await getSubAccounts(id);

  if (!response.success) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 text-lg">Error: {response.error}</p>
      </div>
    );
  }

  const subAccounts = response.data;

  return (
    <div className="container flex flex-col items-center justify-center mx-auto p-4">
      <div className="flex w-full flex-col mb-4">
        <div className="flex items-start px-8">
          <BackButton id={id}/>
        </div>        
        <div className="flex justify-center items-center">
          <h1 className={`${fontZenKaku.className} text-2xl md:text-3xl text-center mb-4`}>Grouped Transcations</h1>
        </div>
      
      </div>
      {subAccounts.length === 0 ? (
        <p className="text-gray-500">No Grouped transcations found.</p>
      ) : (
                <div className="flex justify-center w-full overflow-x-auto">
  <div className="space-y-4 min-w-[350px]">
          {subAccounts.map((subAccount) => (
            <SubAccount key={subAccount.id} subAccount={subAccount} />
          ))}
        </div></div>

      )}
    </div>
  );
} 