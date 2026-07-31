// api.js
import { mockJobs, mockInsights, mockChatAnswers, chatQuickReplies } from '../mock/mockData';
export { chatQuickReplies };

// Helper to wait to simulate network latency
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Initialize local storage with mock data if not already present
export const initializeDatabase = () => {
  if (!localStorage.getItem('gigshield_jobs')) {
    localStorage.setItem('gigshield_jobs', JSON.stringify(mockJobs));
  }
  if (!localStorage.getItem('gigshield_insights')) {
    localStorage.setItem('gigshield_insights', JSON.stringify(mockInsights));
  }
  if (!localStorage.getItem('gigshield_profile')) {
    const defaultProfile = {
      name: "Ramesh Kumar",
      phone: "+91 98765 43210",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Ramesh",
      languages: ["English", "Hindi", "Kannada"],
      currentLanguage: "English",
      trustedContactName: "Priya Kumar (Wife)",
      trustedContactPhone: "+91 99887 76655",
      platforms: [
        { name: "Uber", connected: true, username: "ramesh_uber_5" },
        { name: "Ola", connected: true, username: "ramesh_ola_2" },
        { name: "Zomato", connected: true, username: "ramesh_zmt_9" },
        { name: "Swiggy", connected: false, username: "" },
        { name: "Rapido", connected: true, username: "ramesh_rap_8" }
      ]
    };
    localStorage.setItem('gigshield_profile', JSON.stringify(defaultProfile));
  }
};

const BASE_URL = "http://localhost:8000";

const mapBackendJobToFrontend = (job) => {
  const platform = job.platform;
  const type = (platform === "Zomato" || platform === "Swiggy") ? "Delivery" : "Ride";
  const isUnderpaid = job.flagged;
  return {
    id: String(job.id),
    platform,
    type,
    fare: job.fare,
    expectedFare: job.expected_fare || job.fare,
    distance: job.distance_km,
    duration: job.duration_minutes,
    timestamp: job.timestamp,
    status: isUnderpaid ? "underpaid" : "fair",
    reason: isUnderpaid ? `Underpayment flagged due to discrepancies in wait times (${platform} calculated shorter distance than actual travel route).` : "Fare matches tariff thresholds.",
    difference: isUnderpaid ? Math.round((job.expected_fare || job.fare) - job.fare) : 0,
    routeRisk: isUnderpaid ? "High Risk" : "Low Risk"
  };
};

// Retrieve Jobs
export const getJobs = async () => {
  try {
    const response = await fetch(`${BASE_URL}/jobs`);
    if (!response.ok) throw new Error("Failed to fetch jobs");
    const data = await response.json();
    return data.map(mapBackendJobToFrontend);
  } catch (error) {
    console.error("API error fetching jobs, falling back to mock:", error);
    initializeDatabase();
    return JSON.parse(localStorage.getItem('gigshield_jobs'));
  }
};

