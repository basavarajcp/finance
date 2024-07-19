document.addEventListener('DOMContentLoaded', () => {
    const addEntryForm = document.getElementById('add-entry-form');
    const ledgerTableBody = document.querySelector('#ledger-table tbody');

    // Load ledger entries from localStorage
    loadLedgerEntries();

    if (addEntryForm) {
        addEntryForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const loanAmount = document.getElementById('loan-amount').value;
            const city = document.getElementById('city').value;
            const contact = document.getElementById('contact').value;
            const interest = document.getElementById('interest').value;
            const dateTaken = document.getElementById('date-taken').value;

            const entry = {
                name,
                loanAmount,
                city,
                contact,
                interest,
                dateTaken
            };

            addLedgerEntry(entry);
            saveLedgerEntry(entry);
            addEntryForm.reset();
        });
    }

    document.getElementById('save-to-excel')?.addEventListener('click', () => {
        const { XLSX } = window;
        const table = document.getElementById('ledger-table');
        const wb = XLSX.utils.table_to_book(table, { sheet: "Ledger" });
        const date = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, `ledger_${date}.xlsx`);
    });

    document.getElementById('save-to-pdf')?.addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const table = document.getElementById('ledger-table');
        const date = new Date().toISOString().split('T')[0];

        doc.text('Ledger Report', 10, 10);
        doc.text(`Date: ${date}`, 10, 20);

        const data = [];
        const headers = ['Name', 'Loan Amount', 'City', 'Contact', 'Interest', 'Date Taken', 'Current Interest to be Paid'];
        data.push(headers);

        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const rowData = [];
            row.querySelectorAll('td').forEach(cell => {
                rowData.push(cell.textContent);
            });
            data.push(rowData);
        });

        doc.autoTable({
            head: [headers],
            body: data.slice(1)
        });

        doc.save(`ledger_${date}.pdf`);
    });

    function addLedgerEntry(entry) {
        const { name, loanAmount, city, contact, interest, dateTaken } = entry;

        const row = document.createElement('tr');

        const nameCell = document.createElement('td');
        nameCell.textContent = name;
        row.appendChild(nameCell);

        const loanAmountCell = document.createElement('td');
        loanAmountCell.textContent = loanAmount;
        row.appendChild(loanAmountCell);

        const cityCell = document.createElement('td');
        cityCell.textContent = city;
        row.appendChild(cityCell);

        const contactCell = document.createElement('td');
        contactCell.textContent = contact;
        row.appendChild(contactCell);

        const interestCell = document.createElement('td');
        interestCell.textContent = interest;
        row.appendChild(interestCell);

        const dateTakenCell = document.createElement('td');
        dateTakenCell.textContent = dateTaken;
        row.appendChild(dateTakenCell);

        const currentInterestCell = document.createElement('td');
        const currentInterest = calculateCurrentInterest(loanAmount, interest, dateTaken);
        currentInterestCell.textContent = currentInterest;
        row.appendChild(currentInterestCell);

        ledgerTableBody?.appendChild(row);
    }

    function calculateCurrentInterest(loanAmount, interest, dateTaken) {
        const currentDate = new Date();
        const takenDate = new Date(dateTaken);
        const diffTime = Math.abs(currentDate - takenDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const dailyInterest = (loanAmount * (interest / 100)) / 365;
        return (dailyInterest * diffDays).toFixed(2);
    }

    function saveLedgerEntry(entry) {
        const ledgerEntries = JSON.parse(localStorage.getItem('ledgerEntries') || '[]');
        ledgerEntries.push(entry);
        localStorage.setItem('ledgerEntries', JSON.stringify(ledgerEntries));
    }

    function loadLedgerEntries() {
        const ledgerEntries = JSON.parse(localStorage.getItem('ledgerEntries') || '[]');
        ledgerEntries.forEach(entry => {
            addLedgerEntry(entry);
        });
    }
});
