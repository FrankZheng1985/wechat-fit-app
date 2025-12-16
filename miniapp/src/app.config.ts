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
    navigationBarBackgroundColor: '#1F2937',
    navigationBarTitleText: '运动读书',
    navigationBarTextStyle: 'white'
  },
  lazyCodeLoading: 'requiredComponents',
  tabBar: {
    color: '#9CA3AF',
    selectedColor: '#F97316',
    backgroundColor: '#FFFFFF',
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
