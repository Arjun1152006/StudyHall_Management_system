// API base URL
    const API_BASE = window.location.origin + '/api';
    
    let students = [];
    let studyHalls = [];
    let currentSort = { field: 'name', order: 'asc' };
    let filteredStudents = [];

    // DOM Elements
    const totalStudentsEl = document.getElementById('totalStudents');
    const totalHallsEl = document.getElementById('totalHalls');
    const totalFeesEl = document.getElementById('totalFees');
    const pendingFeesEl = document.getElementById('pendingFees');
    const activeStudentsEl = document.getElementById('activeStudents');
    const leftStudentsEl = document.getElementById('leftStudents');
    const monthlyFeeTotalEl = document.getElementById('monthlyFeeTotal');
    const studentsTableBody = document.getElementById('studentsTableBody');
    const recentStudentsTableBody = document.getElementById('recentStudentsTableBody');
    const hallsTableBody = document.getElementById('hallsTableBody');
    const addStudentForm = document.getElementById('addStudentForm');
    const addHallForm = document.getElementById('addHallForm');
    const studyHallSelect = document.getElementById('studyHall');
    const feeReportTableBody = document.getElementById('feeReportTableBody');
    const exportReportBtn = document.getElementById('exportReportBtn');
    const upcomingFeesTableBody = document.getElementById('upcomingFeesTableBody');
    const notification = document.getElementById('notification');

    // Helper function for API calls
    async function apiCall(endpoint, options = {}) {
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Server returned non-JSON response');
            }
            
            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            showNotification('Error: ' + error.message, 'error');
            throw error;
        }
    }

    // Show notification
    function showNotification(message, type = 'success') {
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'block';
        
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }

    // PWA functionality
    let deferredPrompt;

    // Service Worker Registration
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }

    // Detect if app is running in standalone mode
    function isRunningStandalone() {
        return window.matchMedia('(display-mode: standalone)').matches || 
               window.navigator.standalone === true;
    }

    // Update UI for standalone mode
    function updateUIForStandalone() {
        if (isRunningStandalone()) {
            document.getElementById('mobileNav').style.display = 'flex';
            document.querySelector('.sidebar').style.display = 'none';
            document.querySelector('.main').style.marginLeft = '0';
        }
    }

    // Set active navigation item
    function setActiveNav(page) {
        document.querySelectorAll('.mobile-nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelectorAll('.sidebar a').forEach(item => {
            item.classList.remove('active');
        });
        
        // Activate mobile nav item
        const activeNavItem = Array.from(document.querySelectorAll('.mobile-nav-item'))
            .find(item => item.textContent.includes(getNavText(page)));
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }
        
        // Activate sidebar item (for when not in standalone)
        const activeSidebarItem = Array.from(document.querySelectorAll('.sidebar a'))
            .find(item => item.textContent.includes(getNavText(page)));
        if (activeSidebarItem && !isRunningStandalone()) {
            activeSidebarItem.classList.add('active');
        }
    }

    function getNavText(page) {
        const navMap = {
            'dashboardPage': 'Dashboard',
            'studentsPage': 'Students',
            'studyHallsPage': 'Study Halls',
            'upcomingFeesPage': 'Upcoming Fees',
            'reportsPage': 'Reports'
        };
        return navMap[page] || '';
    }

    function showPage(pageId) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(pageId).classList.add('active');
        
        if (pageId === 'dashboardPage') {
            updateDashboard();
            updateDashboardStats();
        } else if (pageId === 'studentsPage') {
            loadStudents();
        } else if (pageId === 'studyHallsPage') {
            loadStudyHalls();
        } else if (pageId === 'reportsPage') {
            updateReports();
        } else if (pageId === 'upcomingFeesPage') {
            loadUpcomingFees();
        } else if (pageId === 'addStudentPage') {
            loadStudyHallsForSelect();
        }
        
        setActiveNav(pageId);
    }

    async function updateDashboard() {
        try {
            // Load dashboard data
            const dashboardData = await apiCall('/dashboard');
            
            totalStudentsEl.textContent = dashboardData.totalStudents;
            totalHallsEl.textContent = dashboardData.totalHalls;
            totalFeesEl.textContent = `₹ ${dashboardData.totalFees}`;
            pendingFeesEl.textContent = `₹ ${dashboardData.pendingFees}`;
            
            // Load recent students
            await loadRecentStudents();
        } catch (error) {
            console.error('Error updating dashboard:', error);
        }
    }

    async function updateDashboardStats() {
        try {
            const dashboardData = await apiCall('/dashboard');
            
            activeStudentsEl.textContent = dashboardData.activeStudents;
            leftStudentsEl.textContent = dashboardData.leftStudents;
            monthlyFeeTotalEl.textContent = `₹ ${dashboardData.monthlyFeeTotal}`;
        } catch (error) {
            console.error('Error updating dashboard stats:', error);
        }
    }

    async function loadRecentStudents() {
        try {
            document.getElementById('recentStudentsLoading').style.display = 'block';
            document.getElementById('recentStudentsTable').style.display = 'none';
            document.getElementById('recentStudentsEmpty').style.display = 'none';
            
            const recentStudents = await apiCall('/students/recent');
            
            document.getElementById('recentStudentsLoading').style.display = 'none';
            
            if (recentStudents.length === 0) {
                document.getElementById('recentStudentsEmpty').style.display = 'block';
                return;
            }
            
            document.getElementById('recentStudentsTable').style.display = 'table';
            recentStudentsTableBody.innerHTML = '';
            
            recentStudents.forEach(st => {
                // Calculate status based on leftDate, feeDue, and original status
                const calculatedStatus =
                    st.leftDate ? 'Left'
                    : ((st.status === 'Paid') || (st.feeDue == null || st.feeDue <= 0))
                        ? 'Paid'
                        : 'Pending';

                const statusClass =
                    calculatedStatus === 'Left'
                        ? 'status-left'
                        : calculatedStatus === 'Paid'
                            ? 'status-paid'
                            : 'status-pending';

                const statusText = calculatedStatus;
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${st.name}</td>
                    <td>${st.cabin}</td>
                    <td>${st.hall}</td>
                    <td>${formatDate(st.joinDate)}</td>
                    <td>₹ ${st.monthlyFee || 0}</td>
                    <td class="${statusClass}">${statusText}</td>
                    <td class="action-buttons">
                        <button class="action-btn btn-primary" onclick="editStudent(${st.id})"><i class="fas fa-edit"></i></button>
                        <button class="action-btn btn-danger" onclick="deleteStudent(${st.id})"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                recentStudentsTableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error loading recent students:', error);
            document.getElementById('recentStudentsLoading').style.display = 'none';
        }
    }

    async function loadStudents() {
        try {
            document.getElementById('studentsLoading').style.display = 'block';
            document.getElementById('studentsTable').style.display = 'none';
            document.getElementById('studentsEmpty').style.display = 'none';
            document.getElementById('studentsNoResults').style.display = 'none';
            
            const sortBy = document.getElementById('sortBy').value;
            const sortOrder = document.getElementById('sortOrder').value;
            
            students = await apiCall(`/students?sortBy=${sortBy}&sortOrder=${sortOrder}`);
            
            document.getElementById('studentsLoading').style.display = 'none';
            
            if (students.length === 0) {
                document.getElementById('studentsEmpty').style.display = 'block';
                return;
            }
            
            filteredStudents = [...students];
            displayStudents(filteredStudents);
        } catch (error) {
            console.error('Error loading students:', error);
            document.getElementById('studentsLoading').style.display = 'none';
        }
    }

    function displayStudents(studentsToDisplay) {
        studentsTableBody.innerHTML = '';
        
        if (studentsToDisplay.length === 0) {
            document.getElementById('studentsTable').style.display = 'none';
            document.getElementById('studentsNoResults').style.display = 'block';
            return;
        }
        
        document.getElementById('studentsTable').style.display = 'table';
        document.getElementById('studentsNoResults').style.display = 'none';
        
        studentsToDisplay.forEach(st => {
            // Calculate status based on leftDate, feeDue, and original status
            const calculatedStatus =
                st.leftDate ? 'Left'
                : ((st.status === 'Paid') || (st.feeDue == null || st.feeDue <= 0))
                    ? 'Paid'
                    : 'Pending';

            const statusClass =
                calculatedStatus === 'Left'
                    ? 'status-left'
                    : calculatedStatus === 'Paid'
                        ? 'status-paid'
                        : 'status-pending';

            const statusText = calculatedStatus;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${st.name}</td>
                <td>${st.cabin}</td>
                <td>${st.hall}</td>
                <td>${st.phone}</td>
                <td>${formatDate(st.joinDate)}</td>
                <td>₹ ${st.monthlyFee || 0}</td>
                <td>₹ ${st.feePaid}</td>
                <td>₹ ${st.feeDue}</td>
                <td class="${statusClass}">${statusText}</td>
                <td class="action-buttons">
                    <button class="action-btn btn-primary" onclick="editStudent(${st.id})"><i class="fas fa-edit"></i></button>
                    ${!st.leftDate ? `
                        <button class="action-btn btn-warning" onclick="markStudentLeft(${st.id})"><i class="fas fa-sign-out-alt"></i></button>
                    ` : `
                        <button class="action-btn btn-success" onclick="reactivateStudent(${st.id})"><i class="fas fa-user-plus"></i></button>
                    `}
                    <button class="action-btn btn-danger" onclick="deleteStudent(${st.id})"><i class="fas fa-trash"></i></button>
                </td>
            `;
            studentsTableBody.appendChild(row);
        });
        
        updateSortIndicators();
    }

    async function filterStudents() {
        const searchTerm = document.getElementById('studentSearch').value.toLowerCase();
        
        if (searchTerm === '') {
            filteredStudents = [...students];
        } else {
            filteredStudents = students.filter(student =>
                (student.name || '').toLowerCase().includes(searchTerm) ||
                (student.cabin || '').toLowerCase().includes(searchTerm) ||
                (student.hall || '').toLowerCase().includes(searchTerm) ||
                (student.phone || '').includes(searchTerm)
            );
        }
        
        displayStudents(filteredStudents);
    }

    function sortStudents() {
        loadStudents(); // Reload with new sort parameters
    }

    function sortTable(field) {
        // Toggle sort order if clicking the same field
        if (currentSort.field === field) {
            currentSort.order = currentSort.order === 'asc' ? 'desc' : 'asc';
        } else {
            currentSort.field = field;
            currentSort.order = 'asc';
        }
        
        // Update dropdowns to match
        document.getElementById('sortBy').value = field;
        document.getElementById('sortOrder').value = currentSort.order;
        
        sortStudents();
    }

    function updateSortIndicators() {
        // Remove all sort classes
        document.querySelectorAll('th').forEach(th => {
            th.classList.remove('sort-asc', 'sort-desc');
        });
        
        // Add appropriate class to current sort column
        const header = Array.from(document.querySelectorAll('th')).find(th => 
            th.textContent.toLowerCase().includes(currentSort.field.toLowerCase())
        );
        
        if (header) {
            header.classList.add(currentSort.order === 'asc' ? 'sort-asc' : 'sort-desc');
        }
    }

    async function loadStudyHalls() {
        try {
            document.getElementById('hallsLoading').style.display = 'block';
            document.getElementById('hallsTable').style.display = 'none';
            document.getElementById('hallsEmpty').style.display = 'none';
            
            studyHalls = await apiCall('/study-halls');
            
            document.getElementById('hallsLoading').style.display = 'none';
            
            if (studyHalls.length === 0) {
                document.getElementById('hallsEmpty').style.display = 'block';
                return;
            }
            
            document.getElementById('hallsTable').style.display = 'table';
            hallsTableBody.innerHTML = '';
            
            // Get student counts for each hall
            const studentCounts = {};
            students.forEach(student => {
                studentCounts[student.hall] = (studentCounts[student.hall] || 0) + 1;
            });
            
            studyHalls.forEach(hall => {
                const studentsInHall = studentCounts[hall.name] || 0;
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${hall.name}</td>
                    <td>${hall.capacity}</td>
                    <td>${studentsInHall}</td>
                    <td>${hall.location}</td>
                    <td class="status-paid">Active</td>
                    <td class="action-buttons">
                        <button class="action-btn btn-primary" onclick="editHall(${hall.id})"><i class="fas fa-edit"></i></button>
                        <button class="action-btn btn-danger" onclick="deleteHall(${hall.id})"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                hallsTableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error loading study halls:', error);
            document.getElementById('hallsLoading').style.display = 'none';
        }
    }

    async function loadStudyHallsForSelect() {
        try {
            studyHalls = await apiCall('/study-halls');
            populateStudyHallSelect();
        } catch (error) {
            console.error('Error loading study halls for select:', error);
        }
    }

    function populateStudyHallSelect() {
        studyHallSelect.innerHTML = '<option value="">Select Study Hall</option>';
        studyHalls.forEach(hall => {
            const option = document.createElement('option');
            option.value = hall.name;
            option.textContent = hall.name;
            studyHallSelect.appendChild(option);
        });
    }

    // Calculate monthly fees
    async function calculateMonthlyFees() {
        if (confirm('Calculate monthly fees for all active students?')) {
            try {
                const result = await apiCall('/fees/calculate-monthly', {
                    method: 'POST'
                });
                showNotification(result.message);
                updateDashboard();
                updateDashboardStats();
                loadStudents();
            } catch (error) {
                console.error('Error calculating fees:', error);
            }
        }
    }

    // Load upcoming fees
    async function loadUpcomingFees() {
        try {
            document.getElementById('upcomingFeesLoading').style.display = 'block';
            document.getElementById('upcomingFeesTable').style.display = 'none';
            document.getElementById('upcomingFeesEmpty').style.display = 'none';
            
            const students = await apiCall('/upcoming-fees');
            
            document.getElementById('upcomingFeesLoading').style.display = 'none';

            if (students.length === 0) {
                document.getElementById('upcomingFeesEmpty').style.display = 'block';
                return;
            }

            document.getElementById('upcomingFeesTable').style.display = 'table';
            upcomingFeesTableBody.innerHTML = '';

            students.forEach(student => {
                const nextFeeDate = student.nextFeeDate || 'Not set';
                // Calculate status based on feeDue for upcoming fees
                const statusClass = (student.status === 'Paid' || student.feeDue <= 0) ? 'status-paid' : 'status-pending';
                const statusText = (student.status === 'Paid' || student.feeDue <= 0) ? 'Paid' : 'Pending';
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${student.name}</td>
                    <td>${student.hall}</td>
                    <td>₹ ${student.monthlyFee || 0}</td>
                    <td>₹ ${student.feeDue || 0}</td>
                    <td>${formatDate(nextFeeDate)}</td>
                    <td class="${statusClass}">${statusText}</td>
                    <td class="action-buttons">
                        <button class="action-btn btn-primary" onclick="editStudent(${student.id})"><i class="fas fa-edit"></i></button>
                        ${!student.leftDate ? `
                            <button class="action-btn btn-warning" onclick="markStudentLeft(${student.id})"><i class="fas fa-sign-out-alt"></i></button>
                        ` : `
                            <button class="action-btn btn-success" onclick="reactivateStudent(${student.id})"><i class="fas fa-user-plus"></i></button>
                        `}
                    </td>
                `;
                upcomingFeesTableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error loading upcoming fees:', error);
            document.getElementById('upcomingFeesLoading').style.display = 'none';
        }
    }

    // Mark student as left
    async function markStudentLeft(studentId) {
        const leftDate = prompt('Enter left date (YYYY-MM-DD) or leave empty for today:', new Date().toISOString().split('T')[0]);
        if (leftDate !== null) {
            try {
                await apiCall(`/students/${studentId}/leave`, {
                    method: 'PUT',
                    body: JSON.stringify({ leftDate: leftDate || undefined })
                });
                showNotification('Student marked as left successfully');
                loadStudents();
                updateDashboardStats();
            } catch (error) {
                console.error('Error marking student as left:', error);
            }
        }
    }

    // Reactivate student
    async function reactivateStudent(studentId) {
        if (confirm('Reactivate this student?')) {
            try {
                await apiCall(`/students/${studentId}/reactivate`, {
                    method: 'PUT'
                });
                showNotification('Student reactivated successfully');
                loadStudents();
                updateDashboardStats();
            } catch (error) {
                console.error('Error reactivating student:', error);
            }
        }
    }

    // Format date for display
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN');
    }

    // Form submission handlers
    addStudentForm.addEventListener('submit', async e => {
        e.preventDefault();
        
        const id = document.getElementById('editStudentId').value;
        const studentData = {
            name: document.getElementById('studentName').value,
            cabin: document.getElementById('cabinNumber').value,
            hall: document.getElementById('studyHall').value,
            phone: document.getElementById('phoneNumber').value,
            feePaid: parseInt(document.getElementById('feePaid').value),
            feeDue: parseInt(document.getElementById('feeDue').value),
            monthlyFee: parseInt(document.getElementById('monthlyFee').value) || 0,
            joinDate: document.getElementById('joinDate').value
        };

        try {
            if (id) {
                studentData.leftDate = document.getElementById('leftDate').value || null;
                await apiCall(`/students/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(studentData)
                });
                showNotification('Student updated successfully');
            } else {
                await apiCall('/students', {
                    method: 'POST',
                    body: JSON.stringify(studentData)
                });
                showNotification('Student added successfully');
            }
            
            addStudentForm.reset();
            document.getElementById('editStudentId').value = '';
            document.getElementById('studentFormTitle').textContent = "Add Student";
            // Set default join date to today
            document.getElementById('joinDate').value = new Date().toISOString().split('T')[0];
            showPage('studentsPage');
        } catch (error) {
            console.error('Error saving student:', error);
        }
    });

    addHallForm.addEventListener('submit', async e => {
        e.preventDefault();
        
        const id = document.getElementById('editHallId').value;
        const hallData = {
            name: document.getElementById('hallName').value,
            capacity: parseInt(document.getElementById('hallCapacity').value),
            location: document.getElementById('hallLocation').value,
            description: document.getElementById('hallDescription').value
        };

        try {
            if (id) {
                await apiCall(`/study-halls/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(hallData)
                });
                showNotification('Study hall updated successfully');
            } else {
                await apiCall('/study-halls', {
                    method: 'POST',
                    body: JSON.stringify(hallData)
                });
                showNotification('Study hall added successfully');
            }
            
            addHallForm.reset();
            document.getElementById('editHallId').value = '';
            document.getElementById('hallFormTitle').textContent = "Add Study Hall";
            showPage('studyHallsPage');
        } catch (error) {
            console.error('Error saving study hall:', error);
        }
    });

    async function editStudent(id) {
        try {
            const student = await apiCall(`/students/${id}`);
            
            document.getElementById('editStudentId').value = student.id;
            document.getElementById('studentName').value = student.name;
            document.getElementById('cabinNumber').value = student.cabin;
            document.getElementById('studyHall').value = student.hall;
            document.getElementById('phoneNumber').value = student.phone;
            document.getElementById('feePaid').value = student.feePaid;
            document.getElementById('feeDue').value = student.feeDue;
            document.getElementById('monthlyFee').value = student.monthlyFee || '';
            document.getElementById('joinDate').value = student.joinDate || '';
            document.getElementById('leftDate').value = student.leftDate || '';
            
            document.getElementById('studentFormTitle').textContent = "Edit Student";
            await loadStudyHallsForSelect();
            showPage('addStudentPage');
        } catch (error) {
            console.error('Error loading student for edit:', error);
        }
    }

    async function deleteStudent(id) {
        if (confirm("Are you sure you want to delete this student?")) {
            try {
                await apiCall(`/students/${id}`, { method: 'DELETE' });
                showNotification('Student deleted successfully');
                
                // Refresh the current page
                if (document.getElementById('dashboardPage').classList.contains('active')) {
                    updateDashboard();
                    updateDashboardStats();
                } else if (document.getElementById('studentsPage').classList.contains('active')) {
                    loadStudents();
                }
            } catch (error) {
                console.error('Error deleting student:', error);
            }
        }
    }

    async function editHall(id) {
        try {
            const hall = await apiCall(`/study-halls/${id}`);
            
            document.getElementById('editHallId').value = hall.id;
            document.getElementById('hallName').value = hall.name;
            document.getElementById('hallCapacity').value = hall.capacity;
            document.getElementById('hallLocation').value = hall.location;
            document.getElementById('hallDescription').value = hall.description || '';
            document.getElementById('hallFormTitle').textContent = "Edit Study Hall";
            showPage('addHallPage');
        } catch (error) {
            console.error('Error loading hall for edit:', error);
        }
    }

    async function deleteHall(id) {
        if (confirm("Are you sure you want to delete this hall?")) {
            try {
                await apiCall(`/study-halls/${id}`, { method: 'DELETE' });
                showNotification('Study hall deleted successfully');
                loadStudyHalls();
            } catch (error) {
                console.error('Error deleting hall:', error);
                if (error.message.includes('Cannot delete study hall with students')) {
                    showNotification('Cannot delete study hall with students assigned to it', 'error');
                }
            }
        }
    }

    async function updateReports() {
        try {
            // Update dashboard stats
            const dashboardData = await apiCall('/dashboard');
            
            document.getElementById('reportTotalStudents').textContent = dashboardData.totalStudents;
            document.getElementById('reportTotalHalls').textContent = dashboardData.totalHalls;
            document.getElementById('reportTotalFees').textContent = `₹ ${dashboardData.totalFees}`;
            document.getElementById('reportPendingFees').textContent = `₹ ${dashboardData.pendingFees}`;

            // Update fee collection report
            document.getElementById('feeReportLoading').style.display = 'block';
            document.getElementById('feeReportTable').style.display = 'none';
            document.getElementById('feeReportEmpty').style.display = 'none';
            
            const feeReportData = await apiCall('/reports/fee-collection');
            
            document.getElementById('feeReportLoading').style.display = 'none';
            
            if (feeReportData.length === 0) {
                document.getElementById('feeReportEmpty').style.display = 'block';
                return;
            }
            
            document.getElementById('feeReportTable').style.display = 'table';
            feeReportTableBody.innerHTML = '';

            feeReportData.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${row.hall}</td>
                    <td>${row.totalStudents}</td>
                    <td>₹ ${row.feesCollected}</td>
                    <td>₹ ${row.feesPending}</td>
                    <td>${row.collectionRate}</td>
                `;
                feeReportTableBody.appendChild(tr);
            });
        } catch (error) {
            console.error('Error updating reports:', error);
            document.getElementById('feeReportLoading').style.display = 'none';
        }
    }

    exportReportBtn.addEventListener('click', async () => {
        try {
            const feeReportData = await apiCall('/reports/fee-collection');
            
            let csv = "Study Hall,Total Students,Fees Collected,Fees Pending,Collection Rate\n";
            feeReportData.forEach(row => {
                csv += `"${row.hall}",${row.totalStudents},${row.feesCollected},${row.feesPending},"${row.collectionRate}"\n`;
            });
            
            const blob = new Blob([csv], { type: "text/csv" });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = "fee_report.csv";
            link.click();
            showNotification('Report exported successfully');
        } catch (error) {
            console.error('Error exporting report:', error);
        }
    });

    // Install prompt handling
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        showInstallPrompt();
    });

    function showInstallPrompt() {
        if (deferredPrompt && !isRunningStandalone()) {
            const installBtn = document.createElement('button');
            installBtn.innerHTML = '<i class="fas fa-download"></i> Install App';
            installBtn.className = 'btn-success';
            installBtn.style.position = 'fixed';
            installBtn.style.top = '70px';
            installBtn.style.right = '20px';
            installBtn.style.zIndex = '1000';
            installBtn.onclick = installPWA;
            
            document.body.appendChild(installBtn);
            
            // Auto-hide after 10 seconds
            setTimeout(() => {
                if (installBtn.parentNode) {
                    installBtn.parentNode.removeChild(installBtn);
                }
            }, 10000);
        }
    }

    async function installPWA() {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                console.log('User accepted the install prompt');
            }
            deferredPrompt = null;
        }
    }

    // Online/Offline detection
    window.addEventListener('online', () => {
        document.getElementById('offlineIndicator').style.display = 'none';
        console.log('App is online');
    });

    window.addEventListener('offline', () => {
        document.getElementById('offlineIndicator').style.display = 'block';
        console.log('App is offline');
    });

    // Initialize PWA features when DOM is loaded
    document.addEventListener('DOMContentLoaded', () => {
        updateUIForStandalone();
        setActiveNav('dashboardPage');
        
        // Set default join date to today
        document.getElementById('joinDate').value = new Date().toISOString().split('T')[0];
        
        // Check if app is already installed
        if (isRunningStandalone()) {
            console.log('App is running in standalone mode');
        }
        
        // Initial data load
        updateDashboard();
        updateDashboardStats();
        loadStudyHallsForSelect();
    });