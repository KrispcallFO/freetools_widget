async function fetchUsers() {
    try {
        const res = await fetch("https://fo.townizautomation.com/number/sms");
        const users = await res.json();
        const uniquePhones = new Set(users.map(user => user.phoneNumber));
        const TotalCode = new Set(users.map(user => user.code));

        const countEl = document.getElementById('total-phone-count');
        const countE2 = document.getElementById('total-code-count');
        if (countEl) {
            countEl.textContent = uniquePhones.size;
        }
        if (countE2) {
            countE2.textContent = TotalCode.size;
        }

        // ✅ Render table
        const tbody = document.getElementById('user-table-body');
        tbody.innerHTML = '';


        users.forEach(user => {
            const utcTimestamp = user.parsedTimestamp;
            const date = new Date(utcTimestamp);
            const localTime = date.toLocaleTimeString();
            const row = document.createElement('tr');


            row.className = 'text-gray-700 dark:text-gray-400';

            row.innerHTML = `
              <td class="px-4 py-3">
                <div class="flex items-center text-sm">
                  <div>
                    <p class="font-semibold">${user.phoneNumber}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 text-sm">${user.code}</td>

              <td class="px-4 py-3 text-xs break-words">
                <span class="px-2 py-1 font-semibold leading-tight rounded-full block">
                  ${user.text}
                </span>
              </td>

              <td class="px-4 py-3 text-sm">${localTime}</td>
            `;

            tbody.appendChild(row);
        });
    } catch (err) {
        console.error('Failed to fetch users:', err);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    fetchUsers();
    // updateTotalPhoneCount();
});

