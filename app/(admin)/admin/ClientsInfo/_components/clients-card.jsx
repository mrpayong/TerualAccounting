"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel,
} from "@/components/ui/carousel";


// Custom date formatter: Month DD, YYYY
function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return `${months[d.getMonth()]} ${d.getDate().toString().padStart(2, "0")}, ${d.getFullYear()}`;
}




function CarouselDots() {
  const { selectedIndex, slideCount, api } = useCarousel()
  if (!slideCount) return null
  return (
    <div className="flex justify-center mt-2 gap-2">
      {Array.from({ length: slideCount }).map((_, idx) => (
        <button
          key={idx}
          className={`h-2 w-2 rounded-full transition-colors duration-200 ${
            idx === selectedIndex ? 'bg-zinc-300' : 'bg-neutral-200'
          }`}
          aria-label={`Go to slide ${idx + 1}`}
          onClick={() => api && api.scrollTo(idx)}
          type="button"
        />
      ))}
    </div>
  )
}

const ClientCard = ({ account }) => {
  const {
    name,
    owner,
    businessLine,
    type,
    contactNumber,
    birthDate,
    email,
    _count,
    buildingNumber,
    street,
    town,
    city,
    province,
    region,
    zip,
    branchCount,
    RDO,
    isHeadOffice,
    isIndividual,
    tin,
    createdAt,
    id,
    user,
  } = account;
  

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSlideChange = (idx) => setActiveIndex(idx);

  const goToSlide = (idx) => setActiveIndex(idx);
  const nextSlide = () => setActiveIndex((prev) => (prev + 1) % sectionTitles.length);
  const prevSlide = () => setActiveIndex((prev) => (prev - 1 + sectionTitles.length) % sectionTitles.length);











  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card
          className="hover:shadow-md transition-shadow group relative border border-gray-800 cursor-pointer"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium capitalize">{city}, {province}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {name}
            </div>
            <p className="text-xs text-muted-foreground">
              {type.charAt(0) + type.slice(1).toLowerCase()}
            </p>
          </CardContent>
          <CardFooter className="flex justify-between text-sm text-muted-foreground">
            <span>{_count?.transactions ?? 0} Transactions</span>
            <Button size="sm" variant="outline" onClick={e => { e.preventDefault(); setOpen(true); }}>
              View Details
            </Button>
          </CardFooter>
        </Card>
      </DialogTrigger>

<DialogContent className="[&>button]:hidden w-[95vw] max-w-full sm:max-w-2xl p-0 sm:p-6 overflow-hidden max-h-[90vh] rounded-lg">
  <DialogHeader>
    <DialogTitle className="capitalize text-2xl">{name}</DialogTitle>
    <DialogDescription className="text-sm">
      Details of the client's business.
    </DialogDescription>
  </DialogHeader>


  {/* Mobile: Carousel */}

    <Carousel className="w-screen md:hidden" aria-label="Swipeable company info sections" opts={{ align: "center", loop: false }}>
      <CarouselContent>
        {/* Basic Info */}
        <CarouselItem className="pr-0 pl-0 pb-4 pt-0 min-h-[10px] bg-slate-300">
          <section className="px-5">
            <h4 className="font-semibold text-center text-gray-700 mb-2">Basic Info</h4>
            <ul className="space-y-1 flex flex-col px-4 text-sm break-words list-none">
              <li>Company Name: {name}</li>
              <li>Owner: {owner}</li>
              <li>Line of Business: {businessLine}</li>
              <li>Type: {type.charAt(0) + type.slice(1).toLowerCase()}</li>
              <li>Contact Number: {contactNumber}</li>
              <li>Birth date: {formatDate(birthDate)}</li>
              <li>Email: {email}</li>
              <li>Transactions: {_count?.transactions ?? 0}</li>
            </ul>
          </section>
        </CarouselItem>
        {/* Address */}
        <CarouselItem className="pr-0 pl-0 pb-4 pt-0 min-h-[10px] bg-slate-300">
          <section className="px-5">
            <h4 className="font-semibold text-center text-gray-700 mb-2">Address</h4>
            <ul className="space-y-1 flex flex-col px-4 text-sm break-words list-none">
              <li>Building No.: {buildingNumber}</li>
              <li>Street: {street}</li>
              <li>Town: {town}</li>
              <li>City: {city}</li>
              <li>Province: {province}</li>
              <li>Region: {region}</li>
              <li>ZIP: {zip}</li>
            </ul>
          </section>
        </CarouselItem>

        <CarouselItem className="pr-0 pl-0 pb-4 pt-0 min-h-[10px] bg-slate-300">
          <section className="px-5">
            <h4 className="font-semibold text-center text-gray-700 mb-2">Tax Info</h4>
            <ul className="space-y-1 flex flex-col px-4 text-sm break-words list-none">
              <li className={isHeadOffice ? "text-black font-semibold" : "text-slate-400 font-semibold"}>Branches: {isHeadOffice ? branchCount : "Not head office"}</li>
              <li>RDO: {RDO?.slice(-3)}</li>
              <li>Head Office: {isHeadOffice ? "Yes" : "No"}</li>
              <li>Business category: {isIndividual ? "Individual" : "Non-individual"}</li>
              <li>TIN: {Array.isArray(tin) ? tin.join("-") : tin}</li>
            </ul>
          </section>
        </CarouselItem>

        <CarouselItem className="pr-0 pl-0 pb-4 pt-0 min-h-[10px] bg-slate-300">
          <section className="px-5">
            <h4 className="font-semibold text-center text-gray-700 mb-2">Affiliating Information</h4>
           <ul className="space-y-1 flex flex-col px-4 text-sm break-words list-none">
              <li>Client since: {formatDate(createdAt)}</li>
              <li>Account id: {id}</li>
              <li>Handled by: {user ? `${user.Fname} ${user.Lname}` : "N/A"}</li>
            </ul>
          </section>
        </CarouselItem>
        
      </CarouselContent>
      <CarouselDots />
    </Carousel>


  {/* Desktop: Grid */}
  <div className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
    {/* Basic Info */}
    <section>
      <h4 className="font-semibold text-gray-700 mb-2">Basic Info</h4>
      <div className="space-y-1 text-sm">
        <div><span className="font-medium text-gray-500">Company Name:</span> {name}</div>
        <div><span className="font-medium text-gray-500">Owner:</span> {owner}</div>
        <div><span className="font-medium text-gray-500">Line of Business:</span> {businessLine}</div>
        <div><span className="font-medium text-gray-500">Type:</span> {type.charAt(0) + type.slice(1).toLowerCase()}</div>
        <div><span className="font-medium text-gray-500">Contact Number:</span> {contactNumber}</div>
        <div><span className="font-medium text-gray-500">Birth date:</span> {formatDate(birthDate)}</div>
        <div><span className="font-medium text-gray-500">Email:</span> {email}</div>
        <div><span className="font-medium text-gray-500">Transactions:</span> {_count?.transactions ?? 0}</div>
      </div>
    </section>
    {/* Address */}
    <section>
      <h4 className="font-semibold text-gray-700 mb-2">Address</h4>
      <div className="space-y-1 text-sm">
        <div><span className="font-medium text-gray-500">Building No.:</span> {buildingNumber}</div>
        <div><span className="font-medium text-gray-500">Street:</span> {street}</div>
        <div><span className="font-medium text-gray-500">Town:</span> {town}</div>
        <div><span className="font-medium text-gray-500">City:</span> {city}</div>
        <div><span className="font-medium text-gray-500">Province:</span> {province}</div>
        <div><span className="font-medium text-gray-500">Region:</span> {region}</div>
        <div><span className="font-medium text-gray-500">ZIP:</span> {zip}</div>
      </div>
    </section>
    {/* Tax Info */}
    <section>
      <h4 className="font-semibold text-gray-700 mb-2">Tax Info</h4>
      <div className="space-y-1 text-sm">
        <div>
          <span className="font-medium text-gray-500">Branches:</span>{" "}
          {isHeadOffice ? branchCount : <span className="text-gray-500">Not head office</span>}
        </div>
        <div>
          <span className="font-medium text-gray-500">RDO:</span> {RDO?.slice(-3)}
        </div>
        <div>
          <span className="font-medium text-gray-500">Head Office:</span>{" "}
          <span className={isHeadOffice ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
            {isHeadOffice ? "Yes" : "No"}
          </span>
        </div>
        <div>
          <span className="font-medium text-gray-500">Business category:</span>{" "}
          {isIndividual ? "Individual" : "Non-individual"}
        </div>
        <div>
          <span className="font-medium text-gray-500">TIN:</span>{" "}
          {Array.isArray(tin) ? tin.join("-") : tin}
        </div>
      </div>
    </section>
    {/* Affiliating Info */}
    <section>
      <h4 className="font-semibold text-gray-700 mb-2">Affiliating Information</h4>
      <div className="space-y-1 text-sm">
        <div>
          <span className="font-medium text-gray-500">Client since:</span> {formatDate(createdAt)}
        </div>
        <div>
          <span className="font-medium text-gray-500">Account id:</span> {id}
        </div>
        <div>
          <span className="font-medium text-gray-500">Handled by:</span>{" "}
          {user ? `${user.Fname} ${user.Lname}` : "N/A"}
        </div>
      </div>
    </section>
  </div>





        <div className="flex justify-around">
        <DialogFooter className="pb-2">
          <DialogClose asChild>
            <Button
              variant="outline"
              className=" 
              text-rose-600 hover:text-white
              bg-white hover:bg-rose-600
              border-rose-600 hover:border-0 
              max-w-xs sm:w-auto"
            >
              Close
            </Button>
          </DialogClose>
        </DialogFooter></div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientCard;