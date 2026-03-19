const { questions } = require('../../utils/textResult.js');
Page({
  data: { currentIndex: 0, totalQuestions: 0, currentQuestion: null, answers: [], isProcessing: false },
  onLoad() {
    const cached = wx.getStorageSync('sfti_answers_cache');
    let sIdx = 0; let sAns = [];
    if (cached && cached.length > 0 && cached.length < questions.length) { sIdx = cached.length; sAns = cached; }
    this.setData({ totalQuestions: questions.length, currentIndex: sIdx, answers: sAns, currentQuestion: questions[sIdx] });
  },
  selectOption(e) {
    if (this.data.isProcessing) return;
    this.setData({ isProcessing: true });
    const val = e.currentTarget.dataset.val;
    const newAnswers = [...this.data.answers, val];
    wx.setStorageSync('sfti_answers_cache', newAnswers);
    if (this.data.currentIndex < this.data.totalQuestions - 1) {
      this.setData({
        answers: newAnswers,
        currentIndex: this.data.currentIndex + 1,
        currentQuestion: questions[this.data.currentIndex + 1]
      });
      setTimeout(() => { this.setData({ isProcessing: false }); }, 300);
    } else {
      this.calculateResult(newAnswers);
    }
  },
  goBack() {
    if (this.data.currentIndex > 0) {
      const newAnswers = this.data.answers.slice(0, -1);
      wx.setStorageSync('sfti_answers_cache', newAnswers);
      this.setData({
        answers: newAnswers,
        currentIndex: this.data.currentIndex - 1,
        currentQuestion: questions[this.data.currentIndex - 1]
      });
    }
  },
  calculateResult(answers) {
    const counts = { T:0, H:0, F:0, O:0, E:0, G:0, M:0, I:0 };
    answers.forEach(a => { if (counts[a] !== undefined) counts[a]++ });
    const d1 = counts.T >= counts.H ? 'T' : 'H';
    const d2 = counts.F >= counts.O ? 'F' : 'O';
    const d3 = counts.E >= counts.G ? 'E' : 'G';
    const d4 = counts.M >= counts.I ? 'M' : 'I';
    const finalCode = d1 + d2 + d3 + d4;
    wx.removeStorageSync('sfti_answers_cache');
    wx.redirectTo({ url: '/pages/result/result?code=' + finalCode });
  }
});