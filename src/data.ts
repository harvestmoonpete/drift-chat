export type Person = { id: string; color: string; note: string };
export type Message = {
  id: string;
  author: string;
  text: string;
  time: string;
  reactions?: { emoji: string; count: number; mine?: boolean }[];
};
export type Room = {
  id: string;
  topic: string;
  category: string;
  members: string[];
  messages: Message[];
  unread?: number;
  joined: boolean;
};
export const people: Person[] = [
  { id: "7C42", color: "lime", note: "You, for now" },
  { id: "A19F", color: "peach", note: "Here for a good conversation" },
  { id: "B284", color: "lavender", note: "Mostly curious" },
  { id: "E603", color: "blue", note: "Taking the scenic route" },
  { id: "F91D", color: "pink", note: "Just passing through" },
  { id: "C508", color: "teal", note: "One more thought" },
];
export const me = people[0];
const msg = (
  id: string,
  author: string,
  text: string,
  time: string,
  reactions?: Message["reactions"],
): Message => ({ id, author, text, time, reactions });
export const initialRooms: Room[] = [
  {
    id: "8a3f2e91-4d6b-4c28-9a17-bb06e3d521f0",
    topic: "The little things",
    category: "EVERYDAY LIFE",
    members: ["7C42", "A19F", "B284", "E603", "F91D", "C508"],
    joined: true,
    messages: [
      msg(
        "m1",
        "A19F",
        "Okay, very important question: what’s one tiny thing that made your day better?",
        "14:32",
      ),
      msg(
        "m2",
        "B284",
        "The person in front of me bought my coffee. We didn’t even speak. Just a little nod.",
        "14:33",
        [{ emoji: "☕", count: 3 }],
      ),
      msg(
        "m3",
        "E603",
        "I took the long way home and found a bookstore I’d walked past a hundred times. Finally went in.",
        "14:34",
      ),
      msg(
        "m4",
        "A19F",
        "Sometimes the side quest is the whole point.",
        "14:34",
        [{ emoji: "✨", count: 4 }],
      ),
      msg(
        "m5",
        "7C42",
        "This room, honestly. Nice to stumble into a conversation that isn’t trying to sell me anything.",
        "14:35",
      ),
      msg(
        "m6",
        "F91D",
        "A little corner of the internet that’s just… people. I like that.",
        "14:36",
      ),
    ],
  },
  {
    id: "c91b0a64-8e23-4f10-a626-23b7d5a92e11",
    topic: "After the credits",
    category: "FILM & CULTURE",
    members: ["7C42", "A19F", "F91D"],
    joined: true,
    unread: 2,
    messages: [
      msg(
        "f1",
        "F91D",
        "What film would you like to watch again for the first time?",
        "14:28",
      ),
      msg(
        "f2",
        "A19F",
        "Arrival. I sat through the entire credits without saying a word.",
        "14:29",
      ),
    ],
  },
  {
    id: "2f8d4c07-f692-45ba-b280-cc0a5179d324",
    topic: "Things we’re making",
    category: "CREATIVE CORNER",
    members: ["7C42", "B284", "C508"],
    joined: true,
    messages: [
      msg(
        "c1",
        "C508",
        "I’m trying to draw something every day. Today it’s a very questionable-looking pigeon.",
        "14:18",
      ),
      msg(
        "c2",
        "B284",
        "A questionable pigeon is still a pigeon you made. That counts.",
        "14:20",
      ),
    ],
  },
  {
    id: "6b104ea3-075d-4e8c-97aa-240cb5e329d6",
    topic: "Somewhere, it’s raining",
    category: "SLOW CONVERSATIONS",
    members: ["E603", "F91D", "C508"],
    joined: false,
    messages: [
      msg(
        "r1",
        "E603",
        "Rain against the window, no plans. What are you listening to?",
        "14:22",
      ),
      msg(
        "r2",
        "C508",
        "A piano playlist I found years ago and can never replace.",
        "14:23",
      ),
    ],
  },
  {
    id: "0de94c76-29f8-457a-a6bd-31028f9e0571",
    topic: "The midnight kitchen",
    category: "FOOD & STORIES",
    members: ["A19F", "B284", "C508"],
    joined: false,
    messages: [
      msg(
        "k1",
        "B284",
        "The best meal I’ve made this week was toast at midnight. No competition.",
        "14:14",
      ),
    ],
  },
  {
    id: "f750c24d-a17e-4389-8b02-661c4fd0a953",
    topic: "An open question",
    category: "BIG LITTLE QUESTIONS",
    members: ["E603", "A19F", "F91D"],
    joined: false,
    messages: [
      msg(
        "q1",
        "F91D",
        "If you could be a beginner at anything again, what would it be?",
        "14:10",
      ),
    ],
  },
];
export const initialDMs: Record<string, Message[]> = {
  B284: [
    msg(
      "dm1",
      "B284",
      "Hey, liked what you said about finding little corners of the internet.",
      "14:30",
    ),
    msg("dm2", "B284", "Any other good corners you’ve found lately?", "14:31"),
  ],
  E603: [
    msg(
      "dm3",
      "E603",
      "Sending you the name of that bookstore when I remember it 🙂",
      "14:24",
    ),
  ],
};
