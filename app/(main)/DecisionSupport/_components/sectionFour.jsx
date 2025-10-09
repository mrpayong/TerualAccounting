"use client"
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Brain, Loader2 } from 'lucide-react';
import React, { useState } from 'react'
import { useFinancialData } from '../_context/FinancialDataContext';
import { Zen_Kaku_Gothic_Antique } from 'next/font/google';


const fontZenKaku = Zen_Kaku_Gothic_Antique({
  subsets:["latin"],
  weight: ["400", "500", "700", "900"],
})

const SectionFour = () => {

  const { overallAnalysis, overallAnalysisLoading } = useFinancialData();

  return (
   <div className="mt-6">
      <Card>
        <CardHeader className={`${fontZenKaku.className} p-4`}>
          <div className="flex flex-col-reverse md:flex-row md:justify-between gap-2 items-center">
            <div>
              <CardTitle className="!font-bold text-xl text-center md:text-start">Forecast Analysis</CardTitle>
              <CardDescription className="font-nomral text-sm tracking-wide text-center md:text-start">
                Recommendations based on AI's financial data analysis.
              </CardDescription>
            </div>
            <Badge
               className="
                shine-effect
                flex items-center gap-1
                bg-black text-white
                px-2 py-0.5
                rounded-full
                
                transition
                hover:bg-gradient-to-r hover:from-blue-500 hover:to-violet-500
                hover:shadow-lg hover:shadow-blue-500/60
                cursor-pointer
                relative
                overflow-hidden
              "
            >
              <Brain className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 sm:mr-2" />
              <span className="!text-xs sm:!text-sm md:!text-base
                !font-medium tracking-wide truncate">AI Generated</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className={`${fontZenKaku.className}`}>
          {overallAnalysisLoading ? (
            <div className="flex flex-col items-center justify-center h-56 w-full relative">
              {/* Animated gradient ring */}
              <span className="relative flex h-16 w-16 mb-4">
                <span className="animate-spin absolute inline-flex h-full w-full rounded-full bg-gradient-to-tr from-blue-400 via-violet-400 to-blue-400 opacity-30"></span>
                <span className="relative inline-flex rounded-full h-16 w-16 bg-white items-center justify-center border-4 border-blue-400">
                  <Loader2 className="text-blue-500 animate-spin" size={32} />
                </span>
              </span>
              {/* Loading text */}
              <span className="text-blue-700 font-semibold mb-4 text-center text-base md:text-lg">
                Collecting data and making analysis.
              </span>
              {/* Shimmer skeleton bar */}
              <div className="w-full max-w-xs">
                <div className="h-4 rounded bg-gradient-to-r from-blue-100 via-violet-100 to-blue-100 animate-pulse" />
              </div>
            </div>
          ) : overallAnalysis?.success ? (
            <div className="w-full overflow-x-auto lg:overflow-x-visible">
              <div className="grid gap-4
                grid-flow-col grid-rows-1 auto-cols-[85vw] sm:auto-cols-[340px]
                lg:grid-cols-2 lg:grid-rows-2 lg:auto-cols-fr"
              >
                {overallAnalysis.insights?.map((insight, index) => (
                  <Card
                    key={insight.id || index}
                    className="
                      border-l-4 border-l-blue-500
                      transition hover:shadow-xl hover:-translate-y-1
                      duration-200 bg-white rounded-xl cursor-pointer
                      h-full
                    "
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="font-bold text-base sm:text-lg lg:text-xl">
                          {insight.recommendationTitle}
                        </CardTitle>
                        <Badge className={
                          insight.impactLevel === "HIGH IMPACT"
                            ? "font-medium bg-red-100 text-red-800 text-center"
                            : insight.impactLevel === "MEDIUM IMPACT"
                              ? "font-medium bg-yellow-100 text-yellow-800 text-center"
                              : "font-medium bg-blue-100 text-blue-800 text-center"
                        }>
                          {insight.impactLevel}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <p className="font-medium text-xs sm:text-sm lg:text-base text-gray-600">
                        {insight.detail}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40">
              <span className="font-bold text-base md:text-lg text-gray-400">No analysis generated yet.</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default SectionFour
