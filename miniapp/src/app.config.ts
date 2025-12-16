export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/youtube/index',
    'pages/sports/index',
    'pages/social/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#4F46E5',
    navigationBarTitleText: '运动读书',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#999999',
    selectedColor: '#4F46E5',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页'
      },
      {
        pagePath: 'pages/youtube/index',
        text: '读书'
      },
      {
        pagePath: 'pages/sports/index',
        text: '运动'
      },
      {
        pagePath: 'pages/social/index',
        text: '树洞'
      }
    ]
  }
});
