

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

const MyPDFcfsPage = ({ cashflow, transactions, subAccounts }) => {
  // Defensive fallback for props
  const txs = transactions || cashflow?.transactions || [];
  const subs = subAccounts || cashflow?.subAccounts || [];
  const latestCashflow = cashflow;

  if (!latestCashflow || (txs.length === 0 && subs.length === 0)) {
    return (
      <Document>
        <Page style={styles.page}>
          <Text>No Cashflow data available.</Text>
        </Page>
      </Document>
    );
  }
  console.log('cashflow[1]: ', cashflow)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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
      case "SEMI_ANNUAL":
        return "Semi Annual";
      default:
        "" // Default classification for longer ranges
        break;
    }
  }

  const timeFrame = cashflow.periodCashFlow

  const statementDate = cashflow.date
    ? new Date(cashflow.date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";



  // Group subAccounts by first transaction's Activity
  const groupSubAccountsByActivity = (activity) =>
    subs.filter(
      (subAccount) =>
        Array.isArray(subAccount.transactions) &&
        subAccount.transactions.length > 0 &&
        subAccount.transactions[0].Activity === activity
    );

  // Group transactions by Activity
  const groupTransactionsByActivity = (activity) =>
    txs.filter((transaction) => transaction.Activity === activity);

  // Helper for formatting amounts
  const formatAmount = (amount) =>
    new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(amount);

  // Build sorted entries for each activity
  const buildSortedEntries = (activity) => {
    const txEntries = groupTransactionsByActivity(activity).map((transaction) => ({
      type: transaction.type,
      description: transaction.particular || transaction.description,
      amount: transaction.type === "EXPENSE" ? -transaction.amount : transaction.amount,
      isTransaction: true,
    }));
    const subAccountEntries = groupSubAccountsByActivity(activity).map((subAccount) => {
      // Use the first transaction for type
      const firstTx = subAccount.transactions[0];
      return {
        type: firstTx.type,
        description: subAccount.name,
        amount: firstTx.type === "EXPENSE" ? -subAccount.balance : subAccount.balance,
        isTransaction: false,
      };
    });
    return [...txEntries, ...subAccountEntries].sort((a, b) => {
      if (a.type === "INCOME" && b.type === "EXPENSE") return -1;
      if (a.type === "EXPENSE" && b.type === "INCOME") return 1;
      return 0;
    });
  };

  const sortedOperatingEntries = buildSortedEntries("OPERATION");
  const sortedInvestingEntries = buildSortedEntries("INVESTMENT");
  const sortedFinanceEntries = buildSortedEntries("FINANCING");

  const transactionDates = transactions.map((transaction) => 
    new Date(transaction.date)
  )

  const startDate =  new Date(Math.min(...transactionDates));
  const endDate = new Date(Math.max(...transactionDates));


  const formattedStartDate = formatDate(startDate, 'MMMM dd, yyyy');
  const formattedEndDate = formatDate(endDate, 'MMMM dd, yyyy')












  return (
    <Document>
      <Page style={styles.page}>
        <View style={styles.table}>
          <View style={styles.letterheadContainer}>
            <View style={styles.letterheadRow}>
              <Image src="/PDFlogo2.png" style={styles.logo} />
              <View style={styles.letterheadText}>
                <Text style={styles.title}>Teruel Accounting</Text>
                <Text style={styles.subtitle}>{deterimeTimeFrame(timeFrame)} Cashflow Statement</Text>
                <Text style={styles.subtitle}>
                  {/* {statementDate ? `As of: ${statementDate}` : ""} */}
                  {startDate.toDateString() === endDate.toDateString()
                      ? <Text style={styles.subtitle}>As of: {formattedStartDate}</Text>
                      : <Text style={styles.subtitle}>For the period: {formattedStartDate} - {formattedEndDate}</Text>
                    }
                </Text>
              </View>
            </View>
          </View>

          {/* OPERATING ACTIVITIES */}
          <View style={styles.rowProper}>
            <Text style={styles.leftCellProper}>Operating Activities:</Text>
            <Text style={styles.rightCellProper}>Amount</Text>
          </View>
          {sortedOperatingEntries.map((entry, index) => (
            <View style={styles.row} key={index}>
              <Text style={styles.leftCell}>{entry.particular || entry.description}</Text>
              <Text style={{
                ...styles.rightCell,
                color: entry.type === "INCOME" ? "green" : "red",
              }}>{formatAmount(entry.amount)}</Text>
            </View>
          ))}
          <View style={styles.row}>
            <Text style={styles.leftCell}>Net Cash from Operating Activity</Text>
            <Text style={{ ...styles.rightCell, borderTop: "1px solid #000" }}>
              {formatAmount(latestCashflow.activityTotal?.[0] ?? 0)}
            </Text>
          </View>

          {/* INVESTMENT ACTIVITIES */}
          <View style={styles.rowProper}>
            <Text style={styles.leftCellProper}>Investing Activities:</Text>
          </View>
          {sortedInvestingEntries.map((entry, index) => (
            <View style={styles.row} key={index}>
              <Text style={styles.leftCell}>{entry.particular ||entry.description}</Text>
              <Text style={{
                ...styles.rightCell,
                color: entry.type === "INCOME" ? "green" : "red",
              }}>{formatAmount(entry.amount)}</Text>
            </View>
          ))}
          <View style={styles.row}>
            <Text style={styles.leftCell}>Net Cash from Investment Activity</Text>
            <Text style={{ ...styles.rightCell, borderTop: "1px solid #000" }}>
              {formatAmount(latestCashflow.activityTotal?.[1] ?? 0)}
            </Text>
          </View>

          {/* FINANCING ACTIVITIES */}
          <View style={styles.rowProper}>
            <Text style={styles.leftCellProper}>Financing Activities:</Text>
          </View>
          {sortedFinanceEntries.map((entry, index) => (
            <View style={styles.row} key={index}>
              <Text style={styles.leftCell}>{entry.particular || entry.description}</Text>
              <Text style={{
                ...styles.rightCell,
                color: entry.type === "INCOME" ? "green" : "red",
              }}>{formatAmount(entry.amount)}</Text>
            </View>
          ))}
          <View style={styles.row}>
            <Text style={styles.leftCell}>Net Cash from Financing Activity</Text>
            <Text style={{ ...styles.rightCell, borderTop: "1px solid #000" }}>
              {formatAmount(latestCashflow.activityTotal?.[2] ?? 0)}
            </Text>
          </View>

          {/* TOTALS */}
          <View style={styles.rowProper}>
            <Text style={styles.leftCellProper}>Gross:</Text>
            <Text style={styles.rightCellProper}>{formatAmount(latestCashflow.netChange ?? 0)}</Text>
          </View>
          <View style={styles.rowProper}>
            <Text style={styles.leftCellProper}>Beginning Net Cash:</Text>
            <Text style={styles.rightCellProper}>{formatAmount(latestCashflow.startBalance ?? 0)}</Text>
          </View>
          <View style={styles.rowProper}>
            <Text style={styles.leftCellProper}>Ending Balance:</Text>
            <Text style={styles.rightCellProper}>{formatAmount(latestCashflow.endBalance ?? 0)}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default MyPDFcfsPage;

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