import mongoose, { Schema, Document } from 'mongoose';

export interface IUserProfileDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  profileImage?: string;
  gender?: 'Male' | 'Female' | 'Other' | 'PreferNotToSay';
  dateOfBirth?: Date;
  phoneNumber?: string;
  targetExam: 'JEE' | 'NEET' | 'MHT-CET' | 'University' | 'Other';
  targetYear?: number;
  preferredSubjects?: string[];
  learningPreferences?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const UserProfileSchema = new Schema<IUserProfileDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    profileImage: {
      type: String,
      default: '',
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'PreferNotToSay'],
      default: 'PreferNotToSay',
    },
    dateOfBirth: {
      type: Date,
    },
    phoneNumber: {
      type: String,
      default: '',
    },
    targetExam: {
      type: String,
      enum: ['JEE', 'NEET', 'MHT-CET', 'University', 'Other'],
      default: 'JEE',
    },
    targetYear: {
      type: Number,
      default: () => new Date().getFullYear() + 1,
    },
    preferredSubjects: [
      {
        type: String,
      },
    ],
    learningPreferences: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export const UserProfileModel = mongoose.model<IUserProfileDocument>('UserProfile', UserProfileSchema, 'userProfiles');
