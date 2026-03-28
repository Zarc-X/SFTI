const tools = require('../../utils/tools.js');
const { personalities } = require('../../utils/textResult.js');

const API_KEY = 'sk-ed938594bed948d0b778c72a472086df';

Page({
  data: {
    code: '',
    uploadImageUrl: '',
    generatedImageUrl: '',
    isGenerating: false,
    personalityName: '',
    personalityDesc: '',
    personalityShort: '',
    traits: []
  },
  onLoad(options) {
    if (options.code) {
      const personality = personalities[options.code] || personalities['TFEM'];
      const rawCode = options.code.replace(/-/g, '');
      const dimMap = {
        'T': '技术', 'H': '人文',
        'F': '自由', 'O': '秩序',
        'E': '开拓', 'G': '守护',
        'M': '宏大', 'I': '微小'
      };
      const traits = rawCode.split('').map(c => dimMap[c]);

      this.setData({
        code: options.code,
        personalityName: personality.name,
        personalityDesc: personality.desc,
        personalityShort: personality.short,
        traits: traits
      });
    }
  },
  chooseImage() {
    wx.chooseMedia({
      count: 1, mediaType: ['image'], sizeType: ['compressed'], sourceType: ['album', 'camera'],
      success: (res) => { this.setData({ uploadImageUrl: res.tempFiles[0].tempFilePath, generatedImageUrl: '' }); }
    });
  },

  // 获取本地图片的 base64 格式
  getBase64Image(filePath) {
    return new Promise((resolve, reject) => {
      wx.getFileSystemManager().readFile({
        filePath: filePath,
        encoding: 'base64',
        success: res => resolve('data:image/jpeg;base64,' + res.data),
        fail: reject
      });
    });
  },

  async handleGenerateImage() {
    if (this.data.isGenerating) return;
    this.setData({ isGenerating: true });
    wx.showLoading({ title: '开始链接星际节点...', mask: true });

    try {
      // 1. 根据测试结果构建 Prompt
      const personality = personalities[this.data.code] || personalities['TFEM'];
      let promptText = `请生成一张科幻风格的形象卡片，画面主体代表一个人格类型为【${personality.name}】的角色。详细设定：${personality.desc}\n要求：只返回一张最终图像即可，不要输出任何文字或多张图片。`;
      let contentArray = [];

      // 2. 如果用户上传了图片，将其转为 base64 发送作为参考
      if (this.data.uploadImageUrl) {
        wx.showLoading({ title: '正在提取生命体征...', mask: true });

        // 压缩图片以降低网络传输和验证开销，避免请求超时或者被大模型拒绝
        const compressRes = await new Promise((resolve, reject) => {
          wx.compressImage({
            src: this.data.uploadImageUrl,
            quality: 60, // 压缩质量
            success: resolve,
            fail: reject
          });
        });

        const base64Img = await this.getBase64Image(compressRes.tempFilePath);
        contentArray.push({ "image": base64Img });
        promptText += " (生成图片的着装和背景场景要符合人格特点。如果参考图片中存在人脸，请紧密参考提供的人物面部特征、发型和姿态生成图中的科幻人像，保持面部相似)";
      }

      contentArray.push({ "text": promptText });

      wx.showLoading({ title: '下达生成指令...', mask: true });

      // 3. 构建 API 请求 (异步模式)
      const isReference = !!this.data.uploadImageUrl;
      // wanx-v1 目前队列较长或不稳定，改用速度极快的最新 wanx2.1-t2i-turbo 模型
      let requestData = {};
      if (isReference) {
        requestData = {
          model: 'wan2.6-image',
          input: { messages: [{ role: 'user', content: contentArray }] },
          parameters: { enable_interleave: true, size: '1024*1024' }
        };
      } else {
        requestData = {
          model: 'wanx2.1-t2i-turbo',
          input: { prompt: promptText },
          parameters: { n: 1, size: '1024*1024' } // 限制生成数量为1，避免产生多倍费用
        };
      }

      const createTaskRes = await tools.safeRequest({
        url: isReference
          ? 'https://dashscope.aliyuncs.com/api/v1/services/aigc/image-generation/generation'
          : 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis',
        method: 'POST',
        header: {
          'Authorization': `Bearer ${API_KEY}`,
          'X-DashScope-Async': 'enable',
          'Content-Type': 'application/json'
        },
        data: requestData,
        showLoading: false
      });

      const taskId = createTaskRes.output.task_id;
      if (!taskId) throw new Error("未获取到任务ID: " + JSON.stringify(createTaskRes));

      wx.showLoading({ title: '正在汇聚光影像素...', mask: true });

      // 4. 开始轮询结果
      const finalImageUrl = await this.pollTaskStatus(taskId);

      this.setData({ generatedImageUrl: finalImageUrl });
      wx.showToast({ title: '形象构建成功', icon: 'success' });

    } catch (err) {
      console.error(err);
      wx.showModal({
        title: '引力波干扰',
        content: err.message || '宇宙深处的信号传输失败，是否重试？',
        confirmText: '重新呼叫',
        success: (res) => { if (res.confirm) this.handleGenerateImage(); }
      });
    } finally {
      this.setData({ isGenerating: false });
      wx.hideLoading();
    }
  },

  pollTaskStatus(taskId) {
    return new Promise((resolve, reject) => {
      let timer = null;
      let timeout = null;
      let isDone = false;

      // 整体接口最长等待 300s (图生图可能需要2-3分钟以上的计算和排队时间)
      timeout = setTimeout(() => {
        isDone = true;
        clearInterval(timer);
        reject(new Error("网络跃迁超时，未获取到图像"));
      }, 300000);

      const check = () => {
        if (isDone) return;
        wx.request({
          url: `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`,
          method: 'GET',
          header: { 'Authorization': `Bearer ${API_KEY}` },
          success: (res) => {
            if (res.statusCode === 200 && res.data.output) {
              const status = res.data.output.task_status;
              console.log(`[图像生成轮询] 当前任务状态: ${status}`);
              if (status === 'SUCCEEDED') {
                isDone = true;
                clearInterval(timer);
                clearTimeout(timeout);
                // 兼容不同版本的 API 返回结构
                // wan2.6 (image-generation) 在 choices[0].message.content 数组中
                // wanx-v1 (text2image) 在 results[0].url
                let url = '';
                if (res.data.output.choices && res.data.output.choices.length > 0) {
                  const content = res.data.output.choices[0].message.content;
                  if (Array.isArray(content)) {
                    // 由于万相可能有回复文本，需要寻找类型为 image 的项
                    const imgItem = content.find(item => item.image);
                    if (imgItem) url = imgItem.image;
                  }
                } else if (res.data.output.results && res.data.output.results.length > 0) {
                  url = res.data.output.results[0].url;
                }

                if (url) {
                  resolve(url);
                } else {
                  reject(new Error('生成成功但未找到图像数据'));
                }
              } else if (status === 'FAILED' || status === 'UNKNOWN') {
                isDone = true;
                clearInterval(timer);
                clearTimeout(timeout);
                reject(new Error(res.data.output.message || '生成维度碎裂'));
              }
            } else if (res.statusCode !== 200) {
              // 如果接口报错，立刻终止
              isDone = true;
              clearInterval(timer);
              clearTimeout(timeout);
              reject(new Error(`API Error: ${res.statusCode} | ${JSON.stringify(res.data)}`));
            }
          },
          fail: (err) => {
            console.error('[图像生成轮询请求失败]：', err);
            // 提示：如果是不在合法域名内造成的 fail，可以在开发者工具设置中勾选"不校验合法域名"
            // 我们依然只做 log，让 timeout 最终兜底，避免偶发网络抖动断掉整个任务
          }
        });
      };

      // 立即触发一次，并开启每 4 秒的轮询
      check();
      timer = setInterval(check, 4000);
    });
  },

  saveToAlbum() {
    if (!this.data.generatedImageUrl) return;

    wx.showLoading({ title: '正在下载影像...', mask: true });

    // 指定本地路径并加拓展名
    const localFilePath = wx.env.USER_DATA_PATH + '/sfti_avatar_' + Date.now() + '.png';

    wx.downloadFile({
      url: this.data.generatedImageUrl,
      filePath: localFilePath,
      success: (res) => {
        if (res.statusCode === 200) {
          wx.saveImageToPhotosAlbum({
            filePath: localFilePath,
            success: () => {
              wx.hideLoading();
              wx.showToast({ title: '档案已存入相册', icon: 'success' });
            },
            fail: (err) => {
              wx.hideLoading();
              const errMsg = err.errMsg || '';
              if (errMsg.includes('auth') || errMsg.includes('deny') || errMsg.includes('unauthorized')) {
                wx.showModal({
                  title: '权限提示',
                  content: '保存去设置中开启【保存到相册】权限。',
                  confirmText: '去设置',
                  success: (mRes) => {
                    if (mRes.confirm) wx.openSetting();
                  }
                });
              } else {
                wx.showToast({ title: '保存失败', icon: 'none' });
              }
            }
          });
        } else {
          wx.hideLoading();
          wx.showToast({ title: '下载失败', icon: 'none' });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({ title: '下载连接失败', icon: 'none' });
      }
    });
  }
});