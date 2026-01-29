import 'dotenv/config';
import mongoose from 'mongoose';
import Category from '../model/categoryModel.js';
import Link from '../model/linkModel.js';
import seedData from './seedData.js';

const runSeed = async () => {
  try {
    const uri = process.env.DATABASE_URL || process.env.MONGO_URI;
    if (!uri) throw new Error('DATABASE_URL or MONGO_URI is required');
    await mongoose.connect(uri);
    console.log('MongoDB connected for seed');

    await Link.deleteMany({});
    await Category.deleteMany({});

    for (const { name, order, links } of seedData) {
      const category = await Category.create({ name, order });
      await Link.insertMany(
        links.map(({ url, label }) => ({
          url,
          label: label || '',
          category: category._id,
        }))
      );
      console.log(`Seeded category: ${name} (${links.length} links)`);
    }

    console.log('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

runSeed();
