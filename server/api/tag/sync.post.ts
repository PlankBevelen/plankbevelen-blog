import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import { execute, query } from '../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{ add?: string[]; remove?: string[] }>(event)
    const add = Array.isArray(body?.add) ? body!.add : []
    const remove = Array.isArray(body?.remove) ? body!.remove : []

    const normalize = (arr: string[]) => Array.from(new Set(arr.map((t) => String(t).replace(/，/g, ',').trim()).filter(Boolean)))
    const addTags = normalize(add)
    const removeTags = normalize(remove)

    for (const tag of addTags) {
      await execute('INSERT INTO `tags` (`name`, `count`) VALUES (?, 0) ON DUPLICATE KEY UPDATE `name`=`name`', [tag])
    }
    for (const tag of removeTags) {
      await execute('DELETE FROM `tags` WHERE `name` = ? AND `count` <= 0', [tag])
    }

    setResponseStatus(event, 200)
    return { status: 200, msg: '同步成功', data: { add: addTags.length, remove: removeTags.length } }
  } catch (error) {
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误', data: null }
  }
})

