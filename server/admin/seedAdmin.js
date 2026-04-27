import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const existingAdmin = await User.findOne({ username: 'admin' });

    if (existingAdmin) {
      console.log('Admin user already exists');
    } else {
      const admin = new User({
        name: 'Administrator',
        username: 'admin',
        email: 'admin@admin.com',
        password: 'admin',
        role: 'admin',
        isVerified: true
      });

      await admin.save();
      console.log('✅ Admin user created successfully');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error seeding admin user:', error.message);
    process.exit(1);
  }
};

seedAdmin();
