/**
 * Celebration confetti. `canvas-confetti` is imported dynamically so it never
 * lands in the initial bundle — it only loads the first time a player wins.
 * Client-only (uses `window`); call from event handlers/effects, not render.
 */
export async function fireConfetti(big = false): Promise<void> {
  const confetti = (await import('canvas-confetti')).default;
  const colors = ['#c0392b', '#ffcc00', '#2ecc71', '#3498db'];

  if (!big) {
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors });
    return;
  }

  // Bigger, sustained burst for finishing the whole quiz.
  const end = Date.now() + 1500;
  (function frame() {
    confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors });
    confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}
