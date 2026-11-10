// Shared database fields used by the event list, card, form, and edit page.
export type Event = {
  id: number;
  date: string;
  title: string | null;
  description: string;
  category: string;
  listOfParticipants: string[] | null;
};
