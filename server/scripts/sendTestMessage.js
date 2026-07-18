require('dotenv').config();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const prisma = require('../src/db/prismaClient');

(async () => {
    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error('No JWT_SECRET in env');

        // Find two distinct users in the database to act as sender and receiver.
        let sender = await prisma.user.findFirst();
        if (!sender) {
            // Create a temporary sender user
            sender = await prisma.user.create({ data: { name: 'tmp-sender', email: `tmp-sender-${Date.now()}@example.com`, password: 'password' } });
        }

        let receiver = await prisma.user.findFirst({ where: { id: { not: sender.id } } });
        if (!receiver) {
            receiver = await prisma.user.create({ data: { name: 'tmp-receiver', email: `tmp-receiver-${Date.now()}@example.com`, password: 'password' } });
        }

        const senderId = sender.id;
        const receiverId = receiver.id;
        const token = jwt.sign({ id: senderId, role: 'CUSTOMER' }, secret, { expiresIn: '1d' });

        const payload = { receiverId, content: JSON.stringify({ productId: 999999, text: 'Test message from script at ' + new Date().toISOString() }) };

        console.log('Posting message...', payload);
        const post = await axios.post('http://localhost:5000/api/messages', payload, { headers: { Authorization: `Bearer ${token}` } });
        console.log('POST result:', post.status, post.data);

        console.log('\nFetching conversation...');
        const get = await axios.get(`http://localhost:5000/api/messages`, { params: { withUserId: receiverId }, headers: { Authorization: `Bearer ${token}` } });
        console.log('GET result count:', get.data.length);
        console.log(get.data.slice(-5));
    } catch (err) {
        console.error('Test failed:', err.response?.data || err.message || err);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
})();
