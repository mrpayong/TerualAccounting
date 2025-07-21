

"use client";
import React from 'react';
import {  Page,      
  Text,
  View,
  Document,
  StyleSheet,
  renderToStream,
  Font,
  Image
 } from '@react-pdf/renderer';
import { NextResponse } from 'next/server';
import { differenceInDays, differenceInMonths, format } from 'date-fns';


Font.register({
    family: 'Roboto',
    fonts: [
      {
        src: '/fonts/Roboto/static/Roboto-Regular.ttf', // Regular font
      },
      {
        src: '/fonts/Roboto/static/Roboto-Bold.ttf', // Bold font
        fontWeight: 'bold',
      },
    ],
  });

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    fontSize: 11,
    padding: 30,
  },
  titleProper: {
    fontFamily: 'Roboto',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitleProper: {
    fontFamily: 'Roboto',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 15, // Add spacing between sections
  },
  rowProper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    borderBottom: '1px solid #ddd',
    paddingBottom: 5,
  },
  leftCellProper: {
    width: '70%',
    textAlign: 'left',
    padding: '5px 8px',
    fontWeight: 'bold',
  },
  rightCellProper: {
    width: '30%',
    textAlign: 'right',
    padding: '5px 8px',
    fontWeight: 'bold',
    fontFamily: 'Roboto'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
    borderBottom: '1px solid #eee', // Lighter border for transaction rows
  },
  leftCell: {
    width: '70%',
    textAlign: 'left',
    padding: '5px 8px',
  },
  rightCell: {
    width: '30%',
    textAlign: 'right',
    padding: '5px 8px',
  },
  table: {
    width: '500px', // Fixed table width
    margin: '0 auto', // Center the table
  },


  letterheadContainer: {
    marginBottom: 20,// Add spacing below the letterhead
  },
  letterheadRow: {
    flexDirection: "row", // Align logo and text horizontally
    alignItems: "center", // Vertically align logo and text
  },
  logo: {
    width: 50, // Adjust the size of the logo
    height: 50,
    marginRight: 10, // Add spacing between the logo and the text
  },
  // Letterhead text container
  letterheadText: {
    flexDirection: "column",
    alignItems: "flex-start", // Align text to the left
  },
  // Title text
  title: {
    fontSize: 20, // Largest font size for the title
    fontWeight: "bold",
    marginBottom: 5,
  },
  // Subtitle text
  subtitle: {
    fontSize: 10, // Smaller font size for subtitles
    marginBottom: 3,
  },
});
const deterimeTimeFrame = (startDate, endDate) => {
  const daysDifference = differenceInDays(endDate, startDate);
  const monthsDifference = differenceInMonths(endDate, startDate)

  switch (true) {
    case daysDifference === 0:
      return "Daily";
    case daysDifference <= 7:
      return "Weekly";
    case monthsDifference === 0:
      return "Monthly";
    default:
      return ""
  }
}
const MyPDFaccountPage = ({ cashflow, transactions, subAccounts }) => {
  
  if (!cashflow || cashflow.length === 0) {
    return (
      <Document>
        <Page style={styles.page}>
          <Text>No Cashflow data available.</Text>
        </Page>
      </Document>
    );
  }

  const transactionDates = transactions.map((transaction) => 
    new Date(transaction.date)
  )


  const deterimeTimeFrame = (period) => {
    switch (period) {
      case "DAILY":
        return "Daily";
      case "WEEKLY":
        return "Weekly";
      case "MONTHLY":
        return "Monthly";
      case "ANNUAL":
        return "Annual";
      case "QUARTERLY":
        return "Quarterly";
      case "FISCAL_YEAR":
        return "Fiscal"
      default:
        "" // Default classification for longer ranges
        break;
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString); // Parse the date string
    const utcYear = date.getUTCFullYear();
    const utcMonth = date.getUTCMonth(); // Month is zero-based
    const utcDay = date.getUTCDate();
  
    // Format the date as "Month Day, Year"
    return new Date(Date.UTC(utcYear, utcMonth, utcDay)).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const startDate =  new Date(Math.min(...transactionDates));
  const endDate = new Date(Math.max(...transactionDates));

  const timeFrame = deterimeTimeFrame(startDate, endDate);

  const formattedStartDate = formatDate(startDate, 'MMMM dd, yyyy');
  const formattedEndDate = formatDate(endDate, 'MMMM dd, yyyy')
 
  const latestCashflow = cashflow;
  const transactionsIn = transactions;
  // const transactionsIn = cashflow[0].transactions;
  const grouped = subAccounts
  
  // console.log("ROUTER forCfs latest:", latestCashflow, typeof latestCashflow);


  const OperatingTransactions = transactionsIn.filter(
    (transaction) => transaction.Activity === "OPERATION"
  );
  
  const InvestingTransactions = transactionsIn.filter(
    (transaction) => transaction.Activity === "INVESTMENT"
  );
  const FinanceTransactions = transactionsIn.filter(
    (transaction) => transaction.Activity === "FINANCING"
  );
  // console.log("Latest CFS ",latestCashflow)
  
  const groupedOperating = grouped.filter((subAccount) => 
    subAccount.subAccount.transactions[0].transaction.Activity === "OPERATION"
  )

  const groupedInvesting = grouped.filter((subAccount) => 
    subAccount.subAccount.transactions[0].transaction.Activity === "INVESTMENT"
  )

  const groupedFinance = grouped.filter((subAccount) => 
    subAccount.subAccount.transactions[0].transaction.Activity === "FINANCING"
  )

  // const OperatingEntries = {OperatingTransactions, groupedOperating}
  // console.log("ENTRIES: ", OperatingEntries)

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      currencyDisplay: 'symbol',
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(amount);
  };

  const sortedOperatingEntries = [
    // Map OperatingTransactions into a unified structure
    ...OperatingTransactions.map((transaction) => ({
      type: transaction.type,
      description: transaction.description,
      amount: transaction.type === "EXPENSE" ? -transaction.amount : transaction.amount,
      isTransaction: true, // Mark as a transaction
    })),
    // Map groupedOperating into the same structure
    ...groupedOperating.map((subAccount) => ({
      type: subAccount.subAccount.transactions[0].transaction.type,
      description: subAccount.subAccount.name,
      amount: subAccount.subAccount.transactions[0].transaction.type === "EXPENSE"
        ? -subAccount.subAccount.balance
        : subAccount.subAccount.balance,
      isTransaction: false, // Mark as a subAccount
    })),
  ].sort((a, b) => {
    // Sort by type: INCOME first, then EXPENSE
    if (a.type === "INCOME" && b.type === "EXPENSE") return -1;
    if (a.type === "EXPENSE" && b.type === "INCOME") return 1;
    return 0; // Keep the same order if both are the same type
  });

  const sortedInvestingEntries = [
    // Map InvestingTransactions into a unified structure
    ...InvestingTransactions.map((transaction) => ({
      type: transaction.type,
      description: transaction.description,
      amount: transaction.type === "EXPENSE" ? -transaction.amount : transaction.amount,
      isTransaction: true, // Mark as a transaction
    })),
    // Map groupedInvesting into the same structure
    ...groupedInvesting.map((subAccount) => ({
      type: subAccount.subAccount.transactions[0].transaction.type,
      description: subAccount.subAccount.name,
      amount: subAccount.subAccount.transactions[0].transaction.type === "EXPENSE"
        ? -subAccount.subAccount.balance
        : subAccount.subAccount.balance,
      isTransaction: false, // Mark as a subAccount
    })),
  ].sort((a, b) => {
    // Sort by type: INCOME first, then EXPENSE
    if (a.type === "INCOME" && b.type === "EXPENSE") return -1;
    if (a.type === "EXPENSE" && b.type === "INCOME") return 1;
    return 0; // Keep the same order if both are the same type
  });

  const sortedFinanceEntries = [
    // Map FinanceTransactions into a unified structure
    ...FinanceTransactions.map((transaction) => ({
      type: transaction.type,
      description: transaction.description,
      amount: transaction.type === "EXPENSE" ? -transaction.amount : transaction.amount,
      isTransaction: true, // Mark as a transaction
    })),
    // Map groupedFinance into the same structure
    ...groupedFinance.map((subAccount) => ({
      type: subAccount.subAccount.transactions[0].transaction.type,
      description: subAccount.subAccount.name,
      amount: subAccount.subAccount.transactions[0].transaction.type === "EXPENSE"
        ? -subAccount.subAccount.balance 
        : subAccount.subAccount.balance,
      isTransaction: false, // Mark as a subAccount
    })),
  ].sort((a, b) => {
    // Sort by type: INCOME first, then EXPENSE
    if (a.type === "INCOME" && b.type === "EXPENSE") return -1;
    if (a.type === "EXPENSE" && b.type === "INCOME") return 1;
    return 0; // Keep the same order if both are the same type
  });























  
  return (
    <Document>
      <Page style={styles.page}>
        <View style={styles.table}>
          {/* <Text style={styles.titleProper}>Teruel Accounting Firm</Text>
          <Text style={styles.subtitleProper}>{timeFrame} Cashflow Statement</Text>
          {startDate.toDateString() === endDate.toDateString()
            ? <Text style={styles.subtitleProper}>As of: {formattedStartDate}</Text>
            : <Text style={styles.subtitleProper}>For the period: {formattedStartDate} - {formattedEndDate}</Text>
          }
          
         */}

          <View style={styles.letterheadContainer}>
            {/* Logo in the Background */}
            <View style={styles.letterheadRow}>
              <Image
              src="/PDFlogo2.png" // Replace with the actual path to your logo
              style={styles.logo}
              />

              {/* Letterhead Text */}
              <View style={styles.letterheadText}>
                <Text style={styles.title}>Teruel Accounting</Text>
                <Text style={styles.subtitle}>{deterimeTimeFrame(cashflow.periodCashFlow)} Cashflow Statement</Text>
                {startDate.toDateString() === endDate.toDateString()
                    ? <Text style={styles.subtitle}>As of: {formattedStartDate}</Text>
                    : <Text style={styles.subtitle}>For the period: {formattedStartDate} - {formattedEndDate}</Text>
                  }
            </View>
          </View>
            
          </View>

          <View style={styles.rowProper}>
            <Text style={styles.leftCellProper}>Operating Activities:</Text>
            <Text style={styles.rightCellProper}>Amount</Text>
          </View>

          {/* OPERATING ACTIVITIES */}
          {sortedOperatingEntries.map((entry, index) => (
            <View style={styles.row} key={index}>
              <Text style={styles.leftCell}>{entry.description}</Text>
              <Text style={{
                ...styles.rightCell,
                color: entry.type === "INCOME" ? "green" : "red", // Green for INCOME, Red for EXPENSE
              }}>{formatAmount(entry.amount.toFixed(3))}</Text>
            </View>
          ))}
          
          <View style={styles.row} >
          <Text style={styles.leftCell}>Net Cash from Operating Activity</Text>
          <Text style={{...styles.rightCell, borderTop: "1px solid #000"}}>{formatAmount(latestCashflow.activityTotal[0].toFixed(3))}</Text></View>


          {/* INVESTMENT ACTIVITIES */}
          <View style={styles.rowProper}>
            <Text style={styles.leftCellProper}>Investing Activities:</Text>
          </View>

          {sortedInvestingEntries.map((entry, index) => (
            <View style={styles.row} key={index}>
              <Text style={styles.leftCell}>{entry.description}</Text>
              <Text style={{
                ...styles.rightCell,
                color: entry.type === "INCOME" ? "green" : "red", // Green for INCOME, Red for EXPENSE
              }}>{formatAmount(entry.amount.toFixed(3))}</Text>
            </View>
          ))}
          <View style={styles.row} >
          <Text style={styles.leftCell}>Net Cash from Investment Activity</Text>
          <Text style={{...styles.rightCell, borderTop: "1px solid #000"}}>{formatAmount(latestCashflow.activityTotal[1].toFixed(3))} </Text></View>


        {/* FINANCING ACTIVITIES */}
        <View style={styles.rowProper}>
            <Text style={styles.leftCellProper}>Financing Activities:</Text>
          </View>

          {sortedFinanceEntries.map((entry, index) => (
            <View style={styles.row} key={index}>
              <Text style={styles.leftCell}>{entry.description}</Text>
              <Text style={{
                  ...styles.rightCell,
                  color: entry.type === "INCOME" ? "green" : "red",
                   // Green for INCOME, Red for EXPENSE
                }}>{formatAmount(entry.amount.toFixed(3))}</Text>
            </View>
          ))}

          <View style={styles.row} >
          <Text style={styles.leftCell}>Net Cash from Financing Activity</Text>
          <Text style={{...styles.rightCell, borderTop: "1px solid #000"}}>{formatAmount(latestCashflow.activityTotal[2].toFixed(3))}</Text>
          </View>

          {/* TOTALS */}
          <View style={styles.rowProper}>
            <Text style={styles.leftCellProper}>Gross:</Text>
            <Text style={styles.rightCellProper}>{formatAmount(latestCashflow.netChange.toFixed(3))}</Text>
          </View>
          <View style={styles.rowProper}>
            <Text style={styles.leftCellProper}>Beginning Net Cash:</Text>
            <Text style={styles.rightCellProper}>{formatAmount(latestCashflow.startBalance.toFixed(3))}</Text>
          </View>
          <View style={styles.rowProper}>
            <Text style={styles.leftCellProper}>Ending Balance:</Text>
            <Text style={styles.rightCellProper}>{formatAmount(latestCashflow.endBalance.toFixed(3))}</Text>
          </View>
        
          
        </View>

        
        

       
      </Page>
    </Document>
  );
};
export default MyPDFaccountPage;

export async function GET(req, { params, cashflow, subAccounts}) {
  const { id } = params;
  const cashflowData = cashflow; // Assuming cashflow is already the data you need.
  const transactionData = transactions;
  const subAccountsData = subAccounts

  if (!cashflowData || !Array.isArray(cashflowData)) {
    return new NextResponse('Cashflow data is invalid or missing.', { status: 400 });
  }
  console.log('CFS prop data',cashflowData)

  const stream = await renderToStream(<MyPDFaccountPage id={id} subAccounts={subAccountsData} cashflow={cashflowData} transactions={transactionData}/>);
  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'application/pdf',
      // "Content-Disposition": `attachment; filename="cashflow-statement.pdf"`,
    },
  });
}