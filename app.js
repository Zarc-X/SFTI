// app.js
App({
  onLaunch() {
    wx.cloud.init({
      env: 'prod-2gzkep2k98d9b623', // 替换为云托管环境ID
      traceUser: true
    });
  }
})
