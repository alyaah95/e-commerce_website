const cron = require('node-cron');
const pool = require('../db/db');

const runCartCleanup = async () => {
  console.log('Running cart cleanup job...');
  try {
    const result = await pool.query(
      `DELETE FROM cart_items WHERE created_at < NOW() - INTERVAL '24 hours'`
    );
    console.log(`Cleanup complete. Removed ${result.rowCount} expired items.`);
  } catch (error) {
    console.error('Error during cart cleanup:', error.message);
  }
};

// دالة تانية بتجهز الـ cron وتخليه مستعد
const startCleanupCron = () => {
  cron.schedule('0 * * * *', runCartCleanup);
  console.log('Cart cleanup Cron Job scheduled successfully (Every hour).');
};

// بنعمل Export للاتنين عشان نتحكم في وقت تشغيلهم بالظبط
module.exports = { runCartCleanup, startCleanupCron };