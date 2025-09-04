import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent } from "@mui/material";
import { PieChart, Pie, Cell, Label, ResponsiveContainer } from "recharts";
import { CircleSlash, Leaf, TriangleAlert } from "lucide-react";
import '../App.css';

const fuelRatingMap = {
  BIOMASS: "Green",
  CCGT: "Not Green",
  COAL: "Not Green",
  INTELEC: "Neutral",
  INTEW: "Neutral",
  INTFR: "Neutral",
  INTGRNL: "Neutral",
  INTIFA2: "Neutral",
  INTIRL: "Neutral",
  INTNED: "Neutral",
  INTNEM: "Neutral",
  INTNSL: "Neutral",
  INTVKL: "Neutral",
  NPSHYD: "Green",
  NUCLEAR: "Green",
  OCGT: "Not Green",
  OIL: "Not Green",
  OTHER: "Neutral",
  PS: "Green",
  WIND: "Green",
};

const fuelLabels = {
  BIOMASS: "Biomass",
  CCGT: "Gas Turbine",
  COAL: "Coal fired",
  INTELEC: "Interconnect: Eleclink",
  INTEW: "Interconnect: Ireland",
  INTFR: "Interconnect: France",
  INTGRNL: "Interconnect: Ireland",
  INTIFA2: "Interconnect: IFA2",
  INTIRL: "Interconnect: N.Ireland",
  INTNED: "Interconnect: Netherlands",
  INTNEM: "Interconnect: Belgium",
  INTNSL: "Interconnect: Norway",
  INTVKL: "Interconnect: Denmark",
  NPSHYD: "Non-pumped hydro",
  NUCLEAR: "Nuclear",
  OCGT: "Gas turbine",
  OIL: "Oil fired",
  OTHER: "Miscellaneous",
  PS: "Pumped storage",
  WIND: "Wind turbines",
}

function getFuelRating(snapshot) {
    const totalByRatings = { Green: 0, Neutral: 0, "Not Green": 0 };
    let totalMW = 0;
    let totalPositiveMW = 0; // to exclude negative values for divisions
    
    // Calculate totals per fuel rating & overall total
    for (const data of snapshot.data) {
        const rating = fuelRatingMap[data.fuelType] ?? "Neutral";   // default to neutral
        totalByRatings[rating] += data.generation;
        totalMW += data.generation;
        totalPositiveMW += Math.max(0, data.generation);
    };

    const denom = totalMW > 0 ? totalMW : (totalPositiveMW || 1);   // avoid division by zero

    return {
        totalByRatings,
        totalMW,
        greenPerc: (totalByRatings.Green / denom),
        fossilPerc: (totalByRatings["Not Green"] / denom),
    }
}

// Calculate energy consumption
function isFossilHeavy(fossilPerc, fossilBaseline) {
    // Return true if fossilPerc is greater than fossilBaseline
    return fossilPerc > fossilBaseline;
}

// Check if current snapshot is newer
const isNewer = (a, b) => {
    // if no newer data, return false, if no older data, return true
    if (!a) return false;
    if (!b) return true;

    // first compare startTime
    const timeA = Date.parse(a.startTime);
    const timeB = Date.parse(b.startTime);
    if (timeA != timeB) return timeA > timeB;

    // else compare settlementPeriod if available
    return (a.settlementPeriod ?? 0) > (b.settlementPeriod ?? 0);
}

