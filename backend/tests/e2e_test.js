import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/v1';

const test = async () => {
    console.log('🚀 Starting E2E System Test...');

    try {
        // 1. Admin Login
        console.log('Checking Admin Login...');
        const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@admin.com',
            password: 'admin@admin.com'
        });
        const adminToken = adminLogin.data.token;
        console.log('✅ Admin Login Successful');

        // 2. Create Employee
        console.log('Creating Test Employee...');
        const newEmp = {
            firstName: 'Test',
            lastName: 'User',
            email: 'testuser@example.com',
            aadhaarCard: '999988887777',
            panCard: 'TESTP1234F',
            department: 'Engineering',
            position: 'Tester',
            basicSalary: 1000,
            gender: 'MALE'
        };
        const createRes = await axios.post(`${BASE_URL}/employee`, newEmp, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const empId = createRes.data._id;
        console.log(`✅ Employee Created with ID: ${empId}`);

        // 3. Staff Login (John Doe Aadhaar with spaces)
        console.log('Testing Staff Login with John Doe Aadhaar (with spaces)...');
        const staffLogin = await axios.post(`${BASE_URL}/auth/login`, {
            email: '1234 5678 9012', // John Doe Aadhaar
            password: 'ABCDE1234F'   // John Doe PAN
        });
        console.log('✅ John Doe Login Successful');

        // 4. Verify Access Sheets (Admin)
        console.log('Verifying Access Sheets Data...');
        const accessRes = await axios.get(`${BASE_URL}/employee`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const found = accessRes.data.find(e => e.aadhaarCard === '999988887777');
        if (found) {
            console.log('✅ Access Sheets Load Corrected');
        } else {
            throw new Error('Employee not found in Access Sheets');
        }

        // 5. Delete Employee
        console.log('Testing Employee Deletion...');
        const deleteRes = await axios.delete(`${BASE_URL}/employee/${empId}`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log(`✅ Delete Response: ${deleteRes.data.message}`);

        // 6. Verify Deletion
        console.log('Verifying Deletion status...');
        const verifyRes = await axios.get(`${BASE_URL}/employee`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const stillExists = verifyRes.data.find(e => e._id === empId);
        if (!stillExists) {
            console.log('✅ Employee successfully removed from active list');
        } else {
            throw new Error('Employee still exists after deletion');
        }

        console.log('\n✨ ALL SYSTEMS OPERATIONAL - E2E TEST PASSED ✨');
    } catch (error) {
        console.error('❌ TEST FAILED:', error.response?.data || error.message);
        process.exit(1);
    }
};

test();
