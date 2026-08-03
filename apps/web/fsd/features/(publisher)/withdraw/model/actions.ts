'use server';
import { BillingRepository } from '~entities/billing/model/repository';
import { PublisherRepository } from '~entities/publisher/model/repository';
import type { WithDrawRequestSchema } from '~shared/api/models/billing';

export const postWithDraw = async ({ data }: { data: WithDrawRequestSchema }) => {
  await BillingRepository.createWithDraw({ data });
};
export const getLinkingCardsForWindow = async (
  ...params: Parameters<typeof PublisherRepository.connectCard>
) => await PublisherRepository.connectCard(params[0]);
export const removeConnectedCard = async (
  ...data: Parameters<typeof PublisherRepository.removeCard>
) => {
  await PublisherRepository.removeCard(data[0]);
};
export const getConnectedCards = async (
  ...params: Parameters<typeof PublisherRepository.getConnectedCards>
) => await PublisherRepository.getConnectedCards(params[0]);
