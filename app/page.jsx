
"use client";
import React, { useState, useEffect, useRef} from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  ChartLine,
  Triangle,
  Brain,
  Folders,
  IdCard,
  Weight
} from "lucide-react";
import {Oswald, Overpass_Mono, Poppins, PT_Serif} from "next/font/google";

const fontOwsald = Oswald({
  subsets: ["latin"],
  weight: ["200", "400"]
})

const fontOverpassMono = Overpass_Mono({
  subsets: ['latin'],
  weight:["400", "500", "600"]
})

const fontPoppins = Poppins({
  subsets: ['latin'],
  weight:["100", "200", "300"]
})


const Home = () => {
  const [activeSection, setActiveSection] = useState("cashflow");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [bookmarked, setBookmarked] = useState([]);
  const mainContentRef = useRef(null);
  const [showButton, setShowButton] = useState(false);
  // Handle scroll progress
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowButton(true); // Show button when scrolled down
      } else {
        setShowButton(false); // Hide button when at the top
      }
    
      if (!mainContentRef.current) return;
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const fullHeight = document.body.offsetHeight;
      const progress = (scrollPosition / (fullHeight - windowHeight)) * 100;
      setScrollProgress(progress);
      // Update active section based on scroll position
      const sections = document.querySelectorAll("section[id]");
      sections.forEach((section) => {
        const sectionTop = (section).offsetTop - 100;
        const sectionHeight = (section).offsetHeight;
        if (
          scrollPosition >= sectionTop &&
          scrollPosition < sectionTop + sectionHeight
        ) {
          setActiveSection(section.id);
        }
      });
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const toggleBookmark = (sectionId) => {
    if (bookmarked.includes(sectionId)) {
      setBookmarked(bookmarked.filter((id) => id !== sectionId));
    } else {
      setBookmarked([...bookmarked, sectionId]);
    }
  };
  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const features = [
    {
      id: "account",
      title: "Account Creation",
      bestPracticeId: "account",
      icon: <IdCard/>,
      src: "/createAcc.png",
      description: 
        "Create an account for your client.",
      steps: [
        "Find the 'Add New Account' card in your dashboard.",
        "Fill in the form with the information of the client.",
        "Review the information you entered in the blanks.",
        "Click on Add Client button.",
        "You will see the created account on the dashboard.",
      ],
    },
    {
      id: "ai-transaction",
      title: "AI-Powered Transaction Recording",
      bestPracticeId: "infoAI",
      src: "/AddTransaction.png",
      icon: <Bot className="text-black group-hover:text-white group-hover:animate-bounce"/>,
      description:
        "Save time on recording the transactions in the accounts.",
      steps: [
        "Choose an account in the dashboard.",
        "Click on the Add Transaction button of the chosen account.",
        "Scan the receipt.",
        "Wait for the AI to process the scanned receipt.",
        "Review the reflected information on the form.",
        "Click Create Transaction to save the transaction."
      ],
    },
    {
      id: "cashflow",
      title: "Cashflow Statement Generation",
      bestPracticeId: "cashflowStatment",
      icon: <ChartLine/>,
      src: "/cashflowModal.png",
      description:
        "Generate Cashflow Statements for specifc periods.",
      steps: [
        "In the Account page, navigate the tabs to see the tables.",
        "Select transactions or grouped transactions.",
        "Click on Cashflow Statement button.",
        "Enter the beginning balance.",
        "Click on Generate to preview PDF of the cashflow statement.",
      ],
    },
    {
      id: "group",
      title: "Group Transaction",
      bestPracticeId: "groupTransaction",
      icon: <Folders/>,
      src: "/groupTransaction.png",
      description:
        "Group transaction for long time framed cashflow statements.",
      steps: [
        "Select transactions with same Type and Activity.",
        "Click on Group Transaction button.",
        "Fill in the form.",
        "Click on Create group",
      ],
    },
    {
      id: "DecisionSupport",
      title: "Decision Support System",
      bestPracticeId: "DSS",
      icon: <Brain className="text-black group-hover:text-white group-hover:animate-bounce"/>,
      src: "/dss(1).png",
      description:
        "Receive financial insights and recommendations through Hybrid Decision Support.",
      steps: [
        "Ensure you have transactions and cashflows.",
        "Click the Forcasting button.",
        "Select a client at the top right of Client Income Summary card.",
        "For suggested schedule, ensure you created Tasks.",
        "Click on Generate AI Powered Forecast to see forecast.",
        "Click on Schedule Task with AI to receive suggestion of schedule prioritization insight.",
      ],
    },
  ];

  const BestPractices = [
    {
      id: "account",
      itemId: "accountItemId",
      ItemTrigger1: "Action & Access",
      ItemTrigger2: "Other helpful information",
      list: [
        "Only users with Staff role can have access to dashboard.",
        "Each staff will only see accounts of clients they created.",
        "Review the information you entered in the blanks.",
        "The Business Name cannot be repeated.",
        "The hollow card is the toggle to open a form to create a new account for a client.",
        "Choos a client from the Dropdown list in the Left card to see their reports in the graphs.",
      ],
      list2: [
        "You must have transactions encoded for an account to see reports in the graphs",
        "The graphs are based on time frames, do not worry if you do not see a graph",
        "The Bar graph illustrates the ranking of income source base on Account Titles of transactions",
        "The Pie chart shows the breakdown of expenses of the current month",
        "The Area graph gives a comparision of a client's incomes and expenses for the past 3 months",
        "Hovering on the graphs shows a tooltip that describes a data.",
        "Clicking on the reset will unfill the blanks."
      ],
    },
    {
      id: "infoAI",
      itemId: "accountItemId",
      ItemTrigger1: "Action & Access",
      ItemTrigger2: "Other helpful information",
      list: [
        "The user can only add transactions on accounts that he created.",
        "The page to create transactions is only for users with staff role.",
        "You can switch the account you are encoding for, in the Create Transaction page.",
        "Clicking on Reset button, resets all blanks including the Image field for scanning.",
        "As long as Transaction type is Outflow the amount is negative.",
      ],
      list2: [
        "The AI is suggestive on descriptive information of a receipt.",
        "The resolution of your phone's camera can affect the scanning phase.",
        "The vendor's name in the receipt can also be read by the AI.",
        "Always review before finalizing.",
        "Be mindful on switching accounts.",
        "Having a Particular can also give a shorten name to the transaction.",
        "A check icon appears in the Image field if it contains an image of a receipt.",
      ],
    },
    {
      id: "cashflowStatment",
      itemId: "accountItemId",
      ItemTrigger1: "Action & Access",
      ItemTrigger2: "Other helpful information",
      list: [
        "You must select transactions or grouped transaction.",
        "Enter begining balances or choose from the previous ending balances shown.",
        "Clicking on the Create Cashflow will show a card where you will see ending balances of previous cashflows.",
        "The Generate button can only be clicked once requirements for cashflow statement is complete.",
        "The Save Only button will only save your newly created cashflow statement in the Cashflow page.",
        "Produced PDF's are fixed data, click Cancel to prevent disruption to your organized cashflows.",
        "The Download button also save the cashflow statement you created."
      ],
      list2: [
        "The Account page enables you to quickly create Cashflow Statements solely for reporting purposes.",
        "Created cashflow statements are automatically categorized by period base on the dates of your selected transactions.",
        "Quick preivew of cashflow statement on mobile device is not possible.",
        "When creating on mobile for reporting purposes, make sure to review your records for realignment.",
        "You should select the previous ending balance respectively to the period of the next cashflow statement.",
        "You can update cashflows in Cashflow page.", 
        "The Quick Edit mode allows you to update the balances of a cashflow statements without visiting each cashflows one-by-one.",
        "Click on a record of cashflow for precision update and download option."
      ],
    },
    {
      id: "groupTransaction",
      itemId: "accountItemId",
      ItemTrigger1: "Action & Access",
      ItemTrigger2: "Other helpful information",
      list: [
        "The groups of transactions can only be seen on accounts where you created it.",
        "Created groups are fixed, automatically giving them fixed amount once created.",        
        "Visit Group Transaction page to update your created groups.",
        "You can remove transaction from opted groups.",
        "The system enables an updating guide notification.",
        "Seeing a warning sign and a Pen icon means the group's amount needs to be updated.",
      ],
      list2: [
        "You can create a group without selecting transaction by filling out New Group Name only.",
        "Not selecting transactions and filling only the Parent's Group Name will keep Create Group disabled.",
        "Picking transaction and filling only the Parent's Group Name, inserts a transaction to existing group.",
        "You can select transaction and fill in the New Group Name.",
        "Description is optional but highly encouraged to provide clarity and context for reviewing and reporting.",
      ],
    },
    {
      id: "DSS",
      itemId: "accountItemId",
      ItemTrigger1: "Action & Access",
      ItemTrigger2: "Other helpful information",
      list: [
        "Generate forecasts and insights from AI in a click of a button.",
        "Gross forecast based on the balances and gross of cashflows of a client.",
        "Insights of AI based on the Gross forecasts.",
        "Forecast of inflows and outflows of a client",
        "Recommendations with impact level categorization based from overall analysis",
        "Admin level feature only.",
        "Leverage decision support for your administrative level corporate planning.",
        "Create tasks and let AI give suggestion of weekly schedule of your services for your clients.",
        "Be informed of your client's inflow rate per month.",
      ],
      list2: [
        "Illustrates accumulated data from accounts created by staff.",
        "Moving average model forecasting based on historical data in quarterly timeframe.",
        "Comparative graphs for simple trend analysis.",
        "Know what you can prioritize in your day from AI.",
      ],
    },
  ]










  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with progress bar */}
      <header className="sticky top-0 z-50 bg-transparent border-b border-gray-200 shadow-sm pt-11">


        {/* Navigation tabs */}
        <div className="container mx-auto px-4 bg-transparent backdrop-blur-lg">
          <Tabs className="mt-10 pt-2 bg-transparent">
              <TabsList className="w-full justify-between  bg-transparent
              overflow-x-auto overflow-y-hidden py-2 space-x-2 h-auto ">
            {features.map((feature) => (
              <TabsTrigger
                key={feature.id}
                value={feature.id}
                onClick={() => scrollToSection(feature.id)}
                className={`${activeSection === feature.id ? "backdrop-blur-lg text-blue-700" : ""} ${fontPoppins.className} gap-1 cursor-pointer whitespace-nowrap`}
              >
                {/* <i className={`${feature.icon} mr-2`}></i> */}
                {feature.icon}
                {feature.title}
              </TabsTrigger>
            ))}
          </TabsList>
          </Tabs>
        </div>
      </header>

      {/* Hero section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-sky-50 to-transparent">
        <div className="container mx-auto px-4 py-16 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 z-10 animate-slide-in-left">
            <Badge
              variant="outline"
              className='lg:text-xs text-[0.5rem]/[1] mb-4 px-3 py-1 bg-blue-100 text-blue-700 border-blue-200'
            >
              Getting Started Guide
            </Badge>
            <h1 className={`text-3xl lg:text-[4rem]/[1] break-words tracking-wider font-extralight text-gray-900 mb-4 w-full ${fontOwsald.className}`}>
              Teruel Accounting Financial<br/> Management System
            </h1>
            <p className={`text-xs lg:text-base text-gray-600 mb-6 ${fontOverpassMono.className}`}>
              Welcome to your assistive guide to using our
              Web-Based Financial Management System.
            </p>
            {/* <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white !rounded-button whitespace-nowrap cursor-pointer">
                <i className="fa-solid fa-play mr-2"></i>
                Watch Tutorial
              </Button>
              <Button
                variant="outline"
                className="!rounded-button whitespace-nowrap cursor-pointer"
                onClick={() => scrollToSection("cashflow")}
              >
                <i className="fa-solid fa-book-open mr-2"></i>
                Start Reading
              </Button>
            </div> */}
          </div>
          <div className="md:w-1/2 mt-8 md:mt-0 animate-slide-in-right">
            <img
              // src="https://readdy.ai/api/search-image?query=Modern%20financial%20dashboard%20interface%20with%20AI%20assistant%20helping%20user%20navigate%20through%20various%20financial%20tools%20and%20features%2C%20showing%20clean%20UI%20with%20data%20visualization%20elements%2C%20charts%20and%20helpful%20tooltips%20on%20a%20light%20background%20with%20blue%20accents&width=600&height=400&seq=hero1&orientation=landscape"
              src="dashSS(1).png"
              alt="Financial System Overview"
              className="rounded-lg shadow-xl object-cover w-full h-auto"
            />
          </div>
        </div>
      </div>


      {/* Main content */}
      <div ref={mainContentRef} className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-16">
          {features.map((feature, index) => (
            <section key={feature.id} id={feature.id} className="scroll-mt-24">
              <Card className="overflow-hidden border-none shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-white pb-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className={`
                          ${feature.id === "DecisionSupport" || feature.id === "ai-transaction"
                            ? ("w-12 h-12 rounded-full bg-blue-100 hover:animate-bounce border border-blue-600 hover:border-none group hover:bg-gradient-to-r hover:from-blue-700  hover:to-fuchsia-600 flex items-center justify-center")
                            : ("w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center")
                          }
                          
                          `}>
                        {feature.icon}
                      </div>
                      <div>
                        <CardTitle className={`text-xl md:text-4xl font-light text-gray-800 ${fontPoppins.className}`}>
                          {feature.title}
                        </CardTitle>
                        <CardDescription className={`${fontPoppins.className} font-light text-[0.65rem]/[1] md:text-sm text-gray-600 mt-1`}>
                          {feature.description}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="p-6">
                      <h3 className={`text-lg font-semibold mb-4 text-gray-800 ${fontOverpassMono.className}`}>
                        Step-by-Step Guide
                      </h3>
                      <ol className="space-y-4">
                        {feature.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="flex items-start">
                            <span className={`flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 font-medium ${fontOverpassMono.className}`}>
                              {stepIndex + 1}
                            </span>
                            <span className={`text-gray-700 pt-1 ${fontOverpassMono.className}`}>{step}</span>
                          </li>
                        ))}
                      </ol>
                      <div className="mt-8">
                        <h3 className={`text-lg font-semibold mb-4 text-gray-800 ${fontOverpassMono.className}`}>
                          Be informed with the following: 
                        </h3>
                      

                        {BestPractices.filter(bp => bp.id === feature.bestPracticeId).map((practice) => (
                          <Accordion key={practice.id} type="single" collapsible className="w-full">
                            <AccordionItem value={`list1-${practice.id}`}>
                              <AccordionTrigger className={`text-blue-600 font-medium ${fontOverpassMono.className}`}>
                                {practice.ItemTrigger1}
                              </AccordionTrigger>
                              <AccordionContent>
                                <ul className={`list-disc pl-5 space-y-2 text-gray-700 ${fontOverpassMono.className}`}>
                                  {practice.list.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                  ))}
                                </ul>
                              </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value={`list2-${practice.id}`}>
                              <AccordionTrigger className={`text-blue-600 font-medium ${fontOverpassMono.className}`}>
                                {practice.ItemTrigger2}
                              </AccordionTrigger>
                              <AccordionContent>
                                <ul className={`list-disc pl-5 space-y-2 text-gray-700 mt-4 ${fontOverpassMono.className}`}>
                                  {practice.list2.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                  ))}
                                </ul>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        ))}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-6 flex flex-col">
                      <h3 className={`${fontPoppins.className} tracking-wide text-lg font-semibold mb-4 text-gray-800`}>
                        Visual Guide
                      </h3>
                      <div className="rounded-lg overflow-hidden shadow-md flex-grow">
                        <img
                          src={feature.src || "no image"}
                          alt={feature.title}
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          ))}
        </div>
      </div>









      {/* Floating action button */}
      {showButton && (
        <div className="fixed bottom-6 right-6 z-10">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg cursor-pointer"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                >
                  <Triangle className="text-white" size={24} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Back to Top</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
      




    </div>
 
  );
};
export default Home;
