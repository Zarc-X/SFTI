// pages/ques/ques.js
import modules from "../../utils/tools"

Page({
  data: {
    moduleList:modules,
    currentQuestion: 1, // 当前显示的问题编号
    answers: [] ,// 存储用户的答案
    nextQuestionBtn: false,
    bgURL:[]
  },
  
  onLoad(){
    wx.cloud.getTempFileURL({
      fileList: [
        'cloud://prod-2gzkep2k98d9b623.7072-prod-2gzkep2k98d9b623-1350898369/img/q1.jpg',
        'cloud://prod-2gzkep2k98d9b623.7072-prod-2gzkep2k98d9b623-1350898369/img/q2.jpg',
        'cloud://prod-2gzkep2k98d9b623.7072-prod-2gzkep2k98d9b623-1350898369/img/q3.jpg',
        'cloud://prod-2gzkep2k98d9b623.7072-prod-2gzkep2k98d9b623-1350898369/img/q4.jpg',
      ],
      success: res => {
        // 2. 从返回结果中提取临时 URL
        const urls = res.fileList.map(file => file.tempFileURL);
        console.log('批量 URL:', urls);
     
        // 3. 使用临时 URL（例如展示图片）
        this.setData({
          bgURL: urls
        });
      },
      fail: err => {
        console.error('获取失败:', err);
      }
    })
  },
  nextQuestion:function(){
    // 显示下一个问题
    if (this.data.currentQuestion < 5) {
      this.setData({
        currentQuestion: this.data.currentQuestion + 1
      });
    }
    // 隐藏下一个问题按钮
    if (this.data.nextQuestionBtn) {
      this.setData({
        nextQuestionBtn: !this.data.nextQuestionBtn
      });
    }
  },
  handleAnswer: function (event) {
    const answer = event.detail.value;
    const answers = this.data.answers;

    // 存储当前问题的答案
    answers[this.data.currentQuestion - 1] = answer;
    this.setData({
      answers: answers
    });

    
    console.log('表单数据：', this.data.answers)

    // 显示下一个问题按钮
    if (!this.data.nextQuestionBtn) {
      this.setData({
        nextQuestionBtn: !this.data.nextQuestionBtn
      });
    }
  },
  submitForm: function() {
    // 获得表单选项值
    const selectedOptions = this.data.answers;
    // 检查是否全部做完（示例代码，根据需要实现）

    // 构建结果数据数组
    let rs = [];
    this.data.moduleList.forEach((quest, index) => {
      const selectedOption = selectedOptions[index];
      const analysis = quest.analysis[selectedOption];
      rs.push({ question: quest.question, option: selectedOption, analysis: analysis });
    });

    // 传递参数rs给结果页使用
    wx.reLaunch({
      url: '../result/result?rs=' + encodeURIComponent(JSON.stringify(rs))
    });
  },
})