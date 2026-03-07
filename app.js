// Initialize Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// Get user ID from URL
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get("user_id") || null;

// State
let currentTips = [];
let isPremium = false;
let userStats = {};

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  loadTips();
  checkUserStatus();
  setupTheme();
});

function setupTheme() {
  document.body.style.backgroundColor = tg.backgroundColor || "#0f0f1e";
}

// API Functions (mock - replace with your backend)
async function loadTips() {
  try {
    // Simulate API call - replace with actual endpoint
    // For local development, use: http://localhost:5000/api/tips
    // For production, deploy Flask backend and update the URL
    const API_URL = window.location.origin + "/api/tips";

    const response = await fetch(API_URL + `?user_id=${userId || ""}`);

    if (!response.ok) {
      throw new Error("API not available");
    }

    const data = await response.json();

    currentTips = data.tips || getMockTips();
    isPremium = data.is_premium || false;

    renderTips(currentTips);
    updateStats(data.stats);

    if (isPremium) {
      document.getElementById("premiumBanner").style.display = "none";
      unlockVIPCateories();
    }
  } catch (error) {
    console.log("Using offline mock data:", error.message);
    // Use mock data when API is not available
    currentTips = getMockTips();
    isPremium = false;
    renderTips(currentTips);
    updateStats({ win_rate: 68, profit: 142, active_tips: 12 });
  }
}

async function checkUserStatus() {
  // Check if user has premium
  if (userId) {
    // API call to check status
  }
}

function getMockTips() {
  return [
    {
      id: 1,
      sport: "Football",
      league: "Premier League",
      match_title: "Manchester City vs Liverpool",
      prediction: "Over 2.5 Goals",
      odds: 1.85,
      stake: 3,
      confidence: 72,
      is_premium: false,
      status: "pending",
      match_date: "2024-01-15T20:00:00",
      notes: "Both teams scoring frequently. City avg 2.8 goals at home.",
    },
    {
      id: 2,
      sport: "Basketball",
      league: "NBA",
      match_title: "Lakers vs Warriors",
      prediction: "Lakers -4.5",
      odds: 1.91,
      stake: 2,
      confidence: 65,
      is_premium: false,
      status: "won",
      result: "Lakers won by 8",
      profit: 1.82,
      match_date: "2024-01-14T03:00:00",
    },
    {
      id: 3,
      sport: "Football",
      league: "La Liga",
      match_title: "Real Madrid vs Barcelona",
      prediction: "Real Madrid Win",
      odds: 2.1,
      stake: 5,
      confidence: 80,
      is_premium: true,
      status: "pending",
      match_date: "2024-01-16T21:00:00",
      notes:
        "VIP Exclusive: El Clasico special analysis indicates strong home advantage.",
    },
  ];
}

