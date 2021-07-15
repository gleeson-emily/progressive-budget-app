let db;
const request = window.indexedDB.open("BudgetDB", 1);

request.onupgradeneeded = function (event) {
  db = event.target.result;
 db.createObjectStore("BudgetStore", {autoIncrement: true} )

};

request.onsuccess = function (event) {
  db = event.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (event) {
  console.log("ERROR! Please try again")
};

function saveRecord(record) {
  const transaction = db.transaction(["BudgetStore"], "readwrite");
  const budgetStore2 = transaction.objectStore("BudgetStore");


budgetStore2.add(record);
}

function checkDatabase() {
  const newTransaction = db.transaction(["BudgetStore"], "readwrite");
  const newStore = newTransaction.objectStore("BudgetStore");
  const getAll = newStore.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then(() => {
          const pendingTransaction = db.transaction(["BudgetStore"], "readwrite")
          const pendingStore = pendingTransaction.objectStore("BudgetStore")
          pendingStore.clear();
        });
    }
  };
}


window.addEventListener('online', checkDatabase);
