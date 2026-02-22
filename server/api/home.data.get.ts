import { setResponseStatus, defineEventHandler } from 'h3'
import { query } from '../utils/db'
import { promises as fs } from 'node:fs'
import path from 'node:path'

async function getArticles(limit: number, sort: 'created' | 'updated' = 'updated') {
  const orderBy = sort === 'created'
    ? 'ORDER BY a.created_at DESC, a.id DESC'
    : 'ORDER BY a.updated_at DESC, a.created_at DESC, a.id DESC'
    
  const sql = `
    SELECT a.id, a.title, a.tags, a.file_path, a.created_at, a.updated_at, a.category_id, c.name AS category_name
    FROM articles a
    LEFT JOIN categories c ON a.category_id = c.id
    ${orderBy}
    LIMIT ?
  `
  
  const rows = await query<any>(sql, [limit])
  
  return Promise.all((rows || []).map(async (r: any) => {
      let content = ''
      const filePath = String(r.file_path || '')
      if (filePath) {
        const absPath = path.join(process.cwd(), 'public', filePath.replace(/^\//, ''))
        try {
          content = await fs.readFile(absPath, 'utf-8')
        } catch (e) {
          content = ''
        }
      }
      return {
        id: String(r.id),
        title: r.title,
        tags: (r.tags || '').split(',').filter((t: string) => !!t),
        category: r.category_name || '',
        content, 
        createTime: r.created_at,
        updateTime: r.updated_at,
      }
    }))
}

export default defineEventHandler(async (event) => {  
  try {
    // Parallel execution for better performance and reliability (no loopback http calls)
    const [articles, categories, tags, latestArticlesRaw, articleCountRes] = await Promise.all([
      getArticles(10, 'updated'),
      query<any>('SELECT * FROM categories'),
      query<any>('SELECT `name`, `count` FROM `tags` ORDER BY `count` DESC, `name` ASC'),
      getArticles(5, 'created'),
      query<any>('SELECT COUNT(*) as total FROM articles')
    ])

    const articleCount = Number(articleCountRes?.[0]?.total || 0)
    
    const latestArticles = latestArticlesRaw.map((r: any) => ({
      title: r.title,
      category: r.category,
      createTime: r.createTime,
      id: r.id
    }))

    setResponseStatus(event, 200)
    return {
      status: 200,
      msg: '查询成功',
      data: {
        articles,
        categories: categories || [],
        tags: tags || [],
        latestArticles,
        stats: {
          articles: articleCount,
          categories: (categories || []).length,
          tags: (tags || []).length,
        }
      }
    }
  } catch (error: any) {
    console.error('Home data error:', error)
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误: ' + (error?.message || '未知错误'), data: null }
  }
})