function renderTips(tips) {
  const container = document.getElementById("tipsList");

  if (tips.length === 0) {
    container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <div>No tips available right now</div>
                <div style="font-size: 14px; margin-top: 8px;">Check back later for new predictions</div>
            </div>
        `;
    return;
  }

  container.innerHTML = tips
    .map((tip) => {
      const isLocked = tip.is_premium && !isPremium;
      const statusClass =
        tip.status === "won" ? "won" : tip.status === "lost" ? "lost" : "";
      const premiumClass = tip.is_premium ? "premium" : "";

      return `
            <div class="tip-card ${statusClass} ${premiumClass}" onclick="showTipDetail(${
        tip.id
      })">
                <div class="tip-header">
                    <div class="tip-league">
                        ${getSportIcon(tip.sport)} ${tip.league}
                    </div>
                    ${
                      tip.is_premium
                        ? '<span style="color: var(--accent-gold); font-size: 12px;">💎 VIP</span>'
                        : ""
                    }
                </div>
                
                <div class="tip-teams">${tip.match_title}</div>
                
                <div class="tip-prediction">
                    <div class="prediction-text">
                        ${isLocked ? "🔒 Premium Only" : tip.prediction}
                    </div>
                    <div class="prediction-odds">@${tip.odds}</div>
                </div>
                
                <div class="tip-meta">
                    <span>📊 ${tip.confidence}% confidence</span>
                    <span>💰 ${tip.stake}/10 stake</span>
                    <span class="tip-status status-${tip.status}">${
        tip.status
      }</span>
                </div>
                
                ${
                  tip.status !== "pending"
                    ? `
                    <div style="margin-top: 8px; font-weight: 600; color: ${
                      tip.profit > 0
                        ? "var(--accent-green)"
                        : "var(--accent-red)"
                    };">
                        ${tip.profit > 0 ? "+" : ""}${tip.profit || 0} units
                    </div>
                `
                    : ""
                }
            </div>
        `;
    })
    .join("");
}

function getSportIcon(sport) {
  const icons = {
    Football: "⚽",
    Basketball: "🏀",
    Tennis: "🎾",
    "Over-Under": "📊",
  };
  return icons[sport] || "🎯";
}

function showTipDetail(tipId) {
  const tip = currentTips.find((t) => t.id === tipId);
  if (!tip) return;

  if (tip.is_premium && !isPremium) {
    showPremiumPrompt();
    return;
  }

  const modal = document.getElementById("tipModal");
  const body = document.getElementById("modalBody");

  const matchDate = new Date(tip.match_date);
  const formattedDate = matchDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  body.innerHTML = `
        <div class="detail-row">
            <span class="detail-label">Sport</span>
            <span class="detail-value">${getSportIcon(tip.sport)} ${
    tip.sport
  }</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">League</span>
            <span class="detail-value">${tip.league}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Match</span>
            <span class="detail-value">${tip.match_title}</span>
        </div>
        <div class="detail-row">
                        <span class="detail-value">${tip.match_title}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Prediction</span>
            <span class="detail-value" style="color: var(--accent-gold);">${
              tip.prediction
            }</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Odds</span>
            <span class="detail-value">@${tip.odds}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Stake</span>
            <span class="detail-value">${tip.stake}/10 units</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Confidence</span>
            <span class="detail-value">${tip.confidence}%</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Match Time</span>
            <span class="detail-value">${formattedDate}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Status</span>
            <span class="detail-value" style="text-transform: uppercase; color: ${getStatusColor(
              tip.status
            )};">${tip.status}</span>
        </div>
        ${
          tip.result
            ? `
        <div class="detail-row">
            <span class="detail-label">Result</span>
            <span class="detail-value">${tip.result}</span>
        </div>
        `
            : ""
        }
        ${
          tip.profit
            ? `
        <div class="detail-row">
            <span class="detail-label">Profit/Loss</span>
            <span class="detail-value ${
              tip.profit > 0 ? "result-positive" : "result-negative"
            }">
                ${tip.profit > 0 ? "+" : ""}${tip.profit} units
            </span>
        </div>
        `
            : ""
        }
        ${
          tip.notes
            ? `
        <div style="margin-top: 16px; padding: 16px; background: var(--bg-primary); border-radius: 12px;">
            <div style="color: var(--text-secondary); font-size: 12px; margin-bottom: 8px;">Analysis</div>
            <div style="line-height: 1.6;">${tip.notes}</div>
        </div>
        `
            : ""
        }
    `;

  modal.classList.add("active");
}

function getStatusColor(status) {
  const colors = {
    pending: "#ffd700",
    won: "#00d084",
    lost: "#ff4757",
    void: "#a0a0a0",
  };
  return colors[status] || "#fff";
}

function closeModal() {
  document.getElementById("tipModal").classList.remove("active");
}

function filterTips(category) {
  // Filter tips by category
  const filtered = currentTips.filter(
    (tip) => tip.sport === category || tip.bet_type === category
  );
  renderTips(filtered);

  // Update UI to show active filter
  document.querySelector(".section-title").innerHTML = `🎯 ${category} Tips`;
}

function checkPremium(category) {
  if (!isPremium) {
    showPremiumPrompt();
  } else {
    filterTips(category);
  }
}

function showPremiumPrompt() {
  tg.showPopup(
    {
      title: "Premium Required",
      message:
        "This category is exclusive to VIP members. Upgrade now to access high-accuracy tips!",
      buttons: [
        { id: "upgrade", type: "default", text: "Upgrade to VIP" },
        { type: "cancel" },
      ],
    },
    (buttonId) => {
      if (buttonId === "upgrade") {
        upgradePremium();
      }
    }
  );
}

function upgradePremium() {
  // Send command to bot to initiate payment
  tg.sendData(JSON.stringify({ action: "upgrade_premium" }));
  tg.close();
}

function updateStats(stats) {
  if (!stats) return;
  document.getElementById("winRate").textContent = stats.win_rate + "%";
  document.getElementById("profit").textContent =
    (stats.profit > 0 ? "+" : "") + stats.profit;
  document.getElementById("activeTips").textContent = stats.active_tips;
}

function unlockVIPCateories() {
  // Update VIP categories to show they're unlocked
  const vipCards = document.querySelectorAll("#vipCategories .category-card");
  vipCards.forEach((card) => {
    const countDiv = card.querySelector(".category-count");
    countDiv.textContent = "Available";
    countDiv.style.color = "var(--accent-green)";
  });
}

function showAllTips() {
  renderTips(currentTips);
  document.querySelector(".section-title").innerHTML = `🎯 All Tips`;
}

function showSection(section) {
  // Handle navigation
  document
    .querySelectorAll(".nav-item")
    .forEach((el) => el.classList.remove("active"));
  event.target.closest(".nav-item").classList.add("active");

  // Implement section switching logic
  switch (section) {
    case "home":
      // Already on home
      break;
    case "tips":
      showAllTips();
      break;
    case "history":
      showHistory();
      break;
    case "profile":
      showProfile();
      break;
  }
}

function showHistory() {
  const historyTips = currentTips.filter((t) => t.status !== "pending");
  renderTips(historyTips);
  document.querySelector(".section-title").innerHTML = `📊 History`;
}

function showProfile() {
  // Render profile view
  const container = document.getElementById("tipsList");
  container.innerHTML = `
        <div style="text-align: center; padding: 40px;">
            <div style="font-size: 64px; margin-bottom: 16px;">👤</div>
            <div style="font-size: 20px; font-weight: 600; margin-bottom: 8px;">User Profile</div>
            <div style="color: var(--text-secondary); margin-bottom: 24px;">ID: ${userId}</div>
            
            <div style="background: var(--bg-card); border-radius: 16px; padding: 20px; margin-bottom: 16px;">
                <div style="color: var(--text-secondary); font-size: 12px; margin-bottom: 4px;">Status</div>
                <div style="color: ${
                  isPremium ? "var(--accent-gold)" : "var(--text-secondary)"
                }; font-weight: 600;">
                    ${isPremium ? "💎 Premium Member" : "Free Member"}
                </div>
            </div>
            
            ${
              isPremium
                ? `
            <div style="background: var(--bg-card); border-radius: 16px; padding: 20px; margin-bottom: 16px;">
                <div style="color: var(--text-secondary); font-size: 12px; margin-bottom: 4px;">Premium Expires</div>
                <div style="font-weight: 600;">2024-12-31</div>
            </div>
            `
                : `
            <button class="premium-btn" onclick="upgradePremium()" style="margin-top: 16px;">
                Upgrade to Premium
            </button>
            `
            }
        </div>
    `;
}

// Close modal on outside click
document.getElementById("tipModal").addEventListener("click", (e) => {
  if (e.target.id === "tipModal") closeModal();
});
