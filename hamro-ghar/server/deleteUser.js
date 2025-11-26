import mongoose from 'mongoose';
    import User from './models/User.js'; // Adjust path if needed
    import 'dotenv/config';

    const emailToDelete = 'rawalsasuke7@gmail.com'; // 👈 PUT YOUR EMAIL HERE

    const run = async () => {
      try {
        await mongoose.connect(process.env.MONGO_URI, { dbName: 'hamroghar' });
        console.log('Connected to DB');

        const res = await User.deleteOne({ email: emailToDelete });
        console.log('Deleted count:', res.deletedCount);

      } catch (err) {
        console.error(err);
      } finally {
        await mongoose.disconnect();
      }
    };

    run();