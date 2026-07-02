import { redirect } from 'next/navigation';

/**
 * The classic quiz UI was replaced by the per-stage games (/map → /chang/[ord]).
 * Keeping /play as a redirect preserves old links AND closes an integrity hole:
 * stages 2–3 hold system "completion marker" questions that the classic UI
 * would happily present — letting players complete stages without ever playing
 * their games.
 */
export default function PlayPage() {
  redirect('/map');
}
