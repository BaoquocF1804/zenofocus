const http = require('http');

function request(method, path, data) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: '/api' + path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => (body += chunk));
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    resolve(body);
                }
            });
        });

        req.on('error', (e) => reject(e));

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function test() {
    try {
        console.log('Testing GET /settings...');
        const settings = await request('GET', '/settings');
        console.log('Settings:', settings);

        console.log('Testing POST /settings...');
        const updateSettings = await request('POST', '/settings', {
            focusDuration: 30,
            shortBreakDuration: 5,
            longBreakDuration: 15,
            dailyGoalHours: 5
        });
        console.log('Update Settings:', updateSettings);

        console.log('Testing GET /theme...');
        const theme = await request('GET', '/theme');
        console.log('Theme:', theme);

        console.log('Testing POST /tasks...');
        const newTask = await request('POST', '/tasks', {
            id: 'test-task-1',
            title: 'Test Task',
            completed: false,
            createdAt: Date.now()
        });
        console.log('New Task:', newTask);

        console.log('Testing GET /tasks...');
        const tasks = await request('GET', '/tasks');
        console.log('Tasks:', tasks);

        console.log('Testing PATCH /tasks/:id (completed)...');
        const updateTaskCompleted = await request('PATCH', '/tasks/test-task-1', { completed: true });
        console.log('Update Task Completed:', updateTaskCompleted);

        console.log('Testing PATCH /tasks/:id (title)...');
        const updateTaskTitle = await request('PATCH', '/tasks/test-task-1', { title: 'Updated Task Title' });
        console.log('Update Task Title:', updateTaskTitle);

        console.log('Testing DELETE /tasks/:id...');
        const deleteTask = await request('DELETE', '/tasks/test-task-1');
        console.log('Delete Task:', deleteTask);

        console.log('All tests passed!');
    } catch (err) {
        console.error('Test failed:', err);
    }
}

test();
