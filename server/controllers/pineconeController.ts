import { RequestHandler, Request, NextFunction } from 'express';
import { CustomResponse } from '../types';
import { Pinecone, ScoredPineconeRecord } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';

dotenv.config();

// console.log(process.env.PINECONE_API_KEY)
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY as string,
});

export const queryPineconeDataBase: RequestHandler = async (
  req: Request,
  res: CustomResponse,
  next: NextFunction
) => {
  const { embedding } = res.locals;

  if (!embedding) {
    const error = {
      log: 'Database query did not receive embedding',
      code: 500,
      message: { err: 'An error occured before querying database' },
    };
    return next(error);
  }

  try {
    const index = pinecone.index('pokemon');
    const queryResponse: { matches: ScoredPineconeRecord[] } =
      await index.query({
        vector: embedding,
        topK: 3,
        includeMetadata: true,
      });
      console.log(queryResponse.matches)
      res.locals.pineconeQueryResult = queryResponse.matches.map((match) => match.metadata);

    next();
    return;
  } catch (err) {
    return next({
      log: `queryPineconeDatabase: ${new Error('Database query failed')}`,
      status: 500,
      message: { err: 'An error occurred while querying database' },
    });
  }
};
