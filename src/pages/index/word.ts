interface Word {
  id: number;
  book: string;
  unit: number;
  type: string;
  en: string;
  cn: string;
  cnt: number;
  error: number;
  time: number;
}
// 单词数据库
const db: Word[] = [
  // 7A 单词
  { id: 1, book: "7A", unit: 1, type: "n", en: "vocabulary", cn: "词汇", cnt: 0, error: 0, time: 0 },
  { id: 2, book: "7A", unit: 1, type: "n", en: "dictionary", cn: "字典", cnt: 0, error: 0, time: 0 },
  { id: 3, book: "7A", unit: 1, type: "v", en: "learn", cn: "学习", cnt: 0, error: 0, time: 0 },
  { id: 4, book: "7A", unit: 1, type: "v", en: "study", cn: "学习，研究", cnt: 0, error: 0, time: 0 },
  { id: 5, book: "7A", unit: 1, type: "a", en: "difficult", cn: "困难的", cnt: 0, error: 0, time: 0 },
  { id: 6, book: "7A", unit: 1, type: "a", en: "easy", cn: "容易的", cnt: 0, error: 0, time: 0 },
  { id: 7, book: "7A", unit: 1, type: "d", en: "look up", cn: "查找", cnt: 0, error: 0, time: 0 },
  { id: 8, book: "7A", unit: 1, type: "o", en: "in order to", cn: "为了", cnt: 0, error: 0, time: 0 },
  
  // 7B 单词
  { id: 9, book: "7B", unit: 1, type: "n", en: "grammar", cn: "语法", cnt: 0, error: 0, time: 0 },
  { id: 10, book: "7B", unit: 1, type: "n", en: "pronunciation", cn: "发音", cnt: 0, error: 0, time: 0 },
  { id: 11, book: "7B", unit: 1, type: "v", en: "practice", cn: "练习", cnt: 0, error: 0, time: 0 },
  { id: 12, book: "7B", unit: 1, type: "v", en: "improve", cn: "提高", cnt: 0, error: 0, time: 0 },
  { id: 13, book: "7B", unit: 1, type: "a", en: "fluent", cn: "流利的", cnt: 0, error: 0, time: 0 },
  { id: 14, book: "7B", unit: 1, type: "a", en: "accurate", cn: "准确的", cnt: 0, error: 0, time: 0 },
  { id: 15, book: "7B", unit: 1, type: "d", en: "keep up", cn: "保持", cnt: 0, error: 0, time: 0 },
  { id: 16, book: "7B", unit: 1, type: "o", en: "as well as", cn: "和...一样", cnt: 0, error: 0, time: 0 },
  
  // 8A 单词
  { id: 17, book: "8A", unit: 1, type: "n", en: "sentence", cn: "句子", cnt: 0, error: 0, time: 0 },
  { id: 18, book: "8A", unit: 1, type: "n", en: "paragraph", cn: "段落", cnt: 0, error: 0, time: 0 },
  { id: 19, book: "8A", unit: 1, type: "v", en: "memorize", cn: "记忆", cnt: 0, error: 0, time: 0 },
  { id: 20, book: "8A", unit: 1, type: "v", en: "review", cn: "复习", cnt: 0, error: 0, time: 0 },
  { id: 21, book: "8A", unit: 1, type: "a", en: "effective", cn: "有效的", cnt: 0, error: 0, time: 0 },
  { id: 22, book: "8A", unit: 1, type: "a", en: "systematic", cn: "系统的", cnt: 0, error: 0, time: 0 },
  { id: 23, book: "8A", unit: 1, type: "d", en: "go through", cn: "复习，经历", cnt: 0, error: 0, time: 0 },
  { id: 24, book: "8A", unit: 1, type: "o", en: "in addition to", cn: "除...之外", cnt: 0, error: 0, time: 0 },
  
  // 8B 单词
  { id: 25, book: "8B", unit: 1, type: "n", en: "phrase", cn: "短语", cnt: 0, error: 0, time: 0 },
  { id: 26, book: "8B", unit: 1, type: "n", en: "idiom", cn: "习语", cnt: 0, error: 0, time: 0 },
  { id: 27, book: "8B", unit: 1, type: "v", en: "comprehend", cn: "理解", cnt: 0, error: 0, time: 0 },
  { id: 28, book: "8B", unit: 1, type: "v", en: "recite", cn: "背诵", cnt: 0, error: 0, time: 0 },
  { id: 29, book: "8B", unit: 1, type: "a", en: "challenging", cn: "有挑战性的", cnt: 0, error: 0, time: 0 },
  { id: 30, book: "8B", unit: 1, type: "a", en: "rewarding", cn: "有益的", cnt: 0, error: 0, time: 0 },
  { id: 31, book: "8B", unit: 1, type: "d", en: "figure out", cn: "弄明白", cnt: 0, error: 0, time: 0 },
  { id: 32, book: "8B", unit: 1, type: "o", en: "due to", cn: "由于", cnt: 0, error: 0, time: 0 },
  
  // 9A 单词
  { id: 33, book: "9A", unit: 1, type: "n", en: "context", cn: "上下文", cnt: 0, error: 0, time: 0 },
  { id: 34, book: "9A", unit: 1, type: "n", en: "synonym", cn: "同义词", cnt: 0, error: 0, time: 0 },
  { id: 35, book: "9A", unit: 1, type: "v", en: "associate", cn: "联想", cnt: 0, error: 0, time: 0 },
  { id: 36, book: "9A", unit: 1, type: "v", en: "categorize", cn: "分类", cnt: 0, error: 0, time: 0 },
  { id: 37, book: "9A", unit: 1, type: "a", en: "relevant", cn: "相关的", cnt: 0, error: 0, time: 0 },
  { id: 38, book: "9A", unit: 1, type: "a", en: "specific", cn: "具体的", cnt: 0, error: 0, time: 0 },
  { id: 39, book: "9A", unit: 1, type: "d", en: "break down", cn: "分解", cnt: 0, error: 0, time: 0 },
  { id: 40, book: "9A", unit: 1, type: "o", en: "in terms of", cn: "就...而言", cnt: 0, error: 0, time: 0 },
  
  // 9B 单词
  { id: 41, book: "9B", unit: 1, type: "n", en: "antonym", cn: "反义词", cnt: 0, error: 0, time: 0 },
  { id: 42, book: "9B", unit: 1, type: "n", en: "collocation", cn: "搭配", cnt: 0, error: 0, time: 0 },
  { id: 43, book: "9B", unit: 1, type: "v", en: "visualize", cn: "想象", cnt: 0, error: 0, time: 0 },
  { id: 44, book: "9B", unit: 1, type: "v", en: "retain", cn: "保持", cnt: 0, error: 0, time: 0 },
  { id: 45, book: "9B", unit: 1, type: "a", en: "efficient", cn: "高效的", cnt: 0, error: 0, time: 0 },
  { id: 46, book: "9B", unit: 1, type: "a", en: "comprehensive", cn: "全面的", cnt: 0, error: 0, time: 0 },
  { id: 47, book: "9B", unit: 1, type: "d", en: "come across", cn: "偶然遇到", cnt: 0, error: 0, time: 0 },
  { id: 48, book: "9B", unit: 1, type: "o", en: "regardless of", cn: "不管", cnt: 0, error: 0, time: 0 }
];

export default db;