// pages/result/result.js
import textResults from "../../utils/textResult"

Page({
  data: {
    rds: textResults,
    rd: {} ,
    recommends:["星际迷航","星际拓荒","银河系漫游指南","无人深空","她的回忆","光环","索拉里斯星","冰汽时代","太空无垠","群星","银河英雄传说","极乐迪斯科","沙丘","亡星余孤","基地系列","赛博朋克2077"],
    recommend:"",
    results:[],
    counter: 0,
    ResultImgURL:""
  },

  getResultImgURL:function(){
    
  },
  goToHome:function(){
    wx.redirectTo({
      url: '/pages/index/index',
    })
  },
  onLoad: function(options) {
    const app = getApp(); // 获取全局应用程序实例
    const rs = JSON.parse(decodeURIComponent(options.rs));
    this.setData({
      results: rs
    });
    this.data.results.forEach((result, index) => {
      if(result.option==='B'){
        const c = this.data.counter;
        this.setData({
          counter: c + 2 ** (3 - index)
        })
      }
    });
    
    this.setData({
      recommend: this.data.recommends[this.data.counter],
      rd: this.data.rds[this.data.counter]
    });

    wx.cloud.getTempFileURL({
      fileList: [
        'cloud://prod-2gzkep2k98d9b623.7072-prod-2gzkep2k98d9b623-1350898369/img/r'+(this.data.counter+1)+'.jpg'
      ],
      success: res => {
        // 2. 从返回结果中提取临时 URL
        const tempFileURL = res.fileList[0].tempFileURL;
        console.log('测试结果的临时 URL:', tempFileURL);
     
        // 3. 使用临时 URL（例如展示图片）
        this.setData({
          ResultImgURL: tempFileURL
        });
      },
      fail: err => {
        console.error('获取失败:', err);
      }
    })
  },
  onShareAppMessage() {
    return {
      title: '快来测测你适合什么样的科幻作品吧！',
      path: '/pages/index/index',
      imageUrl: 'http://stk0d3166.hb-bkt.clouddn.com/image/logo.jpg'
    };
  },
  // onShareTimeline() {
  //   return {
  //     title: '分享到朋友圈', // 朋友圈分享标题
  //     query: 'from=timeline', // 自定义参数
  //     imageUrl: '/pages/image/logo.jpg', // 朋友圈分享图片
  //   };
  // },
  
})