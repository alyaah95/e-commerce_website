const cron = require('node-cron');
const pool = require('./db/db'); // تأكدي من مسار ملف قاعدة البيانات

// هذه الوظيفة ستعمل كل ساعة للتأكد من نظافة الجدول
cron.schedule('0 * * * *', async () => {
    console.log('Running cart cleanup job...');
    try {
        // حذف العناصر التي مر عليها أكثر من 24 ساعة
        const deleteQuery = `
            DELETE FROM cart_items 
            WHERE created_at < NOW() - INTERVAL '1 hour'
        `;
        const result = await pool.query(deleteQuery);
        console.log(`Cleanup complete. Removed ${result.rowCount} expired items from carts.`);
    } catch (error) {
        console.error('Error during cart cleanup:', error.message);
    }
});