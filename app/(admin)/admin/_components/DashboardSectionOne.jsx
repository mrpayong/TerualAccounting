'use client'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  Users,
  ScrollText,
  PhilippinePeso,
  BookUser,
} from 'lucide-react'
import React from 'react'
import { useCarousel } from "@/components/ui/carousel"
import { Zen_Kaku_Gothic_Antique } from 'next/font/google'

const fontZenKaku = Zen_Kaku_Gothic_Antique({
  subsets:["latin"],
  weight: ["400", "500", "700", "900"],
})

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

const DashboardSectionOne = ({transactionCount, accountCount, UserCount, activityCount}) => {
  const cards = [
    {
      label: 'Clients',
      value: accountCount, // Use the prop directly
      change: 'Clients of the firm',
      changeColor: 'text-slate-500',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      Icon: Users,
    },
  {
    label: 'Activity logs',
    value: activityCount,
    change: 'Logs of the activities',
    changeColor: 'text-slate-500',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
    Icon: ScrollText,
  },
  {
    label: 'Transcations',
    value: transactionCount,
    change: 'All transaction entries',
    changeColor: 'text-slate-500',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    Icon: PhilippinePeso,
  },
  {
    label: 'Users',
    value: UserCount,
    change: 'Employees with access',
    changeColor: 'text-slate-500',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    Icon: BookUser,
  },
]
  return (
    <div className={`${fontZenKaku.className} mb-6`}>
      {/* Mobile: Carousel */}
      <div className="block sm:hidden">
        <Carousel>
          <CarouselContent>
            {cards.map((card, idx) => (
              <CarouselItem key={idx} className="pl-2">
                <Card className="min-w-[85vw] max-w-xs mx-auto">
                  <CardHeader className="pb-0">
                    <CardTitle className='!font-bold text-base'>
                      {card.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 py-0">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-3xl font-bold text-slate-900">
                          {card.value}
                        </h3>
                      </div>
                      <div className={`h-14 w-14 ${card.iconBg} rounded-full flex items-center justify-center`}>
                        <card.Icon className={`${card.iconColor} w-9 h-9`} />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className={`font-normal tracking-wide text-sm flex items-center mt-1 ${card.changeColor}`}>
                    {card.change}
                  </CardFooter>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselDots />
        </Carousel>
      </div>

      {/* Medium: ScrollArea */}
      <div className="hidden sm:block lg:hidden">
        <ScrollArea>
          <div className="flex flex-nowrap gap-4 py-1 px-1 overflow-x-auto">
            {cards.map((card, idx) => {
              const Arrow = card.Arrow
              const Icon = card.Icon
              return (
                <Card key={idx} className="min-w-[320px] max-w-xs flex-shrink-0">
                  <CardHeader className="pb-0">
                    <CardTitle className='!font-bold text-base'>
                      {card.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 py-0">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-4xl font-bold text-slate-900">
                          {card.value}
                        </h3>
                      </div>
                      <div className={`h-12 w-12 ${card.iconBg} rounded-full flex items-center justify-center`}>
                        <Icon className={`${card.iconColor} w-6 h-6`} />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className={`font-normal text-sm flex items-center mt-1 ${card.changeColor}`}>
                    {card.change}
                  </CardFooter>
                </Card>
              )
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Large: Grid */}
      <div className="hidden lg:grid grid-cols-4 gap-4">
        {cards.map((card, idx) => (
          <Card key={idx}>
            <CardHeader className="pb-0">
              <CardTitle className='!font-bold text-base'>
                {card.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    {card.value}
                  </h3>
                  <p className={`font-normal text-sm flex items-center mt-1 ${card.changeColor}`}>
                    {card.change}
                  </p>
                </div>
                <div className={`h-12 w-12 ${card.iconBg} rounded-full flex items-center justify-center`}>
                  <card.Icon className={`${card.iconColor} w-6 h-6`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default DashboardSectionOne