// Retrieve Weekly Summary and Insights
export const getWeeklyInsights = async () => {
  try {
    const jobs = await getJobs();
    initializeDatabase();
    const insights = JSON.parse(localStorage.getItem('gigshield_insights')) || mockInsights;
    
    let totalEarned = 0;
    let expectedEarned = 0;
    let underpaidAmount = 0;
    const jobsCount = jobs.length;
    
    jobs.forEach(job => {
      totalEarned += job.fare;
      expectedEarned += job.expectedFare;
      if (job.status === 'underpaid') {
        underpaidAmount += job.difference;
      }
    });

    const fairJobsCount = jobs.filter(j => j.status === 'fair').length;
    const fairnessPercentage = jobsCount > 0 ? Math.round((fairJobsCount / jobsCount) * 100) : 100;
    
    const platforms = [...new Set(jobs.map(j => j.platform))];
    const platformBreakdown = platforms.map(platform => {
      const platformJobs = jobs.filter(j => j.platform === platform);
      const earned = platformJobs.reduce((sum, j) => sum + j.fare, 0);
      const underpaid = platformJobs.reduce((sum, j) => sum + (j.status === 'underpaid' ? j.difference : 0), 0);
      return { name: platform, earned, underpaid, color: "#3B6FE0" };
    });

    const dayMap = { 0: "Sun", 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat" };
    const historicalTrends = [
      { day: "Mon", earnings: 0, hours: 0, underpaid: 0 },
      { day: "Tue", earnings: 0, hours: 0, underpaid: 0 },
      { day: "Wed", earnings: 0, hours: 0, underpaid: 0 },
      { day: "Thu", earnings: 0, hours: 0, underpaid: 0 },
      { day: "Fri", earnings: 0, hours: 0, underpaid: 0 },
      { day: "Sat", earnings: 0, hours: 0, underpaid: 0 },
      { day: "Sun", earnings: 0, hours: 0, underpaid: 0 }
    ];
    
    jobs.forEach(job => {
      const date = new Date(job.timestamp);
      const dayName = dayMap[date.getDay()];
      const trendDay = historicalTrends.find(t => t.day === dayName);
      if (trendDay) {
        trendDay.earnings += job.fare;
        trendDay.hours += Number((job.duration / 60).toFixed(2));
        trendDay.underpaid += job.difference;
      }
    });

    historicalTrends.forEach(t => {
      t.earnings = Math.round(t.earnings);
      t.hours = Number(t.hours.toFixed(1));
      t.underpaid = Math.round(t.underpaid);
    });

    let aiWeeklyInsight = insights.aiWeeklyInsight || mockInsights.aiWeeklyInsight;
    try {
      const logs = historicalTrends.map(t => ({
        day: t.day,
        hours: t.hours,
        earnings: t.earnings
      })).filter(l => l.hours > 0 || l.earnings > 0);
      
      if (logs.length > 0) {
        const aiResponse = await fetch(`${BASE_URL}/ai/weekly-summary`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ worker_data: logs })
        });
        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          if (aiData.status === "success" && aiData.summary && aiData.summary.insights) {
            aiWeeklyInsight = aiData.summary.insights.join(" ");
          }
        }
      }
    } catch (aiErr) {
      console.warn("Failed to get live weekly AI insights, using fallback:", aiErr);
    }

    return {
      ...insights,
      weeklySummary: {
        totalEarned,
        expectedEarned,
        underpaidAmount,
        hoursWorked: Number((jobs.reduce((sum, j) => sum + j.duration, 0) / 60).toFixed(1)),
        jobsCount,
        fairnessPercentage
      },
      platformBreakdown,
      historicalTrends,
      aiWeeklyInsight
    };
  } catch (error) {
    console.error("API error fetching insights, falling back to mock:", error);
    initializeDatabase();
    return JSON.parse(localStorage.getItem('gigshield_insights')) || mockInsights;
  }
};

// Check Job Fairness algorithm (mocked logic - fallback only)
export const checkJobFairness = async (jobData) => {
  const { platform, fare, distance, duration } = jobData;
  const numericFare = parseFloat(fare);
  const numericDistance = parseFloat(distance);
  const numericDuration = parseFloat(duration);

  let baseRate = 45;
  let kmRate = 14;
  let minRate = 1.8;

  if (platform === "Zomato" || platform === "Swiggy") {
    baseRate = 25;
    kmRate = 8;
    minRate = 0.8;
  } else if (platform === "Rapido") {
    baseRate = 35;
    kmRate = 10;
    minRate = 1.2;
  }

  const expectedFare = Math.round(baseRate + (numericDistance * kmRate) + (numericDuration * minRate));
  const isUnderpaid = numericFare < expectedFare - 10;

  return {
    isFair: !isUnderpaid,
    expectedFare,
    actualFare: numericFare,
    difference: isUnderpaid ? (expectedFare - numericFare) : 0,
    reason: isUnderpaid 
      ? `Underpayment flagged due to discrepancies in wait times (${platform} calculated shorter distance than actual travel route).`
      : "Fare matches within normal tariff thresholds."
  };
};

