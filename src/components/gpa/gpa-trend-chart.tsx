"use client"

import * as React from "react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { Semester } from "@/lib/types"
import { calculateGPA } from "@/lib/grade-logic"

interface GpaTrendChartProps {
  semesters: Semester[]
}

export default function GpaTrendChart({ semesters }: GpaTrendChartProps) {
  const chartData = React.useMemo(() => {
    return semesters.map(semester => ({
      name: semester.name,
      GPA: parseFloat(calculateGPA(semester.courses).toFixed(2)),
    }));
  }, [semesters]);

  if (!semesters || semesters.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>GPA Trend</CardTitle>
        <CardDescription>Your GPA performance over the semesters.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 20,
                left: -10,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 5]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))',
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="GPA" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
