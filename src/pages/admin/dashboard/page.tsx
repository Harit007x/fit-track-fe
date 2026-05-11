import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/data-table/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";

type Sale = {
  name: string;
  email: string;
  amount: string;
  status: string;
  date: string;
};

const recentSales: Sale[] = [
  {
    name: "Olivia Martin",
    email: "olivia.martin@email.com",
    amount: "+$1,999.00",
    status: "Success",
    date: "2023-01-23",
  },
  {
    name: "Jackson Lee",
    email: "jackson.lee@email.com",
    amount: "+$39.00",
    status: "Pending",
    date: "2023-02-12",
  },
  {
    name: "Isabella Nguyen",
    email: "isabella.nguyen@email.com",
    amount: "+$299.00",
    status: "Success",
    date: "2023-03-05",
  },
  {
    name: "William Kim",
    email: "will@email.com",
    amount: "+$99.00",
    status: "Processing",
    date: "2023-04-15",
  },
  {
    name: "Sofia Davis",
    email: "sofia.davis@email.com",
    amount: "+$39.00",
    status: "Success",
    date: "2023-05-20",
  },

  // Added records
  {
    name: "Ethan Brown",
    email: "ethan.brown@email.com",
    amount: "+$120.00",
    status: "Success",
    date: "2023-05-22",
  },
  {
    name: "Mia Wilson",
    email: "mia.wilson@email.com",
    amount: "+$75.00",
    status: "Pending",
    date: "2023-05-24",
  },
  {
    name: "Liam Anderson",
    email: "liam.anderson@email.com",
    amount: "+$430.00",
    status: "Success",
    date: "2023-05-25",
  },
  {
    name: "Ava Thomas",
    email: "ava.thomas@email.com",
    amount: "+$60.00",
    status: "Processing",
    date: "2023-05-26",
  },
  {
    name: "Noah Taylor",
    email: "noah.taylor@email.com",
    amount: "+$510.00",
    status: "Success",
    date: "2023-05-27",
  },
  {
    name: "Sophia Moore",
    email: "sophia.moore@email.com",
    amount: "+$88.00",
    status: "Pending",
    date: "2023-05-28",
  },
  {
    name: "James Harris",
    email: "james.harris@email.com",
    amount: "+$320.00",
    status: "Success",
    date: "2023-05-29",
  },
  {
    name: "Charlotte Clark",
    email: "charlotte.clark@email.com",
    amount: "+$140.00",
    status: "Processing",
    date: "2023-05-30",
  },
  {
    name: "Benjamin Lewis",
    email: "benjamin.lewis@email.com",
    amount: "+$210.00",
    status: "Success",
    date: "2023-06-01",
  },
  {
    name: "Amelia Walker",
    email: "amelia.walker@email.com",
    amount: "+$65.00",
    status: "Pending",
    date: "2023-06-02",
  },
  {
    name: "Lucas Hall",
    email: "lucas.hall@email.com",
    amount: "+$390.00",
    status: "Success",
    date: "2023-06-03",
  },
  {
    name: "Harper Allen",
    email: "harper.allen@email.com",
    amount: "+$55.00",
    status: "Processing",
    date: "2023-06-04",
  },
  {
    name: "Henry Young",
    email: "henry.young@email.com",
    amount: "+$175.00",
    status: "Success",
    date: "2023-06-05",
  },
  {
    name: "Ella Hernandez",
    email: "ella.hernandez@email.com",
    amount: "+$245.00",
    status: "Pending",
    date: "2023-06-06",
  },
  {
    name: "Alexander King",
    email: "alex.king@email.com",
    amount: "+$310.00",
    status: "Success",
    date: "2023-06-07",
  },
];



