Page({
  data: {
    logoUrl:''
  },
  onLoad(){
    wx.cloud.getTempFileURL({
      fileList: [
        'cloud://prod-2gzkep2k98d9b623.7072-prod-2gzkep2k98d9b623-1350898369/img/logo.jpg' // 替换为你的 fileID
      ],
      success: res => {
        // 2. 从返回结果中提取临时 URL
        const tempFileURL = res.fileList[0].tempFileURL;
        console.log('临时 URL:', tempFileURL);
     
        // 3. 使用临时 URL（例如展示图片）
        this.setData({
          logoUrl: tempFileURL
        });
      },
      fail: err => {
        console.error('获取失败:', err);
      }
    })
  },

  ceshi:function(){
    wx.navigateTo({
      url: '/pages/questions/questions',
    })
   },
})
