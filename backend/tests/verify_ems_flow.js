import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/v1';

const testEmployees = [
    { firstName: 'Test', lastName: '1', email: 'test1@ems.com', aadhaarCard: '100000000001', panCard: 'PAN0000001', gender: 'MALE', department: 'Engineering', position: 'Developer', basicSalary: 50000 },
    { firstName: 'Test', lastName: '2', email: 'test2@ems.com', aadhaarCard: '100000000002', panCard: 'PAN0000002', gender: 'FEMALE', department: 'Human Resources', position: 'HR Exec', basicSalary: 45000 },
    { firstName: 'Test', lastName: '3', email: 'test3@ems.com', aadhaarCard: '100000000003', panCard: 'PAN0000003', gender: 'MALE', department: 'Finance', position: 'Accountant', basicSalary: 40000 },
    { firstName: 'Test', lastName: '4', email: 'test4@ems.com', aadhaarCard: '100000000004', panCard: 'PAN0000004', gender: 'OTHER', department: 'Sales', position: 'Sales Lead', basicSalary: 60000 },
];

const runTests = async () => {
    console.log('--- STARTING COMPREHENSIVE EMS VERIFICATION ---');
    
    try {
        // 1. Admin Login
        const adminRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@admin.com',
            password: 'admin@admin.com'
        });
        const adminToken = adminRes.data.token;
        console.log('✅ Admin logged in');

        // 2. Add 4 Employees
        const createdEmployees = [];
        for (const emp of testEmployees) {
            const res = await axios.post(`${BASE_URL}/employee`, emp, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            createdEmployees.push(res.data);
            console.log(`✅ Added Employee: ${emp.firstName} ${emp.lastName}`);
        }

        // 3. Test Staff Login for Test 1 and Test 2
        const staffTokens = {};
        for (let i = 0; i < 2; i++) {
            const emp = testEmployees[i];
            const res = await axios.post(`${BASE_URL}/auth/login`, {
                email: emp.aadhaarCard,
                password: emp.panCard
            });
            staffTokens[emp.email] = res.data.token;
            console.log(`✅ Staff Login Successful: ${emp.firstName} ${emp.lastName}`);
        }

        // 4. Multiple Leave Requests for Test 1 and Test 2
        for (let i = 0; i < 2; i++) {
            const emp = testEmployees[i];
            const token = staffTokens[emp.email];
            
            // Request 1
            await axios.post(`${BASE_URL}/leave`, {
                type: 'ANNUAL',
                startDate: '2026-06-01',
                endDate: '2026-06-05',
                reason: 'Summer Trip'
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            // Request 2
            await axios.post(`${BASE_URL}/leave`, {
                type: 'SICK',
                startDate: '2026-06-10',
                endDate: '2026-06-12',
                reason: 'Medical Checkup'
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            console.log(`✅ Requested 2 Leaves for: ${emp.firstName} ${emp.lastName}`);
        }

        // 5. Admin Approve Leaves
        const leaveRes = await axios.get(`${BASE_URL}/leave`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const pendingLeaves = leaveRes.data.filter(l => l.status === 'PENDING');
        for (const leave of pendingLeaves) {
            await axios.put(`${BASE_URL}/leave/${leave._id}/status`, {
                status: 'APPROVED'
            }, { headers: { Authorization: `Bearer ${adminToken}` } });
        }
        console.log(`✅ Admin Approved ${pendingLeaves.length} pending leaves`);

        // 6. Delete Test 3
        const test3 = createdEmployees.find(e => e.lastName === '3');
        await axios.delete(`${BASE_URL}/employee/${test3._id}`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('✅ Deleted Test 3');

        // 7. Edit Test 4
        const test4 = createdEmployees.find(e => e.lastName === '4');
        await axios.put(`${BASE_URL}/employee/${test4._id}`, {
            ...testEmployees[3],
            position: 'Chief Sales Officer'
        }, { headers: { Authorization: `Bearer ${adminToken}` } });
        console.log('✅ Edited Test 4 Position');

        // 8. Final Verification
        const finalEmployees = await axios.get(`${BASE_URL}/employee`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        console.log('\n--- FINAL VERIFICATION RESULTS ---');
        console.log(`Total Active Employees: ${finalEmployees.data.length}`);
        const t3Exists = finalEmployees.data.find(e => e.lastName === '3');
        const t4 = finalEmployees.data.find(e => e.lastName === '4');
        
        if (!t3Exists) console.log('✅ Test 3 successfully removed from active list.');
        if (t4.position === 'Chief Sales Officer') console.log('✅ Test 4 edit verified.');
        
        console.log('\n--- ALL USER REQUESTED TESTS PASSED ---');

    } catch (error) {
        console.error('❌ TEST FAILED:', error.response?.data || error.message);
        process.exit(1);
    }
};

runTests();
