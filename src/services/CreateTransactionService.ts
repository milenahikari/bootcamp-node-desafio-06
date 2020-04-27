import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import TransactionRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import FindOrCreateCategoryService from './FindOrCreateCategoryService';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}
class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const findOrCreateCategory = new FindOrCreateCategoryService();

    const categoryResult = await findOrCreateCategory.execute(category);

    const transactionRepository = await getCustomRepository(
      TransactionRepository,
    );

    const { total } = await transactionRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('Valor da retirada é maior que o disponível');
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category: categoryResult,
    });

    const transactionResult = await transactionRepository.save(transaction);

    delete transactionResult.id;

    return transactionResult;
  }
}

export default CreateTransactionService;
