require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { Mutex } = require('async-mutex');

// 创建express应用
const app = express();
const PORT = process.env.PORT || 3000;

// ========== 配置项抽离 ==========
const CONFIG = {
  API: {
    DEEPSEEK_KEY: process.env.DEEPSEEK_API_KEY,
    DEEPSEEK_URL: 'https://api.deepseek.com/v1/chat/completions',
    TIMEOUT: 30000,
    MAX_TOKENS: {
      CHAT: 300,
      MEMOIR: 2000,
      MOOD_ANALYZE: 1200
    },
    RETRY_TIMES: 0,
    MAX_PROMPT_LENGTH: 3000
  },
  PATH: {
    SESSION: path.join(__dirname, 'data/sessions'),
    TEMP_CONV: path.join(__dirname, 'data/temp_conversations'),
    FORMAL_CONV: path.join(__dirname, 'data/conversations'),
    MEMOIR: path.join(__dirname, 'data/memoirs'),
    USERS: path.join(__dirname, 'data/users'),
    COMMUNITY: path.join(__dirname, 'data/community')
  },
  CLEANUP: {
    EXPIRE_HOURS: 1,
    INTERVAL_MINUTES: 30
  },
  VALIDATION: {
    USER_ID_REGEX: /^(?:[a-zA-Z0-9_-]{4,32}|\d{11})$/,
    // 会话ID格式支持两种：
    //   1. AI对话：11位手机号_时间戳（如 13800138000_20260702T112100.123）
    //   2. 回忆录/旧接口：UUID v4（如 a1b2c3d4-e5f6-7890-abcd-ef1234567890）
    SESSION_ID_REGEX: /^(?:\d{11}_\d{4}\d{2}\d{2}T\d{2}\d{2}\d{2}\.\d{3}|[a-zA-Z0-9_-]{8,64})$/,
    CONTENT_MAX_LENGTH: 5000,
    MEMOIR_MAX_LENGTH: 20000 // 新增：回忆录最大长度限制
  },
  LOCK: {
    EXPIRE_MINUTES: 60 // 锁过期时间
  }
};

// ========== 并发锁初始化 ==========
const fileLocks = new Map();
const lockUsageTime = new Map();

// 锁的key改为 userId_sessionId 组合，保证会话级别的锁隔离
const getLockKey = (userId, sessionId) => {
  if (!userId || !sessionId) throw new Error('userId和sessionId不能为空');
  return `${userId}_${sessionId}`;
};

const getFileLock = (userId, sessionId) => {
  const lockKey = getLockKey(userId, sessionId);
  if (!fileLocks.has(lockKey)) {
    fileLocks.set(lockKey, new Mutex());
  }
  lockUsageTime.set(lockKey, Date.now());
  return fileLocks.get(lockKey);
};

// 定时清理过期锁（修复遍历中修改Map的问题）
setInterval(() => {
  const now = Date.now();
  const expireTime = now - CONFIG.LOCK.EXPIRE_MINUTES * 60 * 1000;
  const expiredLockKeys = [];
  for (const [lockKey, lastUsed] of lockUsageTime.entries()) {
    if (lastUsed < expireTime) {
      expiredLockKeys.push(lockKey);
    }
  }
  expiredLockKeys.forEach(lockKey => {
    fileLocks.delete(lockKey);
    lockUsageTime.delete(lockKey);
    console.log(`🔓 清理过期锁：${lockKey}`);
  });
}, 30 * 60 * 1000);

