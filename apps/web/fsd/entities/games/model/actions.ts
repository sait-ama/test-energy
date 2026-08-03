'use server';

import { BattlePassRepository } from '~entities/battlepass/model/repository';

export const submitPuzzle = async () =>
  BattlePassRepository.manageMinigames({ data: { game_id: 46 } });
export const submitMemory = async () =>
  BattlePassRepository.manageMinigames({ data: { game_id: 48 } });
export const submitMatch3 = async () =>
  BattlePassRepository.manageMinigames({ data: { game_id: 46 } });
