import { defineEventHandler, setResponseStatus } from 'h3'
import { getDb } from '../../utils/mongo'
import { getSiteContent } from '../../utils/site-content'

export default defineEventHandler(async (event) => {
  try {
    const db = getDb()
    const content = await getSiteContent(db)

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
