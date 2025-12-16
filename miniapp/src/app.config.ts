export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/youtube/index',
    'pages/sports/index',
    'pages/social/index',
    'pages/onboarding/index'
  ],
  window: {
    backgroundTextStyle: 'dark',
    navigationBarBackgroundColor: '#F8E8FF',
    navigationBarTitleText: '运动读书',
    navigationBarTextStyle: 'black'
  },
  lazyCodeLoading: 'requiredComponents',
  tabBar: {
    color: '#9CA3AF',
    selectedColor: '#A855F7',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页'
      },
      {
        pagePath: 'pages/sports/index',
        text: '运动'
      },
      {
        pagePath: 'pages/youtube/index',
        text: '学习'
      },
      {
        pagePath: 'pages/social/index',
        text: '社交'
      }
    ]
  }
});
