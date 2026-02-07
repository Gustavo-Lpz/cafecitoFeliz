// =====================================================
// 🎯 DESCUENTOS POR FIDELIDAD
// =====================================================
// compras acumuladas → % descuento
//
// 0        → 0%
// 1 - 3    → 5%
// 4 - 7    → 10%
// 8+       → 15%
// =====================================================

export function calculateDiscount(purchasesCount = 0) {

  if (!purchasesCount || purchasesCount <= 0) return 0;

  if (purchasesCount <= 3) return 5;

  if (purchasesCount <= 7) return 10;

  return 15; // 8 o más
}
