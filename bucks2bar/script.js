const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const DUMMY_INCOME = [
  12000, 12650, 11900, 13300, 14050, 13750,
  14500, 14800, 14250, 15100, 15800, 16500
];

const DUMMY_EXPENSE = [
  7200, 7600, 7000, 7850, 8100, 8350,
  8500, 8700, 8450, 9100, 9400, 9800
];

const REGION_TO_CURRENCY = {
  AU: "AUD",
  CA: "CAD",
  CH: "CHF",
  CN: "CNY",
  DE: "EUR",
  ES: "EUR",
  FR: "EUR",
  GB: "GBP",
  GH: "GHS",
  IN: "INR",
  IT: "EUR",
  JP: "JPY",
  KE: "KES",
  NG: "NGN",
  NL: "EUR",
  NZ: "NZD",
  PH: "PHP",
  RU: "RUB",
  SE: "SEK",
  US: "USD",
  ZA: "ZAR"
};

const PREFERRED_CURRENCY_CODE = "PHP";

function detectCurrencyCode() {
  const locale = (navigator.languages && navigator.languages[0]) || navigator.language || "en-US";

  try {
    const intlLocale = new Intl.Locale(locale);
    if (intlLocale.region && REGION_TO_CURRENCY[intlLocale.region]) {
      return REGION_TO_CURRENCY[intlLocale.region];
    }
  } catch {
    // Continue to fallback parsing.
  }

  const match = locale.match(/[-_]([A-Za-z]{2})$/);
  const region = match ? match[1].toUpperCase() : "US";

  return REGION_TO_CURRENCY[region] || "USD";
}

const CURRENCY_CODE = PREFERRED_CURRENCY_CODE || detectCurrencyCode();
const CURRENCY_FORMATTER = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: CURRENCY_CODE,
  maximumFractionDigits: 2
});

const AXIS_CURRENCY_FORMATTER = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: CURRENCY_CODE,
  maximumFractionDigits: 0
});

const monthlyData = {
  income: [...DUMMY_INCOME],
  expense: [...DUMMY_EXPENSE]
};

let chartInstance;
const USERNAME_RULE = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{5,}$/;

function safeNumber(value) {
  const num = Number.parseFloat(value);
  if (!Number.isFinite(num) || num < 0) {
    return 0;
  }
  return num;
}

function renderMonthlyRows() {
  const rowsHost = document.getElementById("monthly-rows");

  rowsHost.innerHTML = MONTHS.map((month, index) => `
    <div class="grid-row" role="row">
      <div class="cell month" role="cell">${month}</div>
      <div class="cell" role="cell">
        <input
          type="number"
          class="money-input income"
          min="0"
          step="0.01"
          inputmode="decimal"
          placeholder="0"
          value="${monthlyData.income[index]}"
          data-type="income"
          data-index="${index}"
          aria-label="${month} income"
        >
      </div>
      <div class="cell" role="cell">
        <input
          type="number"
          class="money-input expense"
          min="0"
          step="0.01"
          inputmode="decimal"
          placeholder="0"
          value="${monthlyData.expense[index]}"
          data-type="expense"
          data-index="${index}"
          aria-label="${month} expense"
        >
      </div>
    </div>
  `).join("");
}

function updateChart() {
  if (!chartInstance) {
    return;
  }

  chartInstance.data.datasets[0].data = [...monthlyData.income];
  chartInstance.data.datasets[1].data = [...monthlyData.expense];
  chartInstance.update();
}

function bindInputEvents() {
  const form = document.getElementById("monthly-form");

  form.addEventListener("input", (event) => {
    const target = event.target;

    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    const type = target.dataset.type;
    const index = Number.parseInt(target.dataset.index ?? "", 10);

    if ((type !== "income" && type !== "expense") || Number.isNaN(index)) {
      return;
    }

    const value = safeNumber(target.value);

    if (target.value !== "" && value === 0 && target.value !== "0") {
      target.value = "0";
    }

    monthlyData[type][index] = value;
    updateChart();
  });
}

