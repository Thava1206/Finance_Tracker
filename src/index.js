import "./index.css";

// ---------- Grabbing elements from the page ----------
const list = document.querySelector("#transactions");
const form = document.querySelector(".TransactionForm");
const addButton = document.querySelector("#addButton");
const cancelButton = document.querySelector("#cancelButton");
const formError = document.querySelector("#formError");

const amount = document.querySelector("#amount");
const type = document.querySelector("#type");
const category = document.querySelector("#category");
const description = document.querySelector("#description");

// Keeps every transaction on the page so the balance can be recalculated
let transactions = [];

// Turns 1234.5 into "$1,234.50"
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

// Turns "2026-11-16" into "Nov 16"
function formatDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// Small helper: makes an element with a class and text
function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

// ---------- Building one row in the list ----------
// Used by both loadTransactions and postData so every row looks the same
function createTransactionItem(t) {
  const li = createElement("li", `transaction ${t.type}`);

  const date = createElement("time", "date", formatDate(t.date));
  date.dateTime = t.date;

  const details = createElement("div", "details");
  details.append(
    createElement("span", "description", t.description),
    createElement("span", "category", t.category.replaceAll("-", " "))
  );

  // + for income, − for expense
  const sign = t.type === "income" ? "+" : "−";
  const amountText = createElement("span", "amount", `${sign}${money.format(t.amount)}`);

  // Delete button: no click handler yet, that's yours to add
  const deleteButton = createElement("button", "deleteButton", "×");
  deleteButton.type = "button";
  deleteButton.setAttribute("aria-label", `Delete ${t.description}`);

  li.append(date, details, amountText, deleteButton);
  return li;
}

// ---------- Balance panel ----------
function updateSummary() {
  let income = 0;
  let expense = 0;
  transactions.forEach((t) => {
    if (t.type === "income") income += Number(t.amount);
    else expense += Number(t.amount);
  });

  const balance = income - expense;
  const balanceElement = document.querySelector("#balance");
  balanceElement.textContent = money.format(balance);
  balanceElement.classList.toggle("negative", balance < 0);

  document.querySelector("#totalIncome").textContent = money.format(income);
  document.querySelector("#totalExpense").textContent = money.format(expense);

  // Green part of the bar = income's share of all money moved
  const total = income + expense;
  const incomeShare = total === 0 ? 50 : (income / total) * 100;
  document.querySelector("#splitIncome").style.width = `${incomeShare}%`;
}

// Shows a message inside the list (empty list or API error)
function showListMessage(text) {
  list.replaceChildren(createElement("li", "listMessage", text));
}

// ---------- Requesting the API ----------
async function loadTransactions() {
  try {
    const res = await fetch("/api/transactions");
    transactions = await res.json();

    if (transactions.length === 0) {
      showListMessage("No transactions yet. Add your first one above.");
    } else {
      // Newest first: reverse a copy so the original order stays the same
      list.replaceChildren(...[...transactions].reverse().map(createTransactionItem));
    }
    updateSummary();
  } catch {
    showListMessage("Couldn't load transactions. Start the API with npm start, then refresh.");
  }
}

// ---------- Opening and closing the form ----------
// Add transaction: hide the button, show the form
function openForm() {
  addButton.hidden = true;
  form.hidden = false;
  description.focus();
}

// Cancel (or after saving): clear and hide the form, bring the button back
function closeForm() {
  form.reset();
  formError.hidden = true;
  form.hidden = true;
  addButton.hidden = false;
  addButton.focus();
}

addButton.addEventListener("click", openForm);
cancelButton.addEventListener("click", closeForm);

// Function : getting infomation from form storing into object
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const payload = {
    amount: Number(amount.value),
    type: type.value,
    category: category.value,
    description: description.value,
  };
  postData(payload);
});

// Parse that infomation into api
async function postData(payload) {
  const url = "/api/transactions";
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status ${response.status}`);
    }
    const result = await response.json();
    console.log("Success:", result);

    // If the "No transactions yet" message is showing, clear it first
    if (transactions.length === 0) list.replaceChildren();

    // Add the new transaction to the top of the list and update the balance
    transactions.push(result);
    list.prepend(createTransactionItem(result));
    updateSummary();

    // Reset and close the form
    closeForm();
    return result;
  } catch (error) {
    console.error("Request Failed:", error);
    formError.textContent = "Couldn't save the transaction. Check that the API is running, then try again.";
    formError.hidden = false;
  }
}

loadTransactions();
