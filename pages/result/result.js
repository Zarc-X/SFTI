const { personalities } = require('../../utils/textResult.js');
Page({
  data: { resultCode: '', resultData: null, bars: [] },
  onLoad(options) {
    const code = options.code || 'TFEM';
    const rawCode = code.replace(/-/g, '');
    const dims = [
      { left: '技术(T)', right: '人文(H)', leftCode: 'T', val: rawCode[0] },
      { left: '自由(F)', right: '秩序(O)', leftCode: 'F', val: rawCode[1] },
      { left: '开拓(E)', right: '守护(G)', leftCode: 'E', val: rawCode[2] },
      { left: '宏大(M)', right: '微小(I)', leftCode: 'M', val: rawCode[3] }
    ];
    const bars = dims.map(d => ({
      leftLabel: d.left,
      rightLabel: d.right,
      isLeft: d.val === d.leftCode
    }));
    this.setData({ resultCode: code, resultData: personalities[code], bars });
  },
  goGenerate() { wx.navigateTo({ url: '/pages/avatar/avatar?code=' + this.data.resultCode }); },
  retest() { wx.reLaunch({ url: '/pages/index/index' }); },
  onShareAppMessage() {
    return {
      title: '我是SFTI科幻宇宙中的【' + this.data.resultData.name + '】，快来测测你的科幻人格吧！',
      path: '/pages/index/index'
    }
  }
});