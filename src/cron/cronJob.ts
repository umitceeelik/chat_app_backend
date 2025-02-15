import cron from 'node-cron';
import pool from '../models/db';
import { generateDailyQuestion } from '../services/openaiService';
import { AI_BOT_ID } from '../config';

// 0 9 * * * means the job will run every day at 9:00 AM
// * * * * * means the job will run every minute 
cron.schedule('0 9 * * *', async () => {
    console.log(`[${new Date().toISOString()}] 🕒 Cron job triggered`);

    try {
        const conversations = await pool.query('SELECT id FROM conversations');
        console.log(`✅ Found ${conversations.rowCount} conversations`);

        for (const conversation of conversations.rows) {
            console.log(`🔹 Processing conversation ${conversation.id}`);

            const question = await generateDailyQuestion();
            console.log(`🎯 Generated question: ${question}`);

            const result = await pool.query(
                `INSERT INTO messages (conversation_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *`,
                [conversation.id, AI_BOT_ID, question]
            );

            console.log(`📩 Daily question sent for conversation ${conversation.id}`, result.rows[0]);
        }
    }
    catch (error) {
        console.error('❌ Error in daily question job:', error);
    }
});

