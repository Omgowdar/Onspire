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

// Retrieve Jobs
export const getJobs = async () => {
  initializeDatabase();
  await delay(400);
  return JSON.parse(localStorage.getItem('gigshield_jobs'));
};

// Retrieve Weekly Summary and Insights
export const getWeeklyInsights = async () => {
  initializeDatabase();
  await delay(300);
  
  // Calculate dynamic weekly summary based on current local storage jobs
  const jobs = JSON.parse(localStorage.getItem('gigshield_jobs'));
  const insights = JSON.parse(localStorage.getItem('gigshield_insights'));
  
  let totalEarned = 0;
  let expectedEarned = 0;
  let underpaidAmount = 0;
  let jobsCount = jobs.length;
  
  jobs.forEach(job => {
    totalEarned += job.fare;
    expectedEarned += job.expectedFare;
    if (job.status === 'underpaid') {
      underpaidAmount += job.difference;
    }
  });

  const fairJobsCount = jobs.filter(j => j.status === 'fair').length;
  const fairnessPercentage = jobsCount > 0 ? Math.round((fairJobsCount / jobsCount) * 100) : 100;
  
  // Update breakdown
  const platforms = [...new Set(jobs.map(j => j.platform))];
  const platformBreakdown = platforms.map(platform => {
    const platformJobs = jobs.filter(j => j.platform === platform);
    const earned = platformJobs.reduce((sum, j) => sum + j.fare, 0);
    const underpaid = platformJobs.reduce((sum, j) => sum + (j.status === 'underpaid' ? j.difference : 0), 0);
    
    // Choose color
    let color = "#a855f7"; // default
    if (platform === "Uber") color = "#a855f7";
    else if (platform === "Ola") color = "#c084fc";
    else if (platform === "Zomato") color = "#10b981";
    else if (platform === "Swiggy") color = "#f97316";
    else if (platform === "Rapido") color = "#eab308";

    return { name: platform, earned, underpaid, color };
  });

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
    platformBreakdown
  };
};

// Check Job Fairness algorithm (mocked logic)
export const checkJobFairness = async (jobData) => {
  await delay(1200); // Simulate AI calculation
  
  const { platform, fare, distance, duration } = jobData;
  const numericFare = parseFloat(fare);
  const numericDistance = parseFloat(distance);
  const numericDuration = parseFloat(duration);

  // Simple rule-based expected fare estimation:
  // e.g. Base fare: 40, per km: 12, per minute: 1.5
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
  const isUnderpaid = numericFare < expectedFare - 10; // 10 margin of tolerance

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
  initializeDatabase();
  await delay(600);
  
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

  jobs.unshift(newJob); // Add at the start of array
  localStorage.setItem('gigshield_jobs', JSON.stringify(jobs));

  return {
    job: newJob,
    fairnessResult
  };
};

// Send Chat Message to AI Rights Advisor
export const sendChatMessage = async (userMessage) => {
  try {
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
  await delay(200);
  return JSON.parse(localStorage.getItem('gigshield_profile'));
};

// Update profile
export const updateProfile = async (profileData) => {
  initializeDatabase();
  await delay(300);
  localStorage.setItem('gigshield_profile', JSON.stringify(profileData));
  return profileData;
};

// Reset Database (convenient for testing/demoing)
export const resetDatabase = () => {
  localStorage.removeItem('gigshield_jobs');
  localStorage.removeItem('gigshield_insights');
  localStorage.removeItem('gigshield_profile');
  initializeDatabase();
};