export function GridGreenness({ snapshot, fossilBaseline = 0.5 }) {
    const [openTable, setOpenTable] = useState(false);

    // Center label for donut chart
    const CenterLabel = ({ viewBox }) => {
        const { cx, cy } = viewBox;
        return (
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
                <tspan dy={-5} fontSize="26" fontWeight="700">{(greenPerc * 100).toFixed(0)}%</tspan>
                <tspan x={cx} dy={22} fontSize="12">Green share</tspan>
            </text>
        )
    }

    // Track latest snapshot
    const [latestToday, setLatestToday] = useState(snapshot);
    useEffect(() => {
        if (isNewer(snapshot, latestToday)) setLatestToday(snapshot);
    }, [snapshot, latestToday]);

    // Aggregate today's data and track day
    const [day, setDay] = useState(null);
    const [aggFuelData, setAggFuelData] = useState({});

    useEffect(() => {
        // get date from startTime
        const currentDay = new Date(latestToday.startTime).toDateString();

        if (day !== currentDay) {
            // new day, reset aggregation
            setDay(currentDay);
            setAggFuelData({});
        }

        setAggFuelData(prev => {
            const newAgg = { ...prev };
            for (const fuel of latestToday.data) {
                newAgg[fuel.fuelType] = (newAgg[fuel.fuelType] || 0) + fuel.generation;
            }
            return newAgg;
        });
    },[day, latestToday]);

    // Create aggregated snapshot for today
    const todayAgg = useMemo(() => ({
        startTime: latestToday.startTime,
        settlementPeriod: latestToday.settlementPeriod,
        data: Object.entries(aggFuelData).map(([fuelType, generation]) => ({ fuelType, generation }) )
    }), [aggFuelData, latestToday]);

    // Calculate greenness
    const { totalByRatings, totalMW, greenPerc, fossilPerc } = useMemo(() =>
        getFuelRating(todayAgg)
    , [todayAgg]);

    const fossilHeavy = isFossilHeavy(fossilPerc, fossilBaseline);

    const badgeBg = fossilHeavy ? "var(--badge-not-green)" : greenPerc > 0.6 ? "var(--badge-green)" : "var(--badge-neutral)";
    const badgeColor = fossilHeavy ? "var(--not-green)" : greenPerc > 0.6 ? "var(--green)" : "var(--neutral)";
    
    // Description for fossil consumption else display greenness status
    const badgeDesc = fossilHeavy
        ? "Fossil fuel consumption is high"
        : greenPerc > 0.6
            ? "Greener than usual"
            : "Average consumption";

    const chartData = [
        { label: 'Green', value: totalByRatings.Green, color: "var(--green)" },
        { label: 'Neutral', value: totalByRatings.Neutral, color: "var(--neutral)" },
        { label: 'Not Green', value: totalByRatings["Not Green"], color: "var(--not-green)" },
    ]

    return (
        <div className="sm:max-md:w-[600px] max-w-4xl mx-auto p-4">
            <Card className="border border-gray-200">
                <CardContent>
                    <div className="flex justify-between items-center mb-4 font-bold">
                        <h3 className="sm:text-xl text-left ml-3">Grid Greenness (Today)</h3>
                    </div>
                    {/* Badge goes here */}
                    <div className="flex justify-left mb-4 ml-3">
                        <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold inset-ring inset-ring-gray-500/10" style={{ backgroundColor: badgeBg, color: badgeColor }}>
                            {fossilHeavy 
                            ? <TriangleAlert className="h-4 w-4 mr-1" />
                            : greenPerc > 0.6
                                ? <Leaf className="h-4 w-4 mr-1" />
                                : <CircleSlash className="h-4 w-4 mr-1 "/>
                            }
                            {badgeDesc}
                        </span>
                    </div>
                    <div className="ml-3 mt-1 mb-4 text-xs text-gray-600" aria-live="polite">
                        {fossilHeavy
                            ? "Fossil fuel consumption is higher than usual. Consider reducing your electricity usage during peak times to help lower carbon emissions."
                            : greenPerc > 0.6
                                ? "Great news! The grid is greener than usual. You can consider using more electricity during this time to take advantage of cleaner energy."
                                : "The grid is experiencing average consumption levels. You can use electricity as needed, but consider shifting usage to off-peak times if possible to help reduce strain on the grid."
                        }
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* Donut chart */}
                        <div className="flex flex-col items-center min-w-0">
                            <div className="w-full h-56">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart width={300} height={150}>
                                        <Pie 
                                            data={chartData}
                                            dataKey="value"
                                            nameKey="label"
                                            innerRadius={50}
                                            outerRadius={75}
                                            strokeWidth={6}
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={index} fill={entry.color} />
                                            ))}
                                            <Label content={<CenterLabel />} />
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        {/* Add labels on the right */}
                        <div className="text-sm flex flex-col justify-center">
                            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm" style={{ background: "var(--green)"}} />Green</div>
                            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm" style={{ background: "var(--neutral)"}} />Neutral</div>
                            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm" style={{ background: "var(--not-green)"}} />Not Green</div>
                            <p className="flex items-center mt-2 text-gray-600">Total {totalMW.toLocaleString()} MW</p>
                        </div>
                    </div>
                    
                    {/* List fuel types with generation */}
                    <div className={`grid overflow-hidden transition-[max-height] duration-300 ease-in-out ${openTable ? "max-h" : "max-h-[200px]"}`}>
                        <div className="overflow-x-auto">
                            <table className="min-w-full mt-4 text-xs sm:text-sm border border-gray-200">
                                <thead>
                                    <tr className="bg-gray-100 sticky top-0">
                                        <th className="text-left p-2">Fuel Type</th>
                                        <th className="text-right p-2">Generation (MW)</th>
                                        <th className="text-left p-2 pl-12">Category</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {todayAgg.data
                                        .sort((a, b) => b.generation - a.generation)
                                        .map((data) => (
                                            <tr key={data.fuelType} className="hover:bg-gray-50 text-gray-700">
                                                <td className="p-2 text-left">{fuelLabels[data.fuelType] || data.fuelType}</td>
                                                <td className="p-2 text-right">{data.generation.toLocaleString()}</td>
                                                <td className="p-2 pl-12 text-left" style={{ color: `${chartData.find(c => c.label === fuelRatingMap[data.fuelType])?.color}` }}>{fuelRatingMap[data.fuelType]}</td>
                                            </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {/* Expandable table */}
                    <button 
                        onClick={() => setOpenTable(!openTable)} 
                        className="mt-2 text-gray-600 hover:underline cursor-pointer" 
                        style={{ border: 'none', fontSize: '13px', backgroundColor: '#f5f5f5' }}
                    >
                        {openTable ? 'Hide' : 'Show More'}
                    </button>
                </CardContent>
            </Card>
        </div>
    );
}