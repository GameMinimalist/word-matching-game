// One calm accent colour per topic for subtle identity (topic tag + card edge).
export const TOPIC_META = {
  science: { label: 'Science', accent: '#4fd1c5' },
  history: { label: 'History', accent: '#e0a458' },
  psychology: { label: 'Psychology', accent: '#b794f6' },
  money: { label: 'Money', accent: '#68d391' },
  logic: { label: 'Logic', accent: '#63b3ed' },
  philosophy: { label: 'Philosophy', accent: '#f6889a' },
  system: { label: '', accent: '#8a8f98' }
}

export function topicAccent(topic) {
  return (TOPIC_META[topic] || TOPIC_META.system).accent
}

export function topicLabel(topic) {
  return (TOPIC_META[topic] || TOPIC_META.system).label
}