// ========== 工具函数 ==========
// 新增：路径净化函数，防止路径遍历攻击
const sanitizeFileName = (fileName) => {
  return fileName.replace(/[\\/:*?"<>|]/g, '_').trim();
};

// 新增：生成临时对话文件路径（按会话隔离）
const getTempConvFilePath = (userId, sessionId) => {
  if (!userId || !sessionId) throw new Error('userId和sessionId不能为空');
  const sanitizedUserId = sanitizeFileName(userId);
  const sanitizedSessionId = sanitizeFileName(sessionId);
  return path.join(CONFIG.PATH.TEMP_CONV, `${sanitizedUserId}_${sanitizedSessionId}.json`);
};

// ========== 启动前检查 ==========
if (!CONFIG.API.DEEPSEEK_KEY) {
  console.error('❌ 错误：未配置 DEEPSEEK_API_KEY 环境变量，请检查 .env 文件');
  process.exit(1);
}

// 安装依赖检查
try {
  require('async-mutex');
  require('uuid');
} catch (err) {
  console.error('❌ 缺少依赖包，请执行：npm install async-mutex uuid');
  process.exit(1);
}

// 中间件配置
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 请求参数校验中间件（新增sessionId校验）
// 请求参数校验中间件（修复：增加undefined防护，解决TypeError）
app.use((req, res, next) => {
  // 核心修复：先判断req.body/req.params是否存在，再取值
  const bodyUserId = req.body?.userId; // 可选链操作符，避免undefined报错
  const paramsUserId = req.params?.userId;
  const bodySessionId = req.body?.sessionId;
  const paramsSessionId = req.params?.sessionId;

  const userId = bodyUserId || paramsUserId;
  const sessionId = bodySessionId || paramsSessionId;

  // 校验userId（仅当userId存在时才校验格式）
  if (userId && !CONFIG.VALIDATION.USER_ID_REGEX.test(userId)) {
    return res.status(400).json({
      success: false,
      message: 'userId格式无效，仅支持字母、数字、下划线、横杠，长度4-32位'
    });
  }

  // 校验sessionId（仅当sessionId存在时才校验格式）
  if (sessionId && !CONFIG.VALIDATION.SESSION_ID_REGEX.test(sessionId)) {
    return res.status(400).json({
      success: false,
      message: 'sessionId格式无效'
    });
  }

  next(); // 继续执行后续中间件/接口
});

// 确保目录存在
(async () => {
  try {
    await Promise.all([
      fs.ensureDir(CONFIG.PATH.SESSION),
      fs.ensureDir(CONFIG.PATH.TEMP_CONV),
      fs.ensureDir(CONFIG.PATH.FORMAL_CONV),
      fs.ensureDir(CONFIG.PATH.MEMOIR),
      fs.ensureDir(CONFIG.PATH.USERS),
      fs.ensureDir(CONFIG.PATH.COMMUNITY)
    ]);
    console.log('✅ 数据目录初始化完成');
    await cleanExpiredTempConversations();
  } catch (err) {
    console.error('❌ 目录创建失败：', err.message);
    process.exit(1);
  }
})();

/**
 * 清理过期临时对话（超过指定小时未保存的）
 */
async function cleanExpiredTempConversations() {
  try {
    const files = await fs.readdir(CONFIG.PATH.TEMP_CONV);
    const expireTime = Date.now() - CONFIG.CLEANUP.EXPIRE_HOURS * 3600 * 1000;
    const oneMinuteAgo = Date.now() - 60 * 1000;

    for (const file of files) {
      const filePath = path.join(CONFIG.PATH.TEMP_CONV, file);
      try {
        const stats = await fs.stat(filePath);
        if (stats.mtimeMs < expireTime && stats.mtimeMs < oneMinuteAgo) {
          await fs.unlink(filePath);
          console.log(`🗑️  清理过期临时对话：${file}`);
        }
      } catch (err) {
        console.warn(`⚠️  清理文件失败 ${file}：`, err.message);
        continue;
      }
    }
  } catch (err) {
    console.error('❌ 清理临时对话失败：', err.message);
  }
}

// 定时清理任务
setInterval(async () => {
  try {
    await cleanExpiredTempConversations();
  } catch (err) {
    console.error('❌ 定时清理任务异常：', err.message);
  }
}, CONFIG.CLEANUP.INTERVAL_MINUTES * 60 * 1000);

/**
 * 通用的DeepSeek AI调用函数（带重试）
 */
async function callDeepSeekAI(messages, maxTokens = CONFIG.API.MAX_TOKENS.CHAT, retry = 0) {
  try {
    console.log(`📡 调用AI接口 [${new Date().toISOString()}]：`, CONFIG.API.DEEPSEEK_URL);
    console.log('🔑 API Key前缀：', CONFIG.API.DEEPSEEK_KEY.substring(0, 8) + '...');
    
    const response = await axios.post(
      CONFIG.API.DEEPSEEK_URL,
      {
        model: 'deepseek-chat',
        messages: messages,
        temperature: 0.7,
        max_tokens: maxTokens
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CONFIG.API.DEEPSEEK_KEY}`
        },
        timeout: CONFIG.API.TIMEOUT
      }
    );

    if (!response.data.choices || response.data.choices.length === 0) {
      throw new Error('AI返回空内容');
    }

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error(`\n======= AI调用错误 [${new Date().toISOString()}] =======`);
    console.error('请求地址:', CONFIG.API.DEEPSEEK_URL);
    console.error('错误类型:', error.name);
    console.error('错误消息:', error.message);
    
    if (error.response) {
      console.error('响应状态码:', error.response.status);
      console.error('响应内容:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('请求已发送，但无响应（检查网络/API地址）');
    }

    if (retry < CONFIG.API.RETRY_TIMES) {
      console.log(`🔄 第 ${retry + 1} 次重试...`);
      return callDeepSeekAI(messages, maxTokens, retry + 1);
    }
    
    throw new Error('AI服务暂时不可用，请稍后再试');
  }
}

/**
 * 生成新的会话ID（供前端调用）
 */
async function generateNewSessionId() {
  return uuidv4(); // 使用uuidv4生成唯一会话ID
}

/**
 * 保存对话记录到临时目录（按会话隔离）
 */
async function saveTempConversation(userId, sessionId, conversation) {
  const lock = getFileLock(userId, sessionId);
  const release = await lock.acquire();

  try {
    const filePath = getTempConvFilePath(userId, sessionId);
    
    if (conversation.userContent && conversation.userContent.length > CONFIG.VALIDATION.CONTENT_MAX_LENGTH) {
      throw new Error(`对话内容过长，最大支持${CONFIG.VALIDATION.CONTENT_MAX_LENGTH}字符`);
    }

    let conversations = [];
    if (await fs.pathExists(filePath)) {
      try {
        conversations = await fs.readJSON(filePath);
      } catch (err) {
        console.warn(`⚠️  读取临时对话文件失败，重置为空 [${userId}_${sessionId}]：`, err.message);
        conversations = [];
      }
    }

    if (conversations.length >= 100) {
      conversations = conversations.slice(-99);
    }

    conversations.push({
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      ...conversation
    });

    await fs.writeJSON(filePath, conversations, { spaces: 2 });
  } finally {
    release();
  }
}

/**
 * 将临时对话迁移到正式目录
 */
async function moveTempToFormal(userId, sessionId) {
  const lock = getFileLock(userId, sessionId);
  const release = await lock.acquire();

  try {
    const tempFilePath = getTempConvFilePath(userId, sessionId);
    const formalFilePath = path.join(CONFIG.PATH.FORMAL_CONV, `${userId}.json`);

    if (!await fs.pathExists(tempFilePath)) {
      throw new Error('临时对话记录不存在');
    }

    const tempConversations = await fs.readJSON(tempFilePath);
    let formalConversations = [];
    
    if (await fs.pathExists(formalFilePath)) {
      try {
        formalConversations = await fs.readJSON(formalFilePath);
      } catch (err) {
        console.warn(`⚠️  读取正式对话文件失败，重置为空 [${userId}]：`, err.message);
        formalConversations = [];
      }
    }
    
    // 为临时对话添加会话标识，便于区分不同会话
    const tempConversationsWithSession = tempConversations.map(item => ({
      ...item,
      sessionId: sessionId
    }));
    
    const merged = [...formalConversations, ...tempConversationsWithSession];
    const uniqueConversations = Array.from(new Map(merged.map(item => [item.id, item])).values());
    
    await fs.writeJSON(formalFilePath, uniqueConversations, { spaces: 2 });
    await fs.unlink(tempFilePath);
    
    return uniqueConversations;
  } finally {
    release();
  }
}

/**
 * 生成结构化回忆录（仅从临时对话生成）
 */
async function generateMemoirFromTemp(userId, sessionId, oldMemoirContent = null, saveToFile = true) {
  // 新增：参数校验
  if (!userId || !sessionId) throw new Error('userId和sessionId不能为空');
  
  const tempFilePath = getTempConvFilePath(userId, sessionId);
  
  if (!await fs.pathExists(tempFilePath)) {
    throw new Error('暂无临时对话记录，无法生成回忆录');
  }

  const conversations = await fs.readJSON(tempFilePath);
  
  const userContents = conversations
    .filter(item => item.userContent)
    .map(item => item.userContent.trim()) // 新增：去除首尾空格
    .filter(Boolean) // 新增：过滤空内容
    .join('\n');

  if (!userContents) { // 优化：更严格的空值校验
    throw new Error('用户对话记录为空，无法生成回忆录');
  }

  let systemPrompt, userPrompt;
  if (oldMemoirContent) {
    systemPrompt = '你是一位专业的文字编辑，需要结合用户的旧回忆录和新对话内容，重新生成一篇连贯、自然的回忆录。要求：1. 保留旧回忆录的核心内容，2. 融入新对话的信息，3. 语言温馨自然，4. 结构完整，5. 标题可根据内容调整。';
    userPrompt = `旧回忆录内容：\n${oldMemoirContent}\n\n新的用户回忆内容：\n${userContents}\n\n请结合以上内容重新生成一篇回忆录。`;
  } else {
    systemPrompt = '你是一位专业的文字编辑，擅长将零散的回忆整理成优美的回忆录。要求：1. 保留用户的核心记忆点，2. 语言温馨自然，3. 分段合理，4. 标题自拟。';
    userPrompt = `请整理以下用户回忆内容成一篇回忆录：\n${userContents}`;
  }

  const memoirMessages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  const finalMemoir = await callDeepSeekAI(memoirMessages, CONFIG.API.MAX_TOKENS.MEMOIR);
  
  // 新增：回忆录内容长度校验
  if (finalMemoir.length > CONFIG.VALIDATION.MEMOIR_MAX_LENGTH) {
    throw new Error(`生成的回忆录内容过长（${finalMemoir.length}字符），最大支持${CONFIG.VALIDATION.MEMOIR_MAX_LENGTH}字符`);
  }

  const memoirFileName = sanitizeFileName(`${userId}_${sessionId}_${new Date().toISOString().split('T')[0]}.md`); // 新增：会话ID融入文件名
  const memoirFilePath = path.join(CONFIG.PATH.MEMOIR, memoirFileName);
  
  if (saveToFile) {
    // 新增：加锁保护文件写入
    const lock = getFileLock(userId, sessionId);
    const release = await lock.acquire();
    try {
      await fs.writeFile(memoirFilePath, finalMemoir, 'utf8');
    } finally {
      release();
    }
  }

  return {
    content: finalMemoir,
    fileName: memoirFileName,
    filePath: memoirFilePath
  };
}

/**
 * 获取用户所有回忆录列表（修复版：精准匹配+异常防护+详细日志）
 */
async function getUserMemoirs(userId) {
  console.log(`======= 开始获取用户${userId}的回忆录 =======`);
  try {
    // 1. 校验入参
    if (!userId || typeof userId !== 'string') {
      throw new Error(`userId无效：${userId}`);
    }

    // 2. 确认目录路径
    const memoirDir = CONFIG.PATH.MEMOIR;
    console.log(`回忆录目录：${memoirDir}`);

    // 3. 检查目录是否存在（增强版：手动创建目录）
    if (!await fs.pathExists(memoirDir)) {
      console.warn(`回忆录目录不存在，自动创建：${memoirDir}`);
      await fs.ensureDir(memoirDir); // 主动创建目录，避免读取失败
      return [];
    }

    // 4. 读取目录下所有文件（捕获系统级错误）
    let files;
    try {
      files = await fs.readdir(memoirDir);
    } catch (err) {
      throw new Error(`读取目录失败（权限/系统错误）：${err.message}`);
    }
    console.log(`目录下所有文件：`, files);

    // 5. 精准匹配用户文件（修复：以userId_开头 + .md结尾）
    const userIdPrefix = `${sanitizeFileName(userId)}_`; // 统一使用净化后的userId匹配
    const userMemoirFiles = files.filter(file => {
      const isMdFile = file.endsWith('.md');
      const isUserFile = file.startsWith(userIdPrefix);
      console.log(`文件${file}匹配结果：MD文件=${isMdFile}，用户文件=${isUserFile}`);
      return isMdFile && isUserFile;
    }).slice(0, 50);
    console.log(`匹配到的用户文件：`, userMemoirFiles);

    // 6. 处理空文件列表
    if (userMemoirFiles.length === 0) {
      console.log(`用户${userId}无匹配的回忆录文件`);
      return [];
    }

    // 7. 读取文件（逐个处理，避免单个文件错误导致整体失败）
    const memoirs = [];
    for (const file of userMemoirFiles) {
      const filePath = path.join(memoirDir, file);
      console.log(`正在读取文件：${filePath}`);
      
      try {
        // 检查文件状态（排除目录/链接）
        const stats = await fs.stat(filePath);
        if (!stats.isFile()) {
          console.warn(`跳过非文件：${file}`);
          continue;
        }

        // 读取文件内容（限制大小，避免内存溢出）
        const fileSize = stats.size;
        if (fileSize > CONFIG.VALIDATION.MEMOIR_MAX_LENGTH * 2) { // 预留缓冲
          console.warn(`跳过超大文件：${file}（大小：${fileSize}字节）`);
          continue;
        }

        const content = await fs.readFile(filePath, 'utf8');
        console.log(`文件${file}读取成功，内容长度：${content.length}字符`);

        // 验证日期格式（修复排序异常）
        const updateTime = new Date(stats.mtime);
        const createTime = new Date(stats.birthtime);
        if (isNaN(updateTime.getTime()) || isNaN(createTime.getTime())) {
          console.warn(`文件${file}日期无效，使用当前时间`);
          const now = new Date().toISOString();
          memoirs.push({
            fileName: file,
            content: content,
            createTime: now,
            updateTime: now
          });
        } else {
          memoirs.push({
            fileName: file,
            content: content,
            createTime: createTime.toISOString(),
            updateTime: updateTime.toISOString()
          });
        }
      } catch (err) {
        console.error(`读取文件${file}失败：`, err.message);
        continue; // 单个文件失败不影响整体
      }
    }

    // 8. 安全排序（处理无效日期）
    const sortedMemoirs = memoirs.sort((a, b) => {
      const timeA = new Date(a.updateTime).getTime();
      const timeB = new Date(b.updateTime).getTime();
      return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
    });

    console.log(`最终返回回忆录列表：`, sortedMemoirs);
    return sortedMemoirs;
  } catch (err) {
    console.error(`获取用户${userId}回忆录失败（根因）：`, err.stack);
    throw new Error(`获取回忆录列表失败：${err.message}`);
  }
}

// ============================================================
// 【新增】心情分析模块 - 会话管理与情绪分析
// ============================================================

/**
 * 生成会话ID：userId_高精度时间戳
 */
function createSessionId(userId) {
  const now = new Date();
  const dateStr = now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') + 'T' +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0') +
    String(now.getSeconds()).padStart(2, '0') + '.' +
    String(now.getMilliseconds()).padStart(3, '0');
  return `${userId}_${dateStr}`;
}

/**
 * 获取会话文件完整路径
 */
function getSessionFilePath(sessionId) {
  const safeName = sanitizeFileName(sessionId);
  return path.join(CONFIG.PATH.SESSION, `${safeName}.json`);
}

/**
 * 保存单条对话到对应会话文件
 */
async function saveSessionMessage(sessionId, userMsg, aiMsg) {
  const userId = sessionId.split('_')[0];
  const lock = getFileLock(userId, sessionId);
  const release = await lock.acquire();
  try {
    const filePath = getSessionFilePath(sessionId);
    let sessionData = [];
    if (await fs.pathExists(filePath)) {
      try {
        sessionData = await fs.readJSON(filePath);
      } catch {
        sessionData = [];
      }
    }
    sessionData.push({
      msgId: uuidv4(),
      timestamp: new Date().toISOString(),
      userContent: userMsg,
      aiContent: aiMsg
    });
    if (sessionData.length > 100) sessionData = sessionData.slice(-100);
    await fs.writeJSON(filePath, sessionData, { spaces: 2 });
  } finally {
    release();
  }
}

/**
 * 老年人陪伴系统提示词
 */
function getElderSystemPrompt() {
  return `你是专为老年人打造的温情情感陪伴助手，核心要求如下：
1. 说话温柔舒缓，语速平缓，句子简短易懂，不用网络流行词、专业术语、生僻字；
2. 主打倾听与共情，老人倾诉孤单、想念家人、怀旧、身体不适时，先安抚情绪，再慢慢聊天；
3. 主动引导话题：家常往事、年轻时的经历、花草戏曲、养生小常识、儿孙趣事、小时候的回忆；
4. 多耐心陪伴，不打断、不反驳老人，少说教，多共情；
5. 老人沉默时主动抛出温和小问题，拉近距离；
6. 初次见面主动暖心问候，让老人觉得亲切安心；
7. 情绪低落的老人多宽慰，给予温暖陪伴感，不要冷冰冰。`;
}

/**
 * 新会话AI开场问候
 */
async function getFirstGreeting() {
  const messages = [
    { role: 'system', content: getElderSystemPrompt() },
    { role: 'user', content: '你现在第一次和老人打招呼，说一段温柔简短的开场白，主动开启聊天' }
  ];
  return await callDeepSeekAI(messages, 200);
}

/**
 * 读取用户全部会话近48小时内所有对话单条，综合分析两日整体情绪
 * @param {string} userId 用户标识（通常为11位手机号）
 */
async function analyzeUserMood(userId) {
  // 校验userId格式
  if (!/^\d{11}$/.test(userId)) {
    return { success: false, message: 'userId必须为11位手机号' };
  }

  // 48小时时间阈值
  const twoDayMs = 2 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const validCutoff = now - twoDayMs;

  let allSingleMessages = [];
  try {
    // 读取该用户全部会话文件
    const allFiles = await fs.readdir(CONFIG.PATH.SESSION);
    const userSessionFiles = allFiles.filter(file => file.startsWith(`${userId}_`) && file.endsWith('.json'));

    for (const file of userSessionFiles) {
      const filePath = path.join(CONFIG.PATH.SESSION, file);
      let sessionData = [];
      try {
        sessionData = await fs.readJSON(filePath);
      } catch (e) {
        console.warn(`读取会话文件失败 ${file}`, e.message);
        continue;
      }

      // 过滤48小时内、存在用户输入的有效单条消息
      for (const item of sessionData) {
        const msgTime = new Date(item.timestamp).getTime();
        if (msgTime < validCutoff || !item.userContent.trim()) continue;
        allSingleMessages.push({
          userText: item.userContent,
          aiReply: item.aiContent,
          timeMs: msgTime,
          timeStr: item.timestamp
        });
      }
    }
    console.log(`[情绪分析日志] 用户${userId} 48小时内原始有效消息总条数：${allSingleMessages.length}`);
  } catch (err) {
    return { success: false, message: '读取会话数据失败：' + err.message };
  }

  // 全部消息按时间倒序，最新消息排在前面
  allSingleMessages.sort((a, b) => b.timeMs - a.timeMs);
  // 限制最多100条
  const targetMsgList = allSingleMessages.slice(0, 100);
  console.log(`[情绪分析日志] 截取后参与综合分析的消息条数：${targetMsgList.length}`);

  // 无有效对话直接返回无法分析
  if (targetMsgList.length === 0) {
    return {
      success: true,
      dialogCount: 0,
      mood: null,
      suggest: '无法分析用户当前心情'
    };
  }

  // 拼接完整聊天文本
  let allChatText = '';
  targetMsgList.forEach((msg, idx) => {
    allChatText += `【第${idx + 1}条对话｜时间${msg.timeStr}】\n老人发言：${msg.userText}\n助手回复：${msg.aiReply}\n\n`;
  });

  // 客观综合情绪分析提示词
  const analyzePrompt = [
    {
      role: 'system',
      content: `你是老年人客观情绪分析专员，严格遵守全部规则：
1. 下面是老人**近48小时内全部聊天记录**，你需要综合所有对话客观判断老人这两天整体情绪，输出单一简短情绪标签，可选范围：孤单/难过/思念家人/烦躁/平和/开心/焦虑；
2. 必须综合全部内容，不能只看单一句发言，贴合老人两日整体状态，判断保持客观中立；
3. 疏导建议贴合老年人，温和客观、简短实用；
4. 聊天记录过少、信息不足、无法判断整体情绪，直接输出固定文字：无法分析用户当前心情；
5. 禁止主观臆断、禁止编造情绪，信息不足就返回指定文字；
6. 仅返回标准JSON，无任何多余文字，固定格式：{"mood":"情绪标签","suggest":"安抚疏导建议"}`
    },
    { role: 'user', content: `老人近两天全部聊天记录：\n${allChatText}` }
  ];

  // 调用AI分析
  let aiRaw;
  try {
    aiRaw = await callDeepSeekAI(analyzePrompt, CONFIG.API.MAX_TOKENS.MOOD_ANALYZE);
  } catch (e) {
    return { success: false, message: 'AI情绪分析服务异常' };
  }

  // 解析AI返回JSON
  let parseResult;
  try {
    parseResult = JSON.parse(aiRaw);
  } catch {
    return {
      success: true,
      dialogCount: targetMsgList.length,
      mood: null,
      suggest: '无法分析用户当前心情'
    };
  }

  // 校验返回内容合法性
  if (!parseResult.mood || !parseResult.suggest || parseResult.suggest.includes('无法分析')) {
    return {
      success: true,
      dialogCount: targetMsgList.length,
      mood: null,
      suggest: '无法分析用户当前心情'
    };
  }

  return {
    success: true,
    dialogCount: targetMsgList.length,
    mood: parseResult.mood,
    suggest: parseResult.suggest
  };
}







// ========== 接口定义 ==========

/**
 * 生成新会话ID接口（前端首先调用这个接口获取sessionId）
 */
app.post('/api/generate-session', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId不能为空'
      });
    }

    // 修复：等待async函数执行，获取实际的sessionId
    const sessionId = await generateNewSessionId();
    res.json({
      success: true,
      sessionId: sessionId,
      message: '会话ID生成成功'
    });
  } catch (error) {
    console.error(`❌ /api/generate-session 接口异常：`, error.message);
    res.status(500).json({
      success: false,
      message: '生成会话ID失败，请稍后再试'
    });
  }
});

/**
 * 对话接口（保存到临时目录，按会话隔离）
 */
app.post('/api/chat', async (req, res) => {
  try {
    const { userId, sessionId, content } = req.body;

    if (!userId || !sessionId || !content) {
      return res.status(400).json({
        success: false,
        message: 'userId、sessionId和content不能为空'
      });
    }

    if (content.length > CONFIG.VALIDATION.CONTENT_MAX_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `对话内容过长，最大支持${CONFIG.VALIDATION.CONTENT_MAX_LENGTH}字符`
      });
    }

    const chatMessages = [
      { 
        role: 'system', 
        content: '你是一位专业的回忆录引导师，你的任务是引导用户回忆过去的美好时光。请以温和、亲切的语气回应用户，通过提问或回应的方式帮助用户梳理记忆。回应要简洁自然，引导用户进一步回忆，避免使用专业术语。' 
      },
      { role: 'user', content: content }
    ];

    const aiReply = await callDeepSeekAI(chatMessages);
    await saveTempConversation(userId, sessionId, {
      userContent: content,
      aiContent: aiReply
    });

    res.json({
      success: true,
      aiReply
    });
  } catch (error) {
    console.error(`❌ /api/chat 接口异常 [${req.body.userId}_${req.body.sessionId}]：`, error.message);
    res.status(500).json({
      success: false,
      message: '对话处理失败，请稍后再试'
    });
  }
});

/**
 * 录入完成（保存）- 生成回忆录并迁移临时对话
 */
app.post('/api/complete-input', async (req, res) => {
  const { userId, sessionId, oldFileName } = req.body;
  let memoirResult = null;

  try {
    if (!userId || !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'userId和sessionId不能为空'
      });
    }

    // 1. 先生成回忆录
    if (oldFileName) {
      // 编辑模式：基于旧回忆录和新对话生成
      const oldFilePath = path.join(CONFIG.PATH.MEMOIR, oldFileName);
      if (!await fs.pathExists(oldFilePath)) {
        throw new Error('旧回忆录文件不存在');
      }
      const oldMemoirContent = await fs.readFile(oldFilePath, 'utf8');
      memoirResult = await generateMemoirFromTemp(userId, sessionId, oldMemoirContent);
    } else {
      // 新建模式：仅基于新对话生成
      memoirResult = await generateMemoirFromTemp(userId, sessionId);
    }

    // 2. 再迁移临时对话（失败则回滚回忆录文件）
    try {
      await moveTempToFormal(userId, sessionId);
    } catch (moveError) {
      console.error(`❌ 迁移临时对话失败 [${userId}_${sessionId}]：`, moveError.message);
      // 优化：加锁回滚
      if (memoirResult && await fs.pathExists(memoirResult.filePath)) {
        const lock = getFileLock(userId, sessionId);
        const release = await lock.acquire();
        try {
          await fs.unlink(memoirResult.filePath);
        } finally {
          release();
        }
      }
      throw moveError;
    }

    // 3. 如果是编辑模式，替换原文件
    if (oldFileName) {
      const oldFilePath = path.join(CONFIG.PATH.MEMOIR, oldFileName);
      const newFilePath = memoirResult.filePath;
      
      // 加锁替换
      const lock = getFileLock(userId, sessionId);
      const release = await lock.acquire();
      try {
        // 先删除旧文件，再将新文件重命名为旧文件名
        await fs.unlink(oldFilePath);
        await fs.rename(newFilePath, oldFilePath);
        // 更新memoirResult的路径信息
        memoirResult.filePath = oldFilePath;
        memoirResult.fileName = oldFileName;
      } finally {
        release();
      }
    }

    res.json({
      success: true,
      message: oldFileName ? '回忆录更新成功，对话已保存' : '回忆录生成成功，对话已保存',
      memoir: memoirResult.content,
      fileName: memoirResult.fileName,
      filePath: path.relative(__dirname, memoirResult.filePath)
    });
  } catch (error) {
    console.error(`❌ /api/complete-input 接口异常 [${userId}_${sessionId}]：`, error.message);
    // 兜底回滚
    if (memoirResult) {
      try {
        if (await fs.pathExists(memoirResult.filePath)) {
          const lock = getFileLock(userId, sessionId);
          const release = await lock.acquire();
          try {
            await fs.unlink(memoirResult.filePath);
          } finally {
            release();
          }
        }
      } catch (err) {
        console.warn(`⚠️  回滚回忆录文件失败：`, err.message);
      }
    }
    res.status(500).json({
      success: false,
      message: error.message || (oldFileName ? '回忆录更新失败' : '回忆录生成失败')
    });
  }
});

/**
 * 主动放弃保存 - 立即删除临时对话
 */
app.post('/api/abandon-input', async (req, res) => {
  try {
    const { userId, sessionId } = req.body;

    if (!userId || !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'userId和sessionId不能为空'
      });
    }

    const lock = getFileLock(userId, sessionId);
    const release = await lock.acquire();
    try {
      const tempFilePath = getTempConvFilePath(userId, sessionId);
      if (await fs.pathExists(tempFilePath)) {
        await fs.unlink(tempFilePath);
      }
    } finally {
      release();
    }

    res.json({
      success: true,
      message: '已放弃保存，临时对话已删除'
    });
  } catch (error) {
    console.error(`❌ /api/abandon-input 接口异常 [${req.body.userId}_${req.body.sessionId}]：`, error.message);
    res.status(500).json({
      success: false,
      message: '操作失败，请稍后再试'
    });
  }
});

/**
 * 查看用户所有回忆录
 */
app.get('/api/memoirs/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const memoirs = await getUserMemoirs(userId);

    res.json({
      success: true,
      count: memoirs.length,
      memoirs
    });
  } catch (error) {
    console.error(`❌ /api/memoirs 接口异常 [${req.params.userId}]：`, error.message);
    res.status(500).json({
      success: false,
      message: '获取回忆录失败，请稍后再试'
    });
  }
});

/**
 * 删除指定回忆录
 */
app.delete('/api/memoirs/:userId/:fileName', async (req, res) => {
  try {
    const { userId, fileName } = req.params;
    const sanitizedFileName = sanitizeFileName(fileName); // 新增：路径净化

    if (!sanitizedFileName.startsWith(`${userId}_`) || !sanitizedFileName.endsWith('.md')) {
      return res.status(403).json({
        success: false,
        message: '无权删除该文件'
      });
    }

    const filePath = path.join(CONFIG.PATH.MEMOIR, sanitizedFileName);
    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({
        success: false,
        message: '回忆录文件不存在'
      });
    }

    // 从文件名中提取sessionId用于加锁
    const sessionId = sanitizedFileName.split('_')[1] || uuidv4();
    const lock = getFileLock(userId, sessionId);
    const release = await lock.acquire();
    try {
      await fs.unlink(filePath);
    } finally {
      release();
    }

    res.json({
      success: true,
      message: '回忆录删除成功'
    });
  } catch (error) {
    console.error(`❌ /api/memoirs/delete 接口异常 [${req.params.userId}/${req.params.fileName}]：`, error.message);
    res.status(500).json({
      success: false,
      message: '删除回忆录失败，请稍后再试'
    });
  }
});

/**
 * 预览修改后的回忆录（修改功能）
 */
app.post('/api/preview-modify-memoir', async (req, res) => {
  try {
    const { userId, sessionId, oldFileName } = req.body;
    const sanitizedFileName = sanitizeFileName(oldFileName); // 新增：路径净化

    if (!userId || !sessionId || !oldFileName) {
      return res.status(400).json({
        success: false,
        message: 'userId、sessionId和oldFileName不能为空'
      });
    }

    if (!sanitizedFileName.startsWith(`${userId}_`) || !sanitizedFileName.endsWith('.md')) {
      return res.status(403).json({
        success: false,
        message: '无权修改该文件'
      });
    }

    // 校验临时对话是否存在
    const tempFilePath = getTempConvFilePath(userId, sessionId);
    if (!await fs.pathExists(tempFilePath)) {
      return res.status(400).json({
        success: false,
        message: '暂无临时对话记录，无法预览修改后的回忆录'
      });
    }

    const oldFilePath = path.join(CONFIG.PATH.MEMOIR, sanitizedFileName);
    if (!await fs.pathExists(oldFilePath)) {
      return res.status(404).json({
        success: false,
        message: '旧回忆录文件不存在'
      });
    }
    
    const oldMemoirContent = await fs.readFile(oldFilePath, 'utf8');
    const { content: newMemoirContent } = await generateMemoirFromTemp(userId, sessionId, oldMemoirContent, false);

    res.json({
      success: true,
      oldMemoir: oldMemoirContent,
      newMemoir: newMemoirContent
    });
  } catch (error) {
    console.error(`❌ /api/preview-modify-memoir 接口异常 [${req.body.userId}_${req.body.sessionId}]：`, error.message);
    res.status(500).json({
      success: false,
      message: error.message || '预览修改后的回忆录失败，请稍后再试' // 优化：返回具体错误
    });
  }
});

/**
 * 确认保存修改后的回忆录
 */
app.post('/api/save-modified-memoir', async (req, res) => {
  try {
    const { userId, sessionId, oldFileName, newMemoirContent } = req.body;
    const sanitizedFileName = sanitizeFileName(oldFileName); // 新增：路径净化

    if (!userId || !sessionId || !oldFileName || !newMemoirContent) {
      return res.status(400).json({
        success: false,
        message: 'userId、sessionId、oldFileName和newMemoirContent不能为空'
      });
    }

    if (!sanitizedFileName.startsWith(`${userId}_`) || !sanitizedFileName.endsWith('.md')) {
      return res.status(403).json({
        success: false,
        message: '无权修改该文件'
      });
    }

    // 新增：校验临时对话是否存在
    const tempFilePath = getTempConvFilePath(userId, sessionId);
    if (!await fs.pathExists(tempFilePath)) {
      return res.status(400).json({
        success: false,
        message: '暂无临时对话记录，无法保存修改后的回忆录'
      });
    }

    // 优化：使用独立的回忆录长度限制
    if (newMemoirContent.length > CONFIG.VALIDATION.MEMOIR_MAX_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `回忆录内容过长（${newMemoirContent.length}字符），最大支持${CONFIG.VALIDATION.MEMOIR_MAX_LENGTH}字符`
      });
    }

    const oldFilePath = path.join(CONFIG.PATH.MEMOIR, sanitizedFileName);
    if (!await fs.pathExists(oldFilePath)) {
      return res.status(404).json({
        success: false,
        message: '旧回忆录文件不存在'
      });
    }

    // 新增：加锁保存
    const lock = getFileLock(userId, sessionId);
    const release = await lock.acquire();
    try {
      await fs.writeFile(oldFilePath, newMemoirContent, 'utf8');
      await moveTempToFormal(userId, sessionId); // 迁移临时对话
    } finally {
      release();
    }

    res.json({
      success: true,
      message: '回忆录修改并保存成功，新对话已记录',
      updateTime: new Date().toISOString()
    });
  } catch (error) {
    console.error(`❌ /api/save-modified-memoir 接口异常 [${req.body.userId}_${req.body.sessionId}]：`, error.message);
    res.status(500).json({
      success: false,
      message: error.message || '保存修改后的回忆录失败，请稍后再试' // 优化：返回具体错误
    });
  }
});

/**
 * 获取正式保存的对话记录
 */
app.get('/api/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const filePath = path.join(CONFIG.PATH.FORMAL_CONV, `${userId}.json`);

    let conversations = [];
    if (await fs.pathExists(filePath)) {
      try {
        conversations = await fs.readJSON(filePath);
      } catch (err) {
        console.warn(`⚠️  读取正式对话文件失败 [${userId}]：`, err.message);
        conversations = [];
      }
    }

    res.json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error(`❌ /api/conversations 接口异常 [${req.params.userId}]：`, error.message);
    res.status(500).json({
      success: false,
      message: '获取对话记录失败，请稍后再试'
    });
  }
});

// ============================================================
// 聆暖时光 · 主应用扩展接口（登录 / AI情感聊天 / 情感监测 / 社区）
// ============================================================

// ---------- 工具：读写 JSON 文件（带默认值）----------
async function readJsonFile(filePath, defaultVal) {
  try {
    if (await fs.pathExists(filePath)) {
      return await fs.readJSON(filePath);
    }
  } catch (e) {
    console.error('读取JSON失败：', filePath, e.message);
  }
  return defaultVal;
}
async function writeJsonFile(filePath, data) {
  await fs.writeJSON(filePath, data, { spaces: 2 });
}

// ============================================================
// ① 登录 / 注册（文件存储简易账号体系）
// ============================================================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ success: false, message: '手机号和密码不能为空' });
    }
    const userFile = path.join(CONFIG.PATH.USERS, `${phone}.json`);
    const user = await readJsonFile(userFile, null);

    // 账号不存在或密码不匹配 → 仍允许登录（mock 兜底，方便 demo 体验）
    // 规则：188 开头视为志愿者，否则普通用户
    const userType = phone.startsWith('188') ? 'volunteer' : 'user';
    const token = 'token-' + phone + '-' + Date.now();

    const userInfo = {
      phone,
      userName: (user && user.userName) || '测试用户',
      userType
    };

    res.json({
      success: true,
      message: '登录成功',
      data: { token, userInfo }
    });
  } catch (error) {
    console.error('❌ /api/auth/login 异常：', error.message);
    res.status(500).json({ success: false, message: '登录失败，请稍后再试' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { phone, password, userName, userType } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ success: false, message: '手机号和密码不能为空' });
    }
    const userFile = path.join(CONFIG.PATH.USERS, `${phone}.json`);
    const existing = await readJsonFile(userFile, null);
    if (existing) {
      return res.json({ success: false, message: '该手机号已注册' });
    }
    const newUser = {
      phone, password, userName: userName || '新用户',
      userType: userType || 'user', createdAt: new Date().toISOString()
    };
    await writeJsonFile(userFile, newUser);
    res.json({ success: true, message: '注册成功' });
  } catch (error) {
    console.error('❌ /api/auth/register 异常：', error.message);
    res.status(500).json({ success: false, message: '注册失败，请稍后再试' });
  }
});

// ============================================================
// ② AI 情感陪伴聊天（老年人陪伴系统提示词 + 会话持久化）
// ============================================================
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, userId, sessionId, historyMessages = [] } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'message 不能为空' });
    }
    
    // 构建对话消息（带历史上下文）
    const messages = [
      { role: 'system', content: getElderSystemPrompt() }
    ];
    
    // 注入历史消息
    historyMessages.forEach(item => {
      if (item.userContent && item.userContent.trim()) {
        messages.push({ role: 'user', content: item.userContent });
      }
      if (item.aiContent && item.aiContent.trim()) {
        messages.push({ role: 'assistant', content: item.aiContent });
      }
    });
    
    // 添加当前用户消息
    messages.push({ role: 'user', content: message });

    const aiReply = await callDeepSeekAI(messages, CONFIG.API.MAX_TOKENS.CHAT);
    
    // 如果有sessionId，保存到会话文件
    if (sessionId) {
      await saveSessionMessage(sessionId, message, aiReply);
    }
    
    res.json({ success: true, reply: aiReply });
  } catch (error) {
    console.error('❌ /api/ai/chat 异常：', error.message);
    res.status(500).json({ success: false, message: 'AI 回复失败，请稍后再试' });
  }
});

// ---------- 会话管理辅助接口 ----------
app.post('/api/create-session', async (req, res) => {
  try {
    const { userId } = req.body;
    const sessionId = createSessionId(userId);
    const filePath = getSessionFilePath(sessionId);

    const firstAiText = await getFirstGreeting();
    const initData = [
      {
        msgId: uuidv4(),
        timestamp: new Date().toISOString(),
        userContent: "",
        aiContent: firstAiText
      }
    ];
    await fs.writeJSON(filePath, initData, { spaces: 2 });

    res.json({
      success: true,
      sessionId,
      firstGreeting: firstAiText,
      message: '新会话创建成功，AI已主动发起问候'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: '创建会话失败：' + err.message });
  }
});

app.get('/api/get-session-list/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const allFiles = await fs.readdir(CONFIG.PATH.SESSION);
    const userSessionFiles = allFiles.filter(file => file.startsWith(`${userId}_`) && file.endsWith('.json'));
    const sessionList = [];
    for (const file of userSessionFiles) {
      const sId = file.replace('.json', '');
      const filePath = path.join(CONFIG.PATH.SESSION, file);
      const stats = await fs.stat(filePath);
      const createTime = stats.birthtime.toISOString();
      const updateTime = stats.mtime.toISOString();
      let title = '暖心陪伴会话';
      try {
        const data = await fs.readJSON(filePath);
        const firstUserMsg = data.find(item => item.userContent.trim() !== "");
        if (firstUserMsg) title = firstUserMsg.userContent.slice(0, 12) + '...';
      } catch {}
      sessionList.push({ sessionId: sId, title, createTime, updateTime });
    }
    sessionList.sort((a, b) => new Date(b.updateTime) - new Date(a.updateTime));
    res.json({ success: true, list: sessionList });
  } catch (err) {
    res.status(500).json({ success: false, message: '读取会话列表失败：' + err.message });
  }
});

app.post('/api/load-session', async (req, res) => {
  try {
    const { sessionId } = req.body;
    const filePath = getSessionFilePath(sessionId);
    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({ success: false, message: '该会话不存在' });
    }
    const data = await fs.readJSON(filePath);
    res.json({ success: true, messages: data });
  } catch (err) {
    res.status(500).json({ success: false, message: '加载会话失败：' + err.message });
  }
});

app.delete('/api/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const filePath = getSessionFilePath(sessionId);
    if (await fs.pathExists(filePath)) await fs.unlink(filePath);
    res.json({ success: true, message: '会话已删除' });
  } catch (err) {
    res.status(500).json({ success: false, message: '删除失败' });
  }
});

// ============================================================
// ③ 情感监测报告 / 心情分析（基于真实对话数据的AI情绪分析）
// ============================================================
app.get('/api/emotion/summary', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ success: false, message: '缺少userId参数' });
    }
    const result = await analyzeUserMood(userId);
    
    // 包装为前端兼容的格式
    if (result.success && result.mood) {
      res.json({
        success: true,
        data: {
          currentMood: result.mood,
          suggest: result.suggest,
          dialogCount: result.dialogCount,
          analyzedAt: new Date().toISOString()
        }
      });
    } else {
      res.json({
        success: true,
        data: {
          currentMood: null,
          suggest: result.suggest || '无法分析用户当前心情',
          dialogCount: result.dialogCount || 0
        }
      });
    }
  } catch (error) {
    console.error('❌ /api/emotion/summary 异常：', error.message);
    res.status(500).json({ success: false, message: '获取情感报告失败' });
  }
});

/**
 * 独立心情分析接口（POST方式，返回原始分析结果）
 */
app.post('/api/analyze-user-mood', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: '请求缺少userId参数' });
    }
    const result = await analyzeUserMood(userId);
    res.json(result);
  } catch (error) {
    console.error('❌ /api/analyze-user-mood 异常：', error.message);
    res.status(500).json({ success: false, message: '心情分析服务异常' });
  }
});

// ============================================================
// ④ 社区（帖子 / 点赞 / 评论，文件存储）
// ============================================================
app.get('/api/community/posts', async (req, res) => {
  try {
    const postFile = path.join(CONFIG.PATH.COMMUNITY, 'posts.json');
    const posts = await readJsonFile(postFile, []);
    res.json({ success: true, data: posts });
  } catch (error) {
    console.error('❌ /api/community/posts 异常：', error.message);
    res.status(500).json({ success: false, message: '获取帖子失败' });
  }
});

app.post('/api/community/publish', async (req, res) => {
  try {
    const { author, content, category } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, message: '内容不能为空' });
    }
    const postFile = path.join(CONFIG.PATH.COMMUNITY, 'posts.json');
    const posts = await readJsonFile(postFile, []);
    const newPost = {
      id: 'p' + Date.now(),
      author: author || '匿名',
      avatar: '',
      content,
      category: category || '交流',
      likes: 0,
      liked: false,
      comments: [],
      createTime: new Date().toISOString()
    };
    posts.unshift(newPost);
    await writeJsonFile(postFile, posts);
    res.json({ success: true, message: '发布成功', data: newPost });
  } catch (error) {
    console.error('❌ /api/community/publish 异常：', error.message);
    res.status(500).json({ success: false, message: '发布失败' });
  }
});

app.post('/api/community/like', async (req, res) => {
  try {
    const { postId } = req.body;
    const postFile = path.join(CONFIG.PATH.COMMUNITY, 'posts.json');
    const posts = await readJsonFile(postFile, []);
    const post = posts.find(p => p.id === postId);
    if (!post) {
      return res.status(404).json({ success: false, message: '帖子不存在' });
    }
    post.liked = !post.liked;
    post.likes += post.liked ? 1 : -1;
    await writeJsonFile(postFile, posts);
    res.json({ success: true, data: { likes: post.likes, liked: post.liked } });
  } catch (error) {
    console.error('❌ /api/community/like 异常：', error.message);
    res.status(500).json({ success: false, message: '操作失败' });
  }
});

// ============================================================
// ⑤ 用户档案（志愿者端管理老人档案）
// ============================================================
app.get('/api/user/profiles', async (req, res) => {
  try {
    const profileFile = path.join(CONFIG.PATH.USERS, 'profiles.json');
    const profiles = await readJsonFile(profileFile, []);
    res.json({ success: true, data: profiles });
  } catch (error) {
    console.error('❌ /api/user/profiles 异常：', error.message);
    res.status(500).json({ success: false, message: '获取档案失败' });
  }
});

app.post('/api/user/create-profile', async (req, res) => {
  try {
    const profileFile = path.join(CONFIG.PATH.USERS, 'profiles.json');
    const profiles = await readJsonFile(profileFile, []);
    const newProfile = {
      id: 'u' + Date.now(),
      ...req.body,
      createTime: new Date().toISOString()
    };
    profiles.push(newProfile);
    await writeJsonFile(profileFile, profiles);
    res.json({ success: true, message: '创建成功', data: newProfile });
  } catch (error) {
    console.error('❌ /api/user/create-profile 异常：', error.message);
    res.status(500).json({ success: false, message: '创建失败' });
  }
});

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error(`❌ 全局异常 [${req.path}]：`, err.stack);
  res.status(500).json({
    success: false,
    message: '服务器内部错误，请稍后再试'
  });
});

// 启动服务
app.listen(PORT, () => {
  console.log(`✅ 服务器运行在 http://localhost:${PORT}`);
  console.log(`📁 临时对话保存路径：${CONFIG.PATH.TEMP_CONV}`);
  console.log(`📁 正式对话保存路径：${CONFIG.PATH.FORMAL_CONV}`);
  console.log(`📁 回忆录保存路径：${CONFIG.PATH.MEMOIR}`);
  console.log(`📁 AI陪伴会话保存路径：${CONFIG.PATH.SESSION}`);
  console.log(`💡 心情分析接口：POST /api/analyze-user-mood | GET /api/emotion/summary?userId=xxx`);
});