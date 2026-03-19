const pendingRequests = new Set();
const safeRequest = (options, retryCount = 1) => {
  const requestKey = options.url + '_' + JSON.stringify(options.data || {});
  if (pendingRequests.has(requestKey)) {
    return Promise.reject(new Error('请求正在处理中，请勿重复操作'));
  }
  pendingRequests.add(requestKey);
  if (options.showLoading !== false) {
    wx.showLoading({ title: options.loadingText || '正在加载...', mask: true });
  }
  return new Promise((resolve, reject) => {
    const doRequest = (currentRetry) => {
      wx.request({
        url: options.url,
        method: options.method || 'GET',
        data: options.data,
        timeout: 10000,
        header: { 'content-type': 'application/json', ...options.header },
        success: (res) => {
          if (res.statusCode === 200 && (!res.data.code || res.data.code === 0)) {
            resolve(res.data);
          } else {
            handleRetry(new Error((res.data && res.data.message) || '请求失败'), currentRetry);
          }
        },
        fail: (err) => handleRetry(err, currentRetry)
      });
    };
    const handleRetry = (err, currentRetry) => {
      if (currentRetry > 0) {
        console.warn('请求失败，重试中... ' + currentRetry);
        doRequest(currentRetry - 1);
      } else {
        reject(err);
      }
    };
    doRequest(retryCount);
  }).finally(() => {
    pendingRequests.delete(requestKey);
    if (options.showLoading !== false) {
      wx.hideLoading();
    }
  });
};
module.exports = { safeRequest };