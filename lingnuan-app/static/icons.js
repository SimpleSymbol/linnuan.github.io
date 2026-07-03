/**
 * 图标库 - 基于IconPark设计风格的简洁扁平化图标
 * 所有图标均使用SVG格式，可根据需要更改颜色和大小
 */

export const iconData = {
  // 用户/个人图标
  "icon-user": '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 41C4 32.1634 12.0589 25 22 25" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M31.85 28C29.7237 28 28 30.0086 28 32.4864C28 36.9727 32.55 41.0513 35 42C37.45 41.0513 42 36.9727 42 32.4864C42 30.0086 40.2763 28 38.15 28C36.8479 28 35.6967 28.7533 35 29.9062C34.3033 28.7533 33.1521 28 31.85 28Z" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  
  // 返回图标
  "icon-back": '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M31 36L19 24L31 12" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  
  // 搜索图标
  "icon-search": '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 38C30.3888 38 38 30.3888 38 21C38 11.6112 30.3888 4 21 4C11.6112 4 4 11.6112 4 21C4 30.3888 11.6112 38 21 38Z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M33.2218 33.2218L41.7071 41.7071" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  
  // 锁/密码图标
  "icon-lock": '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="22" width="36" height="22" rx="2" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M14 22V14C14 8.47715 18.4772 4 24 4C29.5228 4 34 8.47715 34 14V22" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 30V36" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  
  // 编辑图标
  "icon-edit": '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 42H43" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M11 26.7199V34H18.3172L39 13.3081L31.6951 6L11 26.7199Z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/></svg>',
  
  // 眼睛/显示密码图标
  "icon-eye": '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 36C35.0457 36 44 24 44 24C44 24 35.0457 12 24 12C12.9543 12 4 24 4 24C4 24 12.9543 36 24 36Z" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M24 29C26.7614 29 29 26.7614 29 24C29 21.2386 26.7614 19 24 19C21.2386 19 19 21.2386 19 24C19 26.7614 21.2386 29 24 29Z" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/></svg>',
  
  // 闭眼/隐藏密码图标
  "icon-eye-close": '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.85786 18C6.23858 21 4 24 4 24C4 24 12.9543 36 24 36C25.3699 36 26.7076 35.8154 28 35.4921M20.0318 12.5C21.3144 12.1816 22.6414 12 24 12C35.0457 12 44 24 44 24C44 24 41.7614 27 38.1421 30" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M20.3142 20.6211C19.4981 21.5109 19 22.6972 19 24C19 26.7614 21.2386 29 24 29C25.3028 29 26.4891 28.5019 27.3789 27.6858" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M42 42L6 6" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  
  // 发送图标
  "icon-send": '<svg viewBox="-1 -1 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M42 8L28.7 46L21.1 28.9L4 21.3L42 8Z" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M42.0001 8L21.1001 28.9" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  
  // 图片图标
 "icon-image": '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M39 6H9C7.34315 6 6 7.34315 6 9V39C6 40.6569 7.34315 42 9 42H39C40.6569 42 42 40.6569 42 39V9C42 7.34315 40.6569 6 39 6Z" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M18 23C20.7614 23 23 20.7614 23 18C23 15.2386 20.7614 13 18 13C15.2386 13 13 15.2386 13 18C13 20.7614 15.2386 23 18 23Z" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M42 36L31 26L21 35L14 29L6 35" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  
  // 麦克风图标
  "icon-mic": '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="17" y="4" width="14" height="27" rx="7" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><path d="M9 23C9 31.2843 15.7157 38 24 38C32.2843 38 39 31.2843 39 23" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 38V44" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  
  // 麦克风关闭图标
  "icon-mic-off": '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M31 24V11C31 7.13401 27.866 4 24 4C20.134 4 17 7.13401 17 11V24C17 27.866 20.134 31 24 31C27.866 31 31 27.866 31 24Z" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><path d="M9 23C9 31.2843 15.7157 38 24 38C25.7532 38 27.4361 37.6992 29 37.1465M39 23C39 25.1333 38.5547 27.1626 37.7519 29" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 38V44" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M42 42L6 6" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  
  // 文本/笔记图标
  "icon-text": '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 8H40" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 16H40" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 24H40" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 32H40" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 40H24" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  
  // 电话图标
  "icon-phone": '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.3756 9.7941C15.1022 9.7941 15.7716 10.1881 16.1242 10.8234L18.5706 15.2302C18.891 15.8072 18.906 16.5051 18.6109 17.0954L16.254 21.809C16.254 21.809 16.937 25.3204 19.7955 28.1789C22.6539 31.0373 26.1535 31.7085 26.1535 31.7085L30.8665 29.3521C31.4572 29.0567 32.1555 29.072 32.7327 29.3929L37.1521 31.8499C37.7867 32.2027 38.1802 32.8718 38.1802 33.5979L38.1802 38.6714C38.1802 41.2551 35.7803 43.1211 33.3323 42.2951C28.3043 40.5986 20.4997 37.3684 15.5528 32.4215C10.606 27.4747 7.37576 19.67 5.67922 14.6421C4.8532 12.194 6.71929 9.7941 9.30293 9.7941L14.3756 9.7941Z" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M39 15H27V5H39V8L44 6V14L39 12V15Z" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  
  // 历史记录图标
  "icon-history": '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M42 24C42 33.9411 33.9411 42 24 42C14.0589 42 6 33.9411 6 24C6 14.0589 14.0589 6 24 6" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 14V24L30 28" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M38 6L42 10L38 14" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  
  // 设置/齿轮图标
  "icon-settings": '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 4L18 10H10V18L4 24L10 30V38H18L24 44L30 38H38V30L44 24L38 18V10H30L24 4Z" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M24 30C27.3137 30 30 27.3137 30 24C30 20.6863 27.3137 18 24 18C20.6863 18 18 20.6863 18 24C18 27.3137 20.6863 30 24 30Z" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/></svg>',
  
  // 志愿者/帮助图标
  "icon-volunteer": '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M33 14.5C33 19.1944 28.9706 23 24 23C19.0294 23 15 19.1944 15 14.5C15 9.80558 19.0294 6 24 6C28.9706 6 33 9.80558 33 14.5Z" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 23C14.6112 23 7 30.1634 7 39V44H41V39C41 30.1634 33.3888 23 24 23Z" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  
  // 聊天/对话图标
  "icon-chat": '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M44 6H4V36H13V41L23 36H44V6Z" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 19.5V22.5" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 19.5V22.5" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M34 19.5V22.5" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  
  // 结束通话图标
  "icon-end-call": '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.4438 21.5002C19.017 20.4327 18.8747 19.7008 18.8747 19.7008L21.2315 14.9871C21.5266 14.3968 21.5116 13.6989 21.1913 13.1219L18.7448 8.71511C18.3922 8.07987 17.7228 7.68585 16.9962 7.68585L11.9236 7.68585C9.33993 7.68585 7.47453 10.0881 8.30063 12.5361C9.5121 16.1261 11.5052 21.1308 14.3465 25.5002M26.6772 28.9117C27.9041 29.4334 28.7742 29.6003 28.7742 29.6003L33.4871 27.2438C34.0778 26.9485 34.7762 26.9637 35.3534 27.2846L39.7727 29.7416C40.4073 30.0945 40.8009 30.7635 40.8009 31.4896L40.8009 36.5632C40.8009 39.1468 38.3973 41.0118 35.9493 40.1856C32.2021 38.921 26.9142 36.805 22.4161 33.7619" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M40 8L8 40" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',

  // 复选框选中图标
  "icon-checkbox-checked": '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="6" width="36" height="36" rx="3" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M14 24L21 31L34 18" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  
  // 复选框未选中图标
  "icon-checkbox-unchecked": '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="6" width="36" height="36" rx="3" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/></svg>',
  
  // 主页/首页图标
  "icon-home": '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 20V42C9 43.1046 9.89543 44 11 44H37C38.1046 44 39 43.1046 39 42V20" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 22L24 4L44 22" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M26 44V31C26 29.3431 24.6569 28 23 28H25C23.3431 28 22 29.3431 22 31V44" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  
  // 视频图标 - 开启
  "icon-video": '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="10" width="32" height="28" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path fill-rule="evenodd" clip-rule="evenodd" d="M44 14L36 20.75V27.25L44 34V14Z" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 19L23 24L17 29" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  
  // 视频图标 - 关闭
  "icon-video-off": '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 12V38H20H28H30M18 10H20H36V24V27" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path fill-rule="evenodd" clip-rule="evenodd" d="M44 14L36 20.75V27.25L44 34V14Z" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M44 44L4 4" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',

  // 话题图标 - 从TopicIcon.vue集成
  "icon-topic": '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 26.7117 4.53967 29.2974 5.51747 31.6554C6.02232 32.8729 6.64396 34.0297 7.36843 35.1119C7.61157 35.4751 7.15543 37.7711 6 42C10.2289 40.8446 12.5249 40.3884 12.8881 40.6316C13.9703 41.356 15.1271 41.9777 16.3446 42.4825C18.7026 43.4603 21.2883 44 24 44Z" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M16.6045 19.8201H33.3838" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M21.8467 15.7378L18.933 32.2622" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M28.8467 15.7378L25.933 32.2622" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M14.6045 28H31.3838" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',

  // 话题图标(填充) - 从TopicIcon.vue集成
  "icon-topic-filled": '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 26.7117 4.53967 29.2974 5.51747 31.6554C6.02232 32.8729 6.64396 34.0297 7.36843 35.1119C7.61157 35.4751 7.15543 37.7711 6 42C10.2289 40.8446 12.5249 40.3884 12.8881 40.6316C13.9703 41.356 15.1271 41.9777 16.3446 42.4825C18.7026 43.4603 21.2883 44 24 44Z" fill="currentColor" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M16.6045 19.8201H33.3838" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M21.8467 15.7378L18.933 32.2622" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M28.8467 15.7378L25.933 32.2622" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M14.6045 28H31.3838" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  
  // 帖子评论图标
  "icon-comment": '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M44 7H4V37H11V42L21 37H44V7Z" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M31 16V17" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 16V17" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M31 25C31 25 29 29 24 29C19 29 17 25 17 25" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  
  // 帖子分享图标
  "icon-share": '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M26 4L44 22L26 39V28C12 28 6 43 6 43C6 26 11 15 26 15V4Z" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  
  // 帖子未点赞图标
  "icon-like": '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M27.6002 18.5998V11.3998C27.6002 8.41743 25.1826 5.99977 22.2002 5.99977L15.0002 22.1998V41.9998H35.9162C37.7113 42.0201 39.2471 40.7147 39.5162 38.9398L42.0002 22.7398C42.1587 21.6955 41.8506 20.6343 41.1576 19.8373C40.4645 19.0403 39.4564 18.5878 38.4002 18.5998H27.6002Z" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M15 22.0001H10.194C8.08532 21.9628 6.2827 23.7095 6 25.7994V38.3994C6.2827 40.4894 8.08532 42.0367 10.194 41.9994H15V22.0001Z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/></svg>',
  
  // 帖子已点赞图标
  "icon-like-filled": '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M27.6002 18.5998V11.3998C27.6002 8.41743 25.1826 5.99977 22.2002 5.99977L15.0002 22.1998V41.9998H35.9162C37.7113 42.0201 39.2471 40.7147 39.5162 38.9398L42.0002 22.7398C42.1587 21.6955 41.8506 20.6343 41.1576 19.8373C40.4645 19.0403 39.4564 18.5878 38.4002 18.5998H27.6002Z" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M15 22.0001H10.194C8.08532 21.9628 6.2827 23.7095 6 25.7994V38.3994C6.2827 40.4894 8.08532 42.0367 10.194 41.9994H15V22.0001Z" fill="currentColor" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/></svg>',
  
  // 发布按钮图标（改用 currentColor，跟随主题；去掉圆形背景，由 FAB 容器提供）
  "icon-publish": '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z" fill="currentColor" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M24 16V32" stroke="#FFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 24L32 24" stroke="#FFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',

  // 更多/省略号图标（新增，修复 community 按钮空白）
  "icon-more": '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 29C26.7614 29 29 26.7614 29 24C29 21.2386 26.7614 19 24 19C21.2386 19 19 21.2386 19 24C19 26.7614 21.2386 29 24 29Z" fill="currentColor"/><path d="M10 29C12.7614 29 15 26.7614 15 24C15 21.2386 12.7614 19 10 19C7.23858 19 5 21.2386 5 24C5 26.7614 7.23858 29 10 29Z" fill="currentColor"/><path d="M38 29C40.7614 29 43 26.7614 43 24C43 21.2386 40.7614 19 38 19C35.2386 19 33 21.2386 33 24C33 26.7614 35.2386 29 38 29Z" fill="currentColor"/></svg>',

  // 删除图标
  "icon-delete": '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 11L40 11" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M18 5L30 5" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 17H36V40C36 41.6569 34.6569 43 33 43H15C13.3431 43 12 41.6569 12 40V17Z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M20 25L28 33" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M28 25L20 33" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',

  // 情感监测图标
  "icon-emotion": '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 7C5 5.34315 6.34315 4 8 4H32C33.6569 4 35 5.34315 35 7V44H8C6.34315 44 5 42.6569 5 41V7Z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M35 24C35 22.8954 35.8954 22 37 22H41C42.1046 22 43 22.8954 43 24V41C43 42.6569 41.6569 44 40 44H35V24Z" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M11 12H19" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M11 19H23" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',

  // 日历图标
  "icon-calendar": '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="8" width="40" height="36" rx="2" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M4 16H44" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 4V12" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M36 4V12" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 24H14" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M23 24H25" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M34 24H36" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 32H14" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M23 32H25" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M34 32H36" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
}; 