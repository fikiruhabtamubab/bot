const TelegramBot = require('node-telegram-bot-api');
const admin = require('firebase-admin');

// --- 🔥 PASTE YOUR TELEGRAM BOT TOKEN BELOW 🔥 ---
const TELEGRAM_TOKEN = '7281684199:AAGXXsvFtG8ATWwbddZKPDixj0eGZ36OBvE'; // Get this from BotFather

// This automatically finds your service account key file in the same folder
const serviceAccount = require('./serviceAccountKey.json'); 

// --- END OF CONFIGURATION ---

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://earn-app-60ca0-default-rtdb.firebaseio.com" // Make sure this matches your project
});

const db = admin.database();
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

console.log('Neon Earn Hub Bot is running...');

// This listens for commands like "/start r01234567"
bot.onText(/\/start (.+)/, async (msg, match) => {
    const newUserId = msg.from.id.toString(); // Telegram User ID of the new user
    const chatId = msg.chat.id;
    const referralCode = match[1]; 

    const existingUserRef = db.ref(`telegram_users/${newUserId}`);
    const existingUserSnap = await existingUserRef.once('value');

    if (existingUserSnap.exists()) {
        bot.sendMessage(chatId, "Welcome back! You have already started the bot.");
        return; 
    }
    
    if (referralCode.startsWith('r')) {
        const referrerId = referralCode.substring(1); 
        const referrerRef = db.ref(`users/${referrerId}`);
        const referrerSnap = await referrerRef.once('value');

        if (referrerSnap.exists()) {
            const bonus = 0.50;

            await referrerRef.update({
                balance: admin.database.ServerValue.increment(bonus),
                referralCount: admin.database.ServerValue.increment(1) // Corrected from incrementing by bonus amount
            });
            await db.ref(`referrals/${referrerId}`).push(newUserId);
            await existingUserRef.set({ referredBy: referrerId, signupDate: new Date().toISOString() });
            
            bot.sendMessage(chatId, `🎉 Welcome! You've successfully signed up via referral. A $${bonus.toFixed(2)} bonus has been credited. Thank you!`);

        } else {
            bot.sendMessage(chatId, "Sorry, that seems to be an invalid referral link.");
        }
    } else {
         bot.sendMessage(chatId, "Welcome to the Neon Earn Hub Bot!");
    }
});

bot.onText(/\/start$/, (msg) => {
    bot.sendMessage(msg.chat.id, "Welcome! To get a bonus, please restart the bot using a referral link from a friend.");
});