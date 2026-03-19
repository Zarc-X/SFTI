Page({
  data: { isNavigating: false },
  startTest() {
    if (this.data.isNavigating) return;
    this.setData({ isNavigating: true });
    wx.navigateTo({
      url: '/pages/questions/questions',
      complete: () => setTimeout(() => this.setData({ isNavigating: false }), 500)
    });
  }
});