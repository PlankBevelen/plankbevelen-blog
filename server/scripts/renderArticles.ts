import { getDb, getCollections, closeDB } from '../utils/mongo'
import { normalizeUploadsInContent } from '../utils/content'
import { compileArticle } from '../modules/article/reading'

/** 给已有文章补上 html、excerpt、cover、toc。只跑一次。 */
async function main() {
  const db = getDb()
  const { articles } = getCollections(db)
  const cursor = articles.find({
    $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
  })
  let count = 0
  for await (const doc of cursor) {
    const content = normalizeUploadsInContent(String(doc.content || ''))
    const reading = compileArticle(content)
    await articles.updateOne({ id: doc.id }, { $set: { content, ...reading } })
    count += 1
  }
  console.log(`rendered ${count} articles`)
  await closeDB()
}

main().catch(async (error) => {
  console.error(error)
  await closeDB().catch(() => undefined)
  process.exit(1)
})