// Log a Job to the list
export const logJob = async (jobData) => {
  try {
    const payload = {
      platform: jobData.platform,
      fare: parseFloat(jobData.fare),
      distance_km: parseFloat(jobData.distance),
      duration_minutes: parseInt(jobData.duration),
      timestamp: new Date().toISOString()
    };
    const response = await fetch(`${BASE_URL}/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error("Failed to log job");
    const job = await response.json();
    const mappedJob = mapBackendJobToFrontend(job);
    const fairnessResult = {
      isFair: mappedJob.status === "fair",
      expectedFare: mappedJob.expectedFare,
      actualFare: mappedJob.fare,
      difference: mappedJob.difference,
      reason: mappedJob.reason || "Fare matches within normal tariff thresholds."
    };
    return { job: mappedJob, fairnessResult };
  } catch (error) {
    console.error("API error logging job, falling back to mock:", error);
    initializeDatabase();
    const jobs = JSON.parse(localStorage.getItem('gigshield_jobs'));
    const fairnessResult = await checkJobFairness(jobData);
    
    const newJob = {
      id: `job_${Date.now()}`,
      platform: jobData.platform,
      type: (jobData.platform === "Zomato" || jobData.platform === "Swiggy") ? "Delivery" : "Ride",
      fare: parseFloat(jobData.fare),
      expectedFare: fairnessResult.expectedFare,
      distance: parseFloat(jobData.distance),
      duration: parseFloat(jobData.duration),
      timestamp: new Date().toISOString(),
      status: fairnessResult.isFair ? "fair" : "underpaid",
      reason: fairnessResult.reason,
      difference: fairnessResult.difference,
      routeRisk: "Low Risk"
    };

    jobs.unshift(newJob);
    localStorage.setItem('gigshield_jobs', JSON.stringify(jobs));

    return {
      job: newJob,
      fairnessResult
    };
  }
};

// Send Chat Message to AI Rights Advisor
export const sendChatMessage = async (userMessage) => {
  try {
<<<<<<< HEAD
    const response = await fetch("http://127.0.0.1:8000/ai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: userMessage }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    if (data.status === "success") {
      return {
        sender: "bot",
        text: data.response,
        timestamp: new Date().toISOString()
      };
    } else {
      throw new Error(data.message || "Failed to get AI response");
    }
  } catch (error) {
    console.warn("FastAPI backend connection failed, falling back to mock chatbot responses. Error:", error);
    
    // Simulate bot typing delay for fallback mock
    await delay(800);
    
    const cleanMsg = userMessage.toLowerCase().trim();
    let answer = mockChatAnswers["default"];

    // Search if message matches any keys in mock answers
=======
    const response = await fetch(`${BASE_URL}/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage })
    });
    if (!response.ok) throw new Error("Failed to chat");
    const data = await response.json();
    if (data.status === "error") {
      throw new Error(data.message || "AI returned an error");
    }
    return {
      sender: "bot",
      text: data.response,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("API error chatting, falling back to mock:", error);
    const cleanMsg = userMessage.toLowerCase().trim();
    let answer = mockChatAnswers["default"];

>>>>>>> b406a849223ecf259313abd36b108ecf49712369
    for (const key of Object.keys(mockChatAnswers)) {
      if (cleanMsg.includes(key)) {
        answer = mockChatAnswers[key];
        break;
      }
    }

    return {
      sender: "bot",
      text: answer,
      timestamp: new Date().toISOString()
    };
  }
};

// Get profile
export const getProfile = async () => {
  initializeDatabase();
  return JSON.parse(localStorage.getItem('gigshield_profile'));
};

// Update profile
export const updateProfile = async (profileData) => {
  initializeDatabase();
  localStorage.setItem('gigshield_profile', JSON.stringify(profileData));
  return profileData;
};

// Reset Database
export const resetDatabase = () => {
  localStorage.removeItem('gigshield_jobs');
  localStorage.removeItem('gigshield_insights');
  localStorage.removeItem('gigshield_profile');
  initializeDatabase();
};
