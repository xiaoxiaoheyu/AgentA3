/**
 * 修复少量历史数据中“UTF-8 字节被按 Latin-1 解码”产生的乱码。
 * 正常中文不命中特征字符时原样返回；修复失败也原样返回。
 */
export function repairMojibake(value) {
  if (typeof value !== 'string' || !value) return value
  // 常见乱码片段：æµ‹è¯•、å­¦æ ¡、â€¦ 等。
  if (!/[ÃÂÆæåçèéêëìíîïðñòóôõöøùúûüýþÿâ]/.test(value)) return value
  try {
    // 浏览器可能先按 Windows-1252 解码，导致 0x80-0x9F 字节显示成 ‹、” 等符号。
    const cp1252 = {
      '€': 0x80, '‚': 0x82, 'ƒ': 0x83, '„': 0x84, '…': 0x85, '†': 0x86, '‡': 0x87,
      'ˆ': 0x88, '‰': 0x89, 'Š': 0x8a, '‹': 0x8b, 'Œ': 0x8c, 'Ž': 0x8e,
      '‘': 0x91, '’': 0x92, '“': 0x93, '”': 0x94, '•': 0x95, '–': 0x96, '—': 0x97,
      '™': 0x99, 'š': 0x9a, '›': 0x9b, 'œ': 0x9c, 'ž': 0x9e, 'Ÿ': 0x9f
    }
    const bytes = Array.from(value, char => cp1252[char] ?? char.charCodeAt(0) & 0xff)
      .map(byte => `%${byte.toString(16).padStart(2, '0')}`)
      .join('')
    const repaired = decodeURIComponent(bytes)
    return repaired && repaired !== value ? repaired : value
  } catch (error) {
    return value
  }
}

// 系统内置话题的 ID 固定，优先使用代码中的标准名称，避免历史乱码数据影响界面。
export const BUILTIN_TOPIC_NAMES = Object.freeze({
  1: '热门',
  2: '最新',
  3: '📢公告',
  4: '💰集市',
  5: '😊求助',
  6: '🔑失物',
  7: '💕表白',
  8: '🍟美食',
  9: '🤝搭子',
  10: '📚学习资料',
  11: '🌸影忆青春'
})

export function repairTopicName(id, value) {
  return BUILTIN_TOPIC_NAMES[id] || repairMojibake(value)
}