export const description = "An interactive area chart";
const chartData = [
  { date: "2024-04-01", desktop: 222, mobile: 150 },
  { date: "2024-04-02", desktop: 97, mobile: 180 },
  { date: "2024-04-03", desktop: 167, mobile: 120 },
  { date: "2024-04-04", desktop: 242, mobile: 260 },
  { date: "2024-04-05", desktop: 373, mobile: 290 },
  { date: "2024-04-06", desktop: 301, mobile: 340 },
  { date: "2024-04-07", desktop: 245, mobile: 180 },
  { date: "2024-04-08", desktop: 409, mobile: 320 },
  { date: "2024-04-09", desktop: 59, mobile: 110 },
  { date: "2024-04-10", desktop: 261, mobile: 190 },
  { date: "2024-04-11", desktop: 327, mobile: 350 },
  { date: "2024-04-12", desktop: 292, mobile: 210 },
  { date: "2024-04-13", desktop: 342, mobile: 380 },
  { date: "2024-04-14", desktop: 137, mobile: 220 },
  { date: "2024-04-15", desktop: 120, mobile: 170 },
  { date: "2024-04-16", desktop: 138, mobile: 190 },
  { date: "2024-04-17", desktop: 446, mobile: 360 },
  { date: "2024-04-18", desktop: 364, mobile: 410 },
  { date: "2024-04-19", desktop: 243, mobile: 180 },
  { date: "2024-04-20", desktop: 89, mobile: 150 },
  { date: "2024-04-21", desktop: 137, mobile: 200 },
  { date: "2024-04-22", desktop: 224, mobile: 170 },
  { date: "2024-04-23", desktop: 138, mobile: 230 },
  { date: "2024-04-24", desktop: 387, mobile: 290 },
  { date: "2024-04-25", desktop: 215, mobile: 250 },
  { date: "2024-04-26", desktop: 75, mobile: 130 },
  { date: "2024-04-27", desktop: 383, mobile: 420 },
  { date: "2024-04-28", desktop: 122, mobile: 180 },
  { date: "2024-04-29", desktop: 315, mobile: 240 },
  { date: "2024-04-30", desktop: 454, mobile: 380 },
  { date: "2024-05-01", desktop: 165, mobile: 220 },
  { date: "2024-05-02", desktop: 293, mobile: 310 },
  { date: "2024-05-03", desktop: 247, mobile: 190 },
  { date: "2024-05-04", desktop: 385, mobile: 420 },
  { date: "2024-05-05", desktop: 481, mobile: 390 },
  { date: "2024-05-06", desktop: 498, mobile: 520 },
  { date: "2024-05-07", desktop: 388, mobile: 300 },
  { date: "2024-05-08", desktop: 149, mobile: 210 },
  { date: "2024-05-09", desktop: 227, mobile: 180 },
  { date: "2024-05-10", desktop: 293, mobile: 330 },
  { date: "2024-05-11", desktop: 335, mobile: 270 },
  { date: "2024-05-12", desktop: 197, mobile: 240 },
  { date: "2024-05-13", desktop: 197, mobile: 160 },
  { date: "2024-05-14", desktop: 448, mobile: 490 },
  { date: "2024-05-15", desktop: 473, mobile: 380 },
  { date: "2024-05-16", desktop: 338, mobile: 400 },
  { date: "2024-05-17", desktop: 499, mobile: 420 },
  { date: "2024-05-18", desktop: 315, mobile: 350 },
  { date: "2024-05-19", desktop: 235, mobile: 180 },
  { date: "2024-05-20", desktop: 177, mobile: 230 },
  { date: "2024-05-21", desktop: 82, mobile: 140 },
  { date: "2024-05-22", desktop: 81, mobile: 120 },
  { date: "2024-05-23", desktop: 252, mobile: 290 },
  { date: "2024-05-24", desktop: 294, mobile: 220 },
  { date: "2024-05-25", desktop: 201, mobile: 250 },
  { date: "2024-05-26", desktop: 213, mobile: 170 },
  { date: "2024-05-27", desktop: 420, mobile: 460 },
  { date: "2024-05-28", desktop: 233, mobile: 190 },
  { date: "2024-05-29", desktop: 78, mobile: 130 },
  { date: "2024-05-30", desktop: 340, mobile: 280 },
  { date: "2024-05-31", desktop: 178, mobile: 230 },
  { date: "2024-06-01", desktop: 178, mobile: 200 },
  { date: "2024-06-02", desktop: 470, mobile: 410 },
  { date: "2024-06-03", desktop: 103, mobile: 160 },
  { date: "2024-06-04", desktop: 439, mobile: 380 },
  { date: "2024-06-05", desktop: 88, mobile: 140 },
  { date: "2024-06-06", desktop: 294, mobile: 250 },
  { date: "2024-06-07", desktop: 323, mobile: 370 },
  { date: "2024-06-08", desktop: 385, mobile: 320 },
  { date: "2024-06-09", desktop: 438, mobile: 480 },
  { date: "2024-06-10", desktop: 155, mobile: 200 },
  { date: "2024-06-11", desktop: 92, mobile: 150 },
  { date: "2024-06-12", desktop: 492, mobile: 420 },
  { date: "2024-06-13", desktop: 81, mobile: 130 },
  { date: "2024-06-14", desktop: 426, mobile: 380 },
  { date: "2024-06-15", desktop: 307, mobile: 350 },
  { date: "2024-06-16", desktop: 371, mobile: 310 },
  { date: "2024-06-17", desktop: 475, mobile: 520 },
  { date: "2024-06-18", desktop: 107, mobile: 170 },
  { date: "2024-06-19", desktop: 341, mobile: 290 },
  { date: "2024-06-20", desktop: 408, mobile: 450 },
  { date: "2024-06-21", desktop: 169, mobile: 210 },
  { date: "2024-06-22", desktop: 317, mobile: 270 },
  { date: "2024-06-23", desktop: 480, mobile: 530 },
  { date: "2024-06-24", desktop: 132, mobile: 180 },
  { date: "2024-06-25", desktop: 141, mobile: 190 },
  { date: "2024-06-26", desktop: 434, mobile: 380 },
  { date: "2024-06-27", desktop: 448, mobile: 490 },
  { date: "2024-06-28", desktop: 149, mobile: 200 },
  { date: "2024-06-29", desktop: 103, mobile: 160 },
  { date: "2024-06-30", desktop: 446, mobile: 400 },
];
const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export default function DashboardPage() {
  const { t, i18n } = useTranslation();
  const [timeRange, setTimeRange] = useState("90d");

  const columns = useMemo<ColumnDef<Sale>[]>(() => [
    {
      accessorKey: "name",
      header: () => t("dashboard.invoice"),
      cell: ({ row }) => {
        const sale = row.original;

        return (
          <div className="flex flex-col">
            <span>{sale.name}</span>
            <span className="text-foreground/50">{sale.email}</span>
          </div>
        );
      },
    },
    {
      header: () => t("common.status"),
      accessorKey: "status",
    },
    {
      header: () => t("common.method"),
      accessorKey: "date",
    },
    {
      header: () => t("common.amount"),
      accessorKey: "amount",
    },
  ], [t]);
  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date("2024-06-30");
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  return (
    <div className="flex-col align-start space-y-4 h-full">
      <div className="flex">
        <h2 className="inline-block text-xl justify-self-start font-bold tracking-tight">
          {t("dashboard.title")}
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card
          className="hover:bg-secondary cursor-pointer rounded-md"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.totalUsers")}</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              className="h-4 w-4 text-blue"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue">34 </div>
            <p className="text-xs text-muted-foreground">{t("dashboard.totalUsersDesc")}</p>
          </CardContent>
        </Card>
        <Card
          className="hover:bg-secondary cursor-pointer rounded-md"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.publishedPages")}
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-chevrons-up-icon lucide-chevrons-up text-purple"
            >
              <path d="m17 11-5-5-5 5" />
              <path d="m17 18-5-5-5 5" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple">44 </div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.publishedPagesDesc")}
            </p>
          </CardContent>
        </Card>
        <Card
          className="hover:bg-secondary cursor-pointer rounded-md"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.activeInquiries")}{" "}
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-activity-icon lucide-activity text-orange"
            >
              <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange">78 </div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.activeInquiriesDesc")}
            </p>
          </CardContent>
        </Card>
        <Card
          className="hover:bg-secondary cursor-pointer rounded-md"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.systemHealth")}</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-battery-plus-icon lucide-battery-plus text-green"
            >
              <path d="M10 9v6" />
              <path d="M12.543 6H16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3.605" />
              <path d="M22 14v-4" />
              <path d="M7 12h6" />
              <path d="M7.606 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.606" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green">100%</div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.systemHealthDesc")}
            </p>
          </CardContent>
        </Card>
      </div>
      <Card className="pt-0">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle>{t("dashboard.chartTitle")}</CardTitle>
            <CardDescription>
              {t("dashboard.chartDescription")}
            </CardDescription>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
              aria-label="Select a value"
            >
              <SelectValue placeholder={t("dashboard.last3Months")} />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                {t("dashboard.last3Months")}
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                {t("dashboard.last30Days")}
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                {t("dashboard.last7Days")}
              </SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-desktop)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-desktop)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-mobile)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-mobile)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString(i18n.language === "ar" ? "ar-EG" : "en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString(i18n.language === "ar" ? "ar-EG" : "en-US", {
                        month: "short",
                        day: "numeric",
                      });
                    }}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="mobile"
                type="natural"
                fill="url(#fillMobile)"
                stroke="var(--color-mobile)"
                stackId="a"
              />
              <Area
                dataKey="desktop"
                type="natural"
                fill="url(#fillDesktop)"
                stroke="var(--color-desktop)"
                stackId="a"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 w-full">
        <Card className="col-span-4 rounded-md">
          <CardHeader>
            <CardTitle>{t("dashboard.recentSales")}</CardTitle>
            <CardDescription>{t("dashboard.recentSalesDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={recentSales}
              gridCount={recentSales.length}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
