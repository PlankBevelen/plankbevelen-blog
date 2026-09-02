import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import { getDb } from '../../../utils/mongo'
import { updateSiteContent } from '../../../utils/site-content'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const db = getDb()
    const content = await updateSiteContent(body, db)

    setResponseStatus(event, 200)
    return {
      status: 200,
      msg: 'success',
      data: {
        ...content.data,
        updatedAt: content.updatedAt || null
      }
    }
  } catch (error) {
    setResponseStatus(event, 500)
    return { status: 500, msg: 'server error', data: null }
  }
})
