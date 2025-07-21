"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AlignJustify, ArchiveX, Book, BookMinus, BookPlus, ChartBarBig, ChevronDown, ChevronUp, IdCard, Inbox, InboxIcon, Loader2, MailIcon, Table, X } from "lucide-react";
import Link from "next/link";
import { Box, Collapse, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, useMediaQuery, useTheme } from "@mui/material";

const SideNavBar = ({ accountId }) => {
  const [isDrop, setIsDrop] = useState(false);
  const [loadingLink, setLoadingLink] = useState(null);
  const theme = useTheme();

  const isMobile = typeof window !== "undefined"
    ? useMediaQuery(theme.breakpoints.down("sm"))
    : false;

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  const anchor = hydrated && isMobile ? "bottom" : "left";


  const handleLinkClick = (linkId) => {
    setLoadingLink(linkId); // Set the clicked link as loading
  };
    const [open, setOpen] = useState(false);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };
  const handleDrop = () => {
    setIsDrop(!isDrop);
  };

  const DrawerList = (
      <Box sx={{ width: anchor === "left" ? 250 : "auto" }} role="presentation">
        <List>
          <ListItem className="bg-yellow-200">
            <ListItemText className="text-center" primary="Menu"/>
          </ListItem>
          <Divider/>

          <ListItemButton disabled={loadingLink} onClick={handleDrop}>
            <ListItemIcon>
              <Book />
            </ListItemIcon>
            <ListItemText primary="Book of Accounts" />
            {isDrop ? <ChevronUp /> : <ChevronDown />}
          </ListItemButton>

          <Collapse in={isDrop} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton
                disabled={loadingLink}
                sx={{ pl: 4 }} 
                href={`/CashReceiptBook/${accountId}`}
                onClick={() => handleLinkClick("cashReceipt")}>
                <ListItemIcon>
                  {loadingLink === "cashReceipt" ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <BookPlus />
                  )}
                </ListItemIcon>
                <ListItemText primary="Cash Receipt Book" />
              </ListItemButton>
              
              <ListItemButton 
                sx={{ pl: 4 }} 
                href={`/DisbursementReceiptBook/${accountId}`}
                onClick={() => handleLinkClick("disbursementReceipt")}
                disabled={loadingLink}>
                <ListItemIcon>
                  {loadingLink === "disbursementReceipt" ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <BookMinus />
                  )}
                </ListItemIcon>
                <ListItemText primary="Cash Disbursement Book" />
              </ListItemButton>
            </List>
          </Collapse>       

          <ListItem disablePadding>
            <ListItemButton
              disabled={loadingLink}
              href={`/SubAccounts/${accountId}`}
              onClick={() => handleLinkClick("groupedTransactions")}
            >
              <ListItemIcon>
                {loadingLink === "groupedTransactions" ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <ChartBarBig />
                )}
              </ListItemIcon>
              <ListItemText primary="Grouped Transaction" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              disabled={loadingLink}
              href={`/CashflowStatement/${accountId}`}
              onClick={() => handleLinkClick("cashflow")}
            >
              <ListItemIcon>
                {loadingLink === "cashflow" ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Table />
                )}
              </ListItemIcon>
              <ListItemText primary="Cashflow Statement" />
            </ListItemButton>
          </ListItem>
          
          <ListItem disablePadding>
            <ListItemButton
              disabled={loadingLink}
              href={`/Archive/${accountId}`}
              onClick={() => handleLinkClick("archive")}
            >
              <ListItemIcon>
                {loadingLink === "archive" ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <ArchiveX />
                )}
              </ListItemIcon>
              <ListItemText primary="Archive" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              disabled={loadingLink}
              href={`/ClientInfo/${accountId}`}
              onClick={() => handleLinkClick("clientInfo")}
            >
              <ListItemIcon>
                {loadingLink === "clientInfo" ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <IdCard />
                )}
              </ListItemIcon>
              <ListItemText primary="Client Profile" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>    
  )

  return (
    <>
      {/* Button Under Transaction Count */}
      <div>
        <Button
          className="w-full sm:w-auto px-4 py-2 
          bg-white text-black hover:bg-white 
          shadow-none hover:[box-shadow:inset_0_2px_8px_0_rgba(0,0,0,0.3)]
           flex items-center justify-center"
          onClick={toggleDrawer(true)}
        >
          <AlignJustify />
        </Button>
      </div>

      {/* Hovering Side Navigation Bar */}

      <Drawer 
        open={open} 
        onClose={toggleDrawer(false)}
        anchor={anchor}
        ModalProps={{
          keepMounted: true
        }}
        slotProps={{
          paper: {
            sx: anchor === "bottom"
              ? { borderTopLeftRadius: 16, borderTopRightRadius: 16, minHeight: 200 }
              : {},
          },
        }}>
        {DrawerList}
      </Drawer>
    </>
  );
};

export default SideNavBar;






