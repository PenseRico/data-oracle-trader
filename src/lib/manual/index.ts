import type { AbaManual } from "./types";
import { ABA_COMECANDO } from "./aba-comecando";
import { ABA_MERCADO } from "./aba-mercado";
import { ABA_ONCHAIN } from "./aba-onchain";
import { ABA_SINAIS } from "./aba-sinais";
import { ABA_BOTS_IA } from "./aba-bots-ia";
import { ABA_LIQUIDEZ } from "./aba-liquidez";
import { ABA_COMUNIDADE } from "./aba-comunidade";

export type { AbaManual, PaginaDoc, IndicadorDoc } from "./types";

/** Todas as abas do Manual, na ordem de exibição. */
export const MANUAL_ABAS: AbaManual[] = [
  ABA_COMECANDO,
  ABA_MERCADO,
  ABA_ONCHAIN,
  ABA_SINAIS,
  ABA_BOTS_IA,
  ABA_LIQUIDEZ,
  ABA_COMUNIDADE,
];