function initChart() {
  const canvas = document.getElementById("incomeExpenseChart");
  const context = canvas.getContext("2d");

  chartInstance = new Chart(context, {
    type: "bar",
    data: {
      labels: MONTHS,
      datasets: [
        {
          label: "Income",
          data: monthlyData.income,
          backgroundColor: "rgba(47, 143, 115, 0.75)",
          borderColor: "rgba(47, 143, 115, 1)",
          borderWidth: 1
        },
        {
          label: "Expense",
          data: monthlyData.expense,
          backgroundColor: "rgba(201, 80, 63, 0.75)",
          borderColor: "rgba(201, 80, 63, 1)",
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 360
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback(value) {
              const numericValue = Number(value) || 0;
              return AXIS_CURRENCY_FORMATTER.format(numericValue);
            }
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            boxWidth: 14,
            usePointStyle: true,
            pointStyle: "rectRounded"
          }
        },
        tooltip: {
          callbacks: {
            label(context) {
              const label = context.dataset.label || "";
              const numericValue = Number(context.parsed.y) || 0;
              return `${label}: ${CURRENCY_FORMATTER.format(numericValue)}`;
            }
          }
        }
      }
    }
  });
}

function bindTabEvents() {
  const chartTabButton = document.getElementById("chart-tab");

  chartTabButton.addEventListener("shown.bs.tab", () => {
    if (chartInstance) {
      chartInstance.resize();
      chartInstance.update("none");
    }
  });
}

function buildChartFileName() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  return `bucks2bar-chart-${yyyy}-${mm}-${dd}.png`;
}

function triggerCanvasDownload(canvas, fileName) {
  if (typeof canvas.toBlob === "function") {
    canvas.toBlob((blob) => {
      if (!blob) {
        return;
      }

      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
    }, "image/png");
    return;
  }

  const fallbackLink = document.createElement("a");
  fallbackLink.href = canvas.toDataURL("image/png");
  fallbackLink.download = fileName;
  document.body.append(fallbackLink);
  fallbackLink.click();
  fallbackLink.remove();
}

function bindDownloadEvent() {
  const downloadButton = document.getElementById("download-chart");

  if (!downloadButton) {
    return;
  }

  downloadButton.addEventListener("click", () => {
    if (!chartInstance) {
      return;
    }

    const canvas = chartInstance.canvas;
    if (!(canvas instanceof HTMLCanvasElement)) {
      return;
    }

    triggerCanvasDownload(canvas, buildChartFileName());
  });
}

function bindUsernameValidation() {
  const usernameForm = document.getElementById("username-form");
  const usernameInput = document.getElementById("username");
  const feedback = document.getElementById("username-feedback");

  if (!(usernameForm instanceof HTMLFormElement) || !(usernameInput instanceof HTMLInputElement) || !(feedback instanceof HTMLElement)) {
    return;
  }

  usernameForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const normalizedValue = usernameInput.value.trim();
    const isValid = USERNAME_RULE.test(normalizedValue);

    usernameInput.value = normalizedValue;

    if (!isValid) {
      usernameInput.setCustomValidity("Username must include at least 1 uppercase letter, 1 number, 1 special character, and be 5+ characters.");
      usernameInput.classList.add("is-invalid");
      feedback.textContent = "Invalid username. Include at least 1 uppercase letter, 1 number, and 1 special character (minimum 5 characters).";
      feedback.classList.remove("success");
      feedback.classList.add("error");
      usernameInput.reportValidity();
      return;
    }

    usernameInput.setCustomValidity("");
    usernameInput.classList.remove("is-invalid");
    feedback.textContent = "Username submitted successfully.";
    feedback.classList.remove("error");
    feedback.classList.add("success");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderMonthlyRows();
  bindInputEvents();
  initChart();
  bindTabEvents();
  bindDownloadEvent();
  bindUsernameValidation();
});
