const tools = require('../../utils/tools.js');
Page({
  data: { code: '', uploadImageUrl: '', generatedImageUrl: '', isGenerating: false },
  onLoad(options) { if(options.code) this.setData({ code: options.code }); },
  chooseImage() {
    wx.chooseMedia({
      count: 1, mediaType: ['image'], sizeType: ['compressed'], sourceType: ['album', 'camera'],
      success: (res) => { this.setData({ uploadImageUrl: res.tempFiles[0].tempFilePath, generatedImageUrl: '' }); }
    });
  },
  async handleGenerateImage() {
    if (!this.data.uploadImageUrl) return wx.showToast({ title: '请先上传照片', icon: 'none' });
    if (this.data.isGenerating) return;
    this.setData({ isGenerating: true });
    wx.showLoading({ title: '正在宇宙深处绘制...', mask: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      this.setData({ generatedImageUrl: this.data.uploadImageUrl });
      wx.showToast({ title: '生成成功', icon: 'success' });
    } catch (err) {
      wx.showModal({
        title: '信号中断', content: '宇宙深处的信号传输失败，是否重试？', confirmText: '重新生成',
        success: (res) => { if (res.confirm) this.handleGenerateImage(); }
      });
    } finally {
      this.setData({ isGenerating: false });
      wx.hideLoading();
    }
  },
  saveToAlbum() {
    if (!this.data.generatedImageUrl) return;
    wx.saveImageToPhotosAlbum({
      filePath: this.data.generatedImageUrl,
      success: () => wx.showToast({ title: '已保存到相册', icon: 'success' }),
      fail: (err) => { if (err.errMsg.indexOf('auth deny') >= 0) wx.showToast({ title: '需要相册权限', icon: 'none' }); }
    });
  }
});