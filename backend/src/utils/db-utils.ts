import mongoose, { ClientSession, Query } from 'mongoose';

export interface IPaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IPaginatedResult<T> {
  docs: T[];
  totalDocs: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const paginate = async <T>(
  query: Query<T[], T>,
  options: IPaginationOptions = {}
): Promise<IPaginatedResult<T>> => {
  const page = Math.max(1, options.page || 1);
  const limit = Math.max(1, Math.min(100, options.limit || 10));
  const skip = (page - 1) * limit;

  const model = query.model;
  const filter = query.getFilter();

  const [docs, totalDocs] = await Promise.all([
    model
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort(options.sortBy ? { [options.sortBy]: options.sortOrder === 'desc' ? -1 : 1 } : { createdAt: -1 })
      .exec() as Promise<T[]>,
    model.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalDocs / limit) || 1;

  return {
    docs,
    totalDocs,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

export const withTransaction = async <T>(
  action: (session: ClientSession) => Promise<T>
): Promise<T> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const result = await action(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
