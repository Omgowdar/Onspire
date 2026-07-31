// mockData.js

export const mockJobs = [
  {
    id: "job_1",
    platform: "Uber",
    type: "Ride",
    fare: 185,
    expectedFare: 220,
    distance: 12.4, // in km
    duration: 45, // in minutes
    timestamp: "2026-07-31T10:15:00Z",
    status: "underpaid", // fair, underpaid
    reason: "Unpaid traffic waiting time (15 mins delay)",
    difference: 35,
    routeRisk: "Low Risk"
  },
  {
    id: "job_2",
    platform: "Zomato",
    type: "Delivery",
    fare: 75,
    expectedFare: 75,
    distance: 4.1,
    duration: 18,
    timestamp: "2026-07-31T08:30:00Z",
    status: "fair",
    reason: "",
    difference: 0,
    routeRisk: "Low Risk"
  },
  {
    id: "job_3",
    platform: "Swiggy",
    type: "Delivery",
    fare: 60,
    expectedFare: 90,
    distance: 6.8,
    duration: 32,
    timestamp: "2026-07-30T21:40:00Z",
    status: "underpaid",
    reason: "Rain surge pricing not credited",
    difference: 30,
    routeRisk: "High Risk - Low lighting reported after 9PM"
  },
  {
    id: "job_4",
    platform: "Rapido",
    type: "Bike Taxi",
    fare: 110,
    expectedFare: 110,
    distance: 8.2,
    duration: 22,
    timestamp: "2026-07-30T17:10:00Z",
    status: "fair",
    reason: "",
    difference: 0,
    routeRisk: "Moderate Risk - Heavy congestion zone"
  },
  {
    id: "job_5",
    platform: "Ola",
    type: "Ride",
    fare: 310,
    expectedFare: 360,
    distance: 18.5,
    duration: 55,
    timestamp: "2026-07-29T14:20:00Z",
    status: "underpaid",
    reason: "Airport toll charge missing from final payout",
    difference: 50,
    routeRisk: "Low Risk"
  },
  {
    id: "job_6",
    platform: "Uber",
    type: "Ride",
    fare: 240,
    expectedFare: 240,
    distance: 14.1,
    duration: 38,
    timestamp: "2026-07-29T11:05:00Z",
    status: "fair",
    reason: "",
    difference: 0,
    routeRisk: "Low Risk"
  },
  {
    id: "job_7",
    platform: "Zomato",
    type: "Delivery",
    fare: 95,
    expectedFare: 95,
    distance: 5.5,
    duration: 25,
    timestamp: "2026-07-28T19:50:00Z",
    status: "fair",
    reason: "",
    difference: 0,
    routeRisk: "Moderate Risk - Complex apartment navigation"
  },
  {
    id: "job_8",
    platform: "Rapido",
    type: "Bike Taxi",
    fare: 45,
    expectedFare: 65,
    distance: 3.0,
    duration: 16,
    timestamp: "2026-07-28T08:15:00Z",
    status: "underpaid",
    reason: "Base rate miscalculation on short ride",
    difference: 20,
    routeRisk: "Low Risk"
  }
];

export const mockInsights = {
  weeklySummary: {
    totalEarned: 4570, // in INR or local currency
    expectedEarned: 4705,
    underpaidAmount: 135,
    hoursWorked: 38.5,
    jobsCount: 42,
    fairnessPercentage: 88, // 88% of earnings were fair
  },
  aiWeeklyInsight: "You earned 12% less this week, mostly during night shifts. Swiggy underpaid you by ₹30 on Swiggy rain surges last night. Consider logging peak hour wait times manually.",
  platformBreakdown: [
    { name: "Uber", earned: 1850, underpaid: 90, color: "#a855f7" },
    { name: "Ola", earned: 1200, underpaid: 50, color: "#c084fc" },
    { name: "Zomato", earned: 740, underpaid: 0, color: "#10b981" },
    { name: "Swiggy", earned: 480, underpaid: 45, color: "#f97316" },
    { name: "Rapido", earned: 300, underpaid: 20, color: "#eab308" }
  ],
  historicalTrends: [
    { day: "Mon", earnings: 780, hours: 6.5, underpaid: 0 },
    { day: "Tue", earnings: 920, hours: 8.0, underpaid: 20 },
    { day: "Wed", earnings: 640, hours: 5.5, underpaid: 50 },
    { day: "Thu", earnings: 850, hours: 7.2, underpaid: 30 },
    { day: "Fri", earnings: 1120, hours: 9.3, underpaid: 35 },
    { day: "Sat", earnings: 260, hours: 2.0, underpaid: 0 },
    { day: "Sun", earnings: 0, hours: 0, underpaid: 0 }
  ],
  fatigueData: {
    consecutiveHours: 9.5,
    isFatigued: true,
    nudgeMessage: "⚠️ Fatigue Alert: You've been driving for 9.5 consecutive hours today. We recommend taking a 20-minute stretch break to stay safe on the road."
  },
  safetyData: {
    currentRouteScore: 68,
    currentRouteStatus: "Moderate Risk",
    description: "Low lighting reported after 9PM near your drop-off zone. Stay alert and keep your emergency button handy."
  }
};

export const chatQuickReplies = [
  "Is this fare fair?",
  "What are my rights?",
  "How do I raise a complaint?",
  "Underpayment patterns"
];

export const mockChatAnswers = {
  "is this fare fair?": "To check if a fare is fair, log the job on our 'Log a Job' screen. Enter the fare, distance, time, and platform. GigShield automatically compares it against local minimum tariffs, fuel indexes, and current platform surge algorithms to flag underpayments.",
  "what are my rights?": "As a gig worker, you are entitled to the agreed base rates, transparent distance calculations, dynamic surges during peak hours, and safety protections. In many regions, you are also protected against arbitrary account deactivation. You have the right to challenge payments that don't match the platform's terms of service.",
  "how do I raise a complaint?": "If GigShield flags an underpayment:\n1. Take a screenshot of the job screen in your driver app.\n2. Export the GigShield fairness report for that trip.\n3. Open the platform's support ticket system.\n4. Upload the report as proof. (We can generate a pre-written text template for you in the 'History' tab!)",
  "underpayment patterns": "This week, most of your underpayments occurred on Swiggy and Uber. The main culprit was uncredited rain surges and unpaid waiting time in traffic. We suggest checking your trip history to see the detailed audit trail for these flagged jobs.",
  "default": "I'm GigShield AI, your rights advisor. I can help you verify your fares, understand local gig worker regulations, and write complaint drafts for underpaid jobs. Try asking one of the suggested questions above!"
};
