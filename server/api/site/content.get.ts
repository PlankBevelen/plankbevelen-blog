import { defineEventHandler, setResponseStatus } from 'h3'
import { getDb } from '../../utils/mongo'
import { renderMarkdown } from '../../utils/markdown'
import { getSiteContent } from '../../utils/site-content'
import type { SiteLocalizedText } from '../../utils/site-content'

function renderLocalizedMarkdown(text: SiteLocalizedText): SiteLocalizedText {
  return {
    zh: renderMarkdown(text?.zh || ''),
    en: renderMarkdown(text?.en || ''),
  }
}

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
        about: renderLocalizedMarkdown(content.data.about),
        pages: {
          about: renderLocalizedMarkdown(content.data.pages.about),
          timeline: renderLocalizedMarkdown(content.data.pages.timeline),
          project: renderLocalizedMarkdown(content.data.pages.project),
        },
        updatedAt: content.updatedAt || null
      }
    }
  } catch (error) {
    setResponseStatus(event, 500)
    return { status: 500, msg: 'server error', data: null }
  }
})
