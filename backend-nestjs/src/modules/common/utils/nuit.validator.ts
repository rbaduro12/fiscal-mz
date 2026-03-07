/**
 * Validador de NUIT (Número Único de Identificação Tributária) - Moçambique
 * 
 * O NUIT moçambicano tem 9 dígitos no formato: XXXXXXXXX
 * O último dígito é um verificador calculado por um algoritmo ponderado
 */

export class NuitValidator {
  /**
   * Valida se o NUIT tem formato válido
   * - Deve ter 9 dígitos
   * - Deve conter apenas números
   * - Dígito verificador deve ser válido
   */
  static isValid(nuit: string): boolean {
    if (!nuit) return false;

    // Remove espaços e pontos
    const cleanNuit = nuit.replace(/[\s\.]/g, '');

    // Verifica se tem 9 dígitos
    if (cleanNuit.length !== 9) return false;

    // Verifica se são apenas números
    if (!/^\d{9}$/.test(cleanNuit)) return false;

    // Verifica dígito de controlo
    return this.checkDigit(cleanNuit);
  }

  /**
   * Calcula e verifica o dígito de controlo
   * Algoritmo: ponderação de 9 a 2, soma, módulo 11
   */
  private static checkDigit(nuit: string): boolean {
    const digits = nuit.split('').map(Number);
    const providedCheckDigit = digits[8];

    // Pesos: posições 1-8 têm pesos 9,8,7,6,5,4,3,2
    const weights = [9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;

    for (let i = 0; i < 8; i++) {
      sum += digits[i] * weights[i];
    }

    // Calcula dígito de controlo
    const remainder = sum % 11;
    let calculatedCheckDigit: number;

    if (remainder === 0 || remainder === 1) {
      calculatedCheckDigit = 0;
    } else {
      calculatedCheckDigit = 11 - remainder;
    }

    return calculatedCheckDigit === providedCheckDigit;
  }

  /**
   * Formata o NUIT para exibição: XXX XXX XXX
   */
  static format(nuit: string): string {
    if (!nuit) return '';
    const clean = nuit.replace(/\D/g, '');
    if (clean.length !== 9) return clean;
    return `${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6, 9)}`;
  }

  /**
   * Limpa o NUIT (remove tudo exceto números)
   */
  static clean(nuit: string): string {
    if (!nuit) return '';
    return nuit.replace(/\D/g, '');
  }

  /**
   * Gera um NUIT válido para testes
   */
  static generate(): string {
    // Gera 8 dígitos aleatórios
    const base = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10));
    
    // Calcula dígito de controlo
    const weights = [9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 8; i++) {
      sum += base[i] * weights[i];
    }
    
    const remainder = sum % 11;
    let checkDigit: number;
    if (remainder === 0 || remainder === 1) {
      checkDigit = 0;
    } else {
      checkDigit = 11 - remainder;
    }

    return [...base, checkDigit].join('');
  }
}